import { v4 as uuid4 } from 'uuid';
import type { TravisBackendMessageDomainViewModelsConversationMessageResponseViewModel } from '@sleekflow/sleekflow-core-typescript-rxjs-apis';
import {
  ConversationApi,
  ConversationMessageApi,
} from '@sleekflow/sleekflow-core-typescript-rxjs-apis';
import { inject, injectable } from 'inversify';
import flatten from 'lodash/flatten';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  concatMap,
  EMPTY,
  filter,
  finalize,
  from,
  groupBy,
  map,
  mergeMap,
  Observable,
  Subject,
  switchMap,
  take,
  tap,
  throwError,
  timer,
  withLatestFrom,
} from 'rxjs';
import { ajax } from 'rxjs/ajax';

import { ExtendedMessageType } from '@/api/types';
import { AUDIO_TYPES } from '@/pages/Inbox/ConversationInput';
import { MessagingChannel, Staff } from '@/services/companies/company.service';
import type { UnifiedMessage } from '@/services/conversation-inputs/my-conversation-input-view-model';
import { ConversationMessageWrapperManagerService } from '@/services/conversation-messages/managers/conversation-message-wrapper-manager.service';
import { I18nService } from '@/services/i18n/i18n.service';
import { SendingMessage } from '@/services/persistences/sf-dexie';
import { RxjsUtils } from '@/services/rxjs-utils/rxjs-utils';
import { ToastMessagesService } from '@/services/toast-messages/toast-messages.service';
import { UserService } from '@/services/user.service';
import { isAjaxError } from '@/utils/ts-utils';
import { LogService } from '@/services/logs/log.service';

const isNetworkError = (error: unknown) =>
  typeof error === 'object' &&
  error !== null &&
  'status' in error &&
  error.status === 0;

@injectable()
export class SendingConversationMessageManager {
  private readonly sentMessage$$ =
    new Subject<TravisBackendMessageDomainViewModelsConversationMessageResponseViewModel>();

  private readonly sendingMessages$$ = new Subject<SendingMessage>();

  // Track sending messages by their messageChecksum
  private readonly sendingMessagesMap$$ = new BehaviorSubject<
    Record<string, SendingMessage>
  >({});

  constructor(
    @inject(ConversationApi)
    private conversationApi: ConversationApi,
    @inject(UserService)
    private userService: UserService,
    @inject(ConversationMessageApi)
    private conversationMessageApi: ConversationMessageApi,
    @inject(ConversationMessageWrapperManagerService)
    private conversationMessageWrapperManagerService: ConversationMessageWrapperManagerService,
    @inject(ToastMessagesService)
    private toastMessagesService: ToastMessagesService,
    @inject(I18nService)
    private i18nService: I18nService,
    @inject(LogService)
    private logService: LogService,
  ) {
    // Setup beforeunload event listener management
    // When there are pending messages, we want to prevent accidental navigation
    this.setupBeforeUnloadListener();

    this.sendingMessages$$
      .pipe(
        groupBy((sendingMessage) => sendingMessage.conversationId),
        mergeMap((group) =>
          group.pipe(
            withLatestFrom(this.userService.getMyStaff$()),
            concatMap(([sendingMessage, myStaff]) =>
              this.sendMessage$(
                sendingMessage,
                myStaff,
                sendingMessage.messagingChannel,
                sendingMessage.unifiedMessage,
                sendingMessage.conversationId,
                sendingMessage.messageChecksum,
                sendingMessage.messageGroupName,
                sendingMessage.scheduleSentAt,
              ).pipe(
                take(1),
                tap(([, , responses]) =>
                  responses.forEach((resp) => this.sentMessage$$.next(resp)),
                ),
                finalize(() =>
                  this.removeFromSendingMessagesMap(
                    sendingMessage.messageChecksum,
                  ),
                ),
                catchError((error) => {
                  this.markSendingMessageAsFailed(
                    sendingMessage.messageChecksum,
                  );

                  const getSendingMessageErrorMeta = () => ({
                    ...sendingMessage,
                    unifiedMessage: JSON.stringify(
                      sendingMessage.unifiedMessage,
                      null,
                      2,
                    ),
                  });

                  // FE errors are not expected, so we should capture them to Sentry
                  if (!isAjaxError(error)) {
                    this.toastMessagesService.showToastMessage(
                      'error',
                      this.i18nService.t(
                        'sending-conversation-message-manager.error.failed-to-send-message',
                        'Failed to send a message. Please refresh the page and try again',
                      ),
                    );
                    this.logService.critical(error, {
                      tags: {
                        send_message_error: 'client_side',
                      },
                      extra: getSendingMessageErrorMeta(),
                    });
                    return EMPTY;
                  }

                  if (isNetworkError(error)) {
                    this.toastMessagesService.showToastMessage(
                      'error',
                      this.i18nService.t(
                        'sending-conversation-message-manager.error.you-are-offline',
                        'Failed to send a message because you are currently offline',
                      ),
                    );
                    return EMPTY;
                  }

                  this.toastMessagesService.showToastMessage(
                    'error',
                    this.i18nService.t(
                      'sending-conversation-message-manager.error.failed-to-send-message',
                      'Failed to send a message. Please refresh the page and try again',
                    ),
                  );

                  // Unhandled errors should be captured to Sentry for further investigation
                  // TODO: refine error handling
                  this.logService.critical(error, {
                    tags: {
                      send_message_error: 'server_side',
                      send_message_error_api_status: error.status,
                    },
                    extra: {
                      ...getSendingMessageErrorMeta(),
                      request: error.request,
                      response: error.response,
                      status: error.status,
                    },
                  });

                  return EMPTY;
                }),
              ),
            ),
          ),
        ),
      )
      .subscribe();
  }

  private markSendingMessageAsFailed(messageChecksum: string) {
    // Try to find and update the message wrapper, with up to 3 retries
    // with 1 second delay between attempts
    let retryCount = 0;
    const maxRetries = 3;
    const retryDelay = 1000;

    const attemptUpdate = () => {
      const messageWrapper =
        this.conversationMessageWrapperManagerService.getConversationMessageWrapper(
          messageChecksum,
        );

      if (messageWrapper) {
        // If message wrapper is found, update its status and stop retrying
        messageWrapper.onNextStatus('Failed');
        return true; // Successfully updated
      }

      // Message wrapper not found yet
      retryCount++;
      if (retryCount >= maxRetries) {
        return true; // Stop retrying after max attempts
      }

      // Schedule another attempt after delay
      setTimeout(attemptUpdate, retryDelay);
      return false; // Not done yet
    };

    // Start the first attempt
    attemptUpdate();
  }

  private sendMessage$(
    sendingMessage: SendingMessage,
    myStaff: Staff,
    messagingChannel: '' | MessagingChannel,
    unifiedMessage: UnifiedMessage,
    conversationId: string,
    messageChecksum: string,
    messageGroupName: string,
    scheduleSentAt: string | undefined,
  ) {
    const commonRetryPipeOperators = (
      source: Observable<
        TravisBackendMessageDomainViewModelsConversationMessageResponseViewModel[]
      >,
    ) =>
      source.pipe(
        map(
          (
            resp: TravisBackendMessageDomainViewModelsConversationMessageResponseViewModel[],
          ) => {
            return [sendingMessage, myStaff, resp] as const;
          },
        ),

        // retry 3 times until failure except known cases
        RxjsUtils.getRetryAPIRequest({
          delay: (error) => {
            if (!isAjaxError(error) || isNetworkError(error)) {
              return throwError(() => error);
            }

            if (
              error.response?.code !== undefined &&
              this.handleKnownError(error.response.code)
            ) {
              return throwError(() => error);
            }

            // delay 1000ms before retry
            return timer(1000);
          },
        }),
      );

    if (messagingChannel !== '' && messagingChannel.channelType === 'note') {
      // Need to remove all the markup from react-mentions '@[__display__](__id__)' in the text
      // and finally get only the display text
      const text = unifiedMessage.text.replace(/@\[(.*?)]\(.*?\)/g, '$1');

      // TODO: Combine savedReply and attachments conditions when working on DEVS-9611,
      // Need backend support to allow files, fileUrls and fileNames fields in request body simultaneously
      if (unifiedMessage.savedReply) {
        return this.conversationApi
          .conversationNoteConversationIdPost({
            conversationId: conversationId,
            messageChecksum,
            channel: 'note',
            messageGroupName,
            assigneeId: unifiedMessage.mentionedStaffIdentityId,
            messageType: 'file',
            messageContent: text,
            fileUrls:
              unifiedMessage.savedReply.attachment &&
              unifiedMessage.savedReply.attachment.url
                ? [unifiedMessage.savedReply.attachment.url]
                : [],
            fileNames:
              unifiedMessage.savedReply.attachment &&
              unifiedMessage.savedReply.attachment.filename
                ? [unifiedMessage.savedReply.attachment.filename]
                : [],
          })
          .pipe(
            map((resp) => [resp]),
            commonRetryPipeOperators,
          );
      }

      if (unifiedMessage.attachments) {
        return this.conversationApi
          .conversationNoteConversationIdPost({
            conversationId: conversationId,
            messageChecksum,
            channel: 'note',
            messageGroupName,
            assigneeId: unifiedMessage.mentionedStaffIdentityId,
            messageType: 'file',
            messageContent: text,
            files: unifiedMessage.attachments.map((attachment) => {
              return attachment.blob;
            }),
          })
          .pipe(
            map((resp) => [resp]),
            commonRetryPipeOperators,
          );
      }

      if (unifiedMessage.audio) {
        if (!unifiedMessage.audio) {
          return throwError(() => new Error('Audio is not selected'));
        }

        const getAudioFile = () => {
          const audioBlob = unifiedMessage.audio!;

          const blobType = audioBlob.type;

          const fileExtension = AUDIO_TYPES[blobType]?.extension ?? 'bin';
          const audioFile = new File([audioBlob], `voice.${fileExtension}`, {
            type: blobType,
          });
          return audioFile;
        };

        return this.conversationApi
          .conversationNoteConversationIdPost({
            conversationId: conversationId,
            messageChecksum,
            channel: 'note',
            messageGroupName,
            assigneeId: unifiedMessage.mentionedStaffIdentityId,

            messageType: 'file',
            files: [getAudioFile()],
          })
          .pipe(
            map((resp) => [resp]),
            commonRetryPipeOperators,
          );
      }

      return this.conversationApi
        .conversationNoteConversationIdPost({
          conversationId: conversationId,
          messageChecksum,
          channel: 'note',
          messageGroupName,
          assigneeId: unifiedMessage.mentionedStaffIdentityId,

          messageType: 'text',
          messageContent: text,
        })
        .pipe(
          map((resp) => [resp]),
          commonRetryPipeOperators,
        );
    }

    if (unifiedMessage.savedReply) {
      if (messagingChannel == '') {
        return throwError(() => new Error('Messaging channel is not selected'));
      }

      return this.conversationMessageApi
        .conversationMessagesSendMessagePost({
          travisBackendMessageDomainViewModelsExtendedConversationMessageViewModel:
            {
              conversationId: conversationId,
              messageChecksum,
              channel: messagingChannel.channelType,
              channelIdentityId:
                messagingChannel.channelIdentityId === null
                  ? undefined
                  : messagingChannel.channelIdentityId,
              files: [],
              quotedMsgId: unifiedMessage.quotedMessageId,
              messageType: 'text',
              fileURLs:
                unifiedMessage.savedReply.attachment &&
                unifiedMessage.savedReply.attachment.url
                  ? [unifiedMessage.savedReply.attachment.url]
                  : [],
              messageContent: unifiedMessage.text,

              // Only when there is attachment, we need to send quickReplyId
              quickReplyId: unifiedMessage.savedReply.attachment
                ? unifiedMessage.savedReply.id
                : undefined,
              scheduleSentAt: scheduleSentAt,
              messageTag: unifiedMessage.facebook?.messageTag,
            },
        })
        .pipe(commonRetryPipeOperators);
    }

    if (
      (unifiedMessage.commerceHub.sharedLineItems &&
        unifiedMessage.commerceHub.sharedLineItems.length > 0) ||
      (unifiedMessage.shopify.sharedLineItems &&
        unifiedMessage.shopify.sharedLineItems.length > 0)
    ) {
      if (messagingChannel == '') {
        return throwError(() => new Error('Messaging channel is not selected'));
      }

      const sharedLineItems =
        unifiedMessage.commerceHub.sharedLineItems ||
        unifiedMessage.shopify.sharedLineItems;

      const observables = sharedLineItems!.map((lineItem, idx) => {
        if (lineItem.coverImageUrl) {
          return ajax({
            url: lineItem.coverImageUrl,
            responseType: 'blob',
          }).pipe(
            map((blob) => {
              return blob.response as Blob;
            }),
            switchMap((blob) => {
              return this.conversationMessageApi
                .conversationMessagesSendFileMessagePost({
                  conversationId: conversationId,
                  messageChecksum: idx === 0 ? messageChecksum : uuid4(),
                  channel: messagingChannel.channelType,
                  channelIdentityId:
                    messagingChannel.channelIdentityId === null
                      ? undefined
                      : messagingChannel.channelIdentityId,
                  messageType: 'file',
                  messageContent: lineItem.messagePreview,
                  files: [blob],
                  scheduleSentAt: scheduleSentAt,
                  messageTag: unifiedMessage.facebook?.messageTag,
                })
                .pipe(commonRetryPipeOperators);
            }),
          );
        }

        return this.conversationMessageApi
          .conversationMessagesSendMessagePost({
            travisBackendMessageDomainViewModelsExtendedConversationMessageViewModel:
              {
                conversationId: conversationId,
                messageChecksum: idx === 0 ? messageChecksum : uuid4(),
                channel: messagingChannel.channelType,
                channelIdentityId:
                  messagingChannel.channelIdentityId === null
                    ? undefined
                    : messagingChannel.channelIdentityId,
                messageType: 'file',
                messageContent: lineItem.messagePreview,
                fileURLs: [lineItem.coverImageUrl],
                fileNames: [uuid4()],
                scheduleSentAt: scheduleSentAt,
                messageTag: unifiedMessage.facebook?.messageTag,
              },
          })
          .pipe(commonRetryPipeOperators);
      });

      return combineLatest(observables).pipe(
        map((tuples) => {
          const respArrays = tuples.map((tuple) => tuple[2]);
          const arr = flatten(respArrays);

          return [sendingMessage, myStaff, arr] as const;
        }),
      );
    }

    if (unifiedMessage.whatsappCloudApi?.templateMessage) {
      if (messagingChannel == '') {
        return throwError(() => new Error('Messaging channel is not selected'));
      }

      return this.conversationMessageApi
        .conversationMessagesSendMessagePost({
          travisBackendMessageDomainViewModelsExtendedConversationMessageViewModel:
            {
              conversationId: conversationId,
              messageChecksum,
              channel: messagingChannel.channelType,
              channelIdentityId:
                messagingChannel.channelIdentityId === null
                  ? undefined
                  : messagingChannel.channelIdentityId,
              messageType: 'template',
              extendedMessagePayload: {
                channel: messagingChannel.channelType,
                extendedMessageType: 101,
                extendedMessagePayloadDetail: {
                  whatsappCloudApiTemplateMessageObject:
                    unifiedMessage.whatsappCloudApi.templateMessage,
                },
              },
              messageContent: unifiedMessage.text,
              scheduleSentAt: scheduleSentAt,
              messageTag: unifiedMessage.facebook?.messageTag,
            },
        })
        .pipe(commonRetryPipeOperators);
    }

    if (unifiedMessage.whatsapp360Dialog?.templateMessage) {
      if (messagingChannel == '') {
        return throwError(() => new Error('Messaging channel is not selected'));
      }

      return this.conversationMessageApi
        .conversationMessagesSendMessagePost({
          travisBackendMessageDomainViewModelsExtendedConversationMessageViewModel:
            {
              conversationId: conversationId,
              messageChecksum,
              channel: messagingChannel.channelType,
              channelIdentityId:
                messagingChannel.channelIdentityId === null
                  ? undefined
                  : messagingChannel.channelIdentityId,
              messageType: 'template',
              whatsapp360DialogExtendedMessagePayload: {
                whatsapp360DialogTemplateMessage:
                  unifiedMessage.whatsapp360Dialog.templateMessage,
              },
              messageContent: unifiedMessage.text,
              scheduleSentAt: scheduleSentAt,
              messageTag: unifiedMessage.facebook?.messageTag,
            },
        })
        .pipe(commonRetryPipeOperators);
    }

    if (unifiedMessage.whatsappTwilio?.templateMessage) {
      if (messagingChannel == '') {
        return throwError(() => new Error('Messaging channel is not selected'));
      }

      return this.conversationMessageApi
        .conversationMessagesSendMessagePost({
          travisBackendMessageDomainViewModelsExtendedConversationMessageViewModel:
            {
              messageType: 'text',
              messageContent: unifiedMessage.text,
              extendedMessagePayload: {
                extendedMessageType:
                  ExtendedMessageType.WhatsappTwilioContentTemplateMessage,
                extendedMessagePayloadDetail: {
                  whatsappTwilioContentApiObject:
                    unifiedMessage.whatsappTwilio.templateMessage,
                },
              },
              conversationId: conversationId,
              messageChecksum,
              channel: messagingChannel.channelType,
              channelIdentityId:
                messagingChannel.channelIdentityId === null
                  ? undefined
                  : messagingChannel.channelIdentityId,
              scheduleSentAt: scheduleSentAt,
              messageTag: unifiedMessage.facebook?.messageTag,
            },
        })
        .pipe(commonRetryPipeOperators);
    }

    if (unifiedMessage.whatsappCloudApi?.interactiveMessage) {
      if (messagingChannel == '') {
        return throwError(() => new Error('Messaging channel is not selected'));
      }
      return this.conversationMessageApi
        .conversationMessagesSendMessagePost({
          travisBackendMessageDomainViewModelsExtendedConversationMessageViewModel:
            {
              conversationId: conversationId,
              messageChecksum,
              channel: messagingChannel.channelType,
              channelIdentityId:
                messagingChannel.channelIdentityId === null
                  ? undefined
                  : messagingChannel.channelIdentityId,
              messageType: 'interactive',
              extendedMessagePayload: {
                channel: messagingChannel.channelType,
                extendedMessageType: 102,
                extendedMessagePayloadDetail: {
                  whatsappCloudApiInteractiveObject:
                    unifiedMessage.whatsappCloudApi.interactiveMessage,
                },
              },
              messageContent: unifiedMessage.text,
              scheduleSentAt: scheduleSentAt,
              messageTag: unifiedMessage.facebook?.messageTag,
            },
        })
        .pipe(commonRetryPipeOperators);
    }

    if (unifiedMessage.whatsapp360Dialog?.interactiveMessage) {
      if (messagingChannel == '') {
        return throwError(() => new Error('Messaging channel is not selected'));
      }
      return this.conversationMessageApi
        .conversationMessagesSendMessagePost({
          travisBackendMessageDomainViewModelsExtendedConversationMessageViewModel:
            {
              conversationId: conversationId,
              messageChecksum,
              channel: messagingChannel.channelType,
              channelIdentityId:
                messagingChannel.channelIdentityId === null
                  ? undefined
                  : messagingChannel.channelIdentityId,
              messageType: 'interactive',
              whatsapp360DialogExtendedMessagePayload: {
                whatsapp360DialogInteractiveObject:
                  unifiedMessage.whatsapp360Dialog.interactiveMessage,
              },
              messageContent: unifiedMessage.text,
              scheduleSentAt: scheduleSentAt,
              messageTag: unifiedMessage.facebook?.messageTag,
            },
        })
        .pipe(commonRetryPipeOperators);
    }

    if (unifiedMessage.audio) {
      if (messagingChannel == '') {
        return throwError(() => new Error('Messaging channel is not selected'));
      }

      if (!unifiedMessage.audio) {
        return throwError(() => new Error('Audio is not selected'));
      }

      const getAudioFile = () => {
        const audioBlob = unifiedMessage.audio!;

        const blobType = audioBlob.type;

        const fileExtension = AUDIO_TYPES[blobType]?.extension ?? 'bin';
        const audioFile = new File([audioBlob], `voice.${fileExtension}`, {
          type: blobType,
        });
        return audioFile;
      };

      return this.conversationMessageApi
        .conversationMessagesSendFileMessagePost({
          conversationId: conversationId,
          messageChecksum,
          channel: messagingChannel.channelType,
          channelIdentityId:
            messagingChannel.channelIdentityId === null
              ? undefined
              : messagingChannel.channelIdentityId,
          files: [getAudioFile()],
          messageType: 'file',
          messageContent: '',
          scheduleSentAt: scheduleSentAt,
          messageTag: unifiedMessage.facebook?.messageTag,
        })
        .pipe(commonRetryPipeOperators);
    }

    const messageContent = myStaff.shouldShowSenderName
      ? `*${myStaff.firstName} ${myStaff.lastName}*\n${unifiedMessage.text}`
      : '' + unifiedMessage.text;

    if (unifiedMessage.attachments && unifiedMessage.attachments.length > 0) {
      if (messagingChannel == '') {
        return throwError(() => new Error('Messaging channel is not selected'));
      }

      return this.conversationMessageApi
        .conversationMessagesSendFileMessagePost({
          conversationId: conversationId,
          messageChecksum,
          channel: messagingChannel.channelType,
          channelIdentityId:
            messagingChannel.channelIdentityId === null
              ? undefined
              : messagingChannel.channelIdentityId,
          files: unifiedMessage.attachments.map((attachment) => {
            return attachment.blob;
          }),
          messageType: 'file',
          messageContent: messageContent,
          scheduleSentAt: scheduleSentAt,
          messageTag: unifiedMessage.facebook?.messageTag,
        })
        .pipe(commonRetryPipeOperators);
    }

    if (messagingChannel == '') {
      return throwError(() => new Error('Messaging channel is not selected'));
    }

    if (messagingChannel.channelType === 'sms') {
      // Split message into multiple message of 1600 characters if the message is more than 1600 characters,
      // for example if the message is 4096 characters then the message will be split into 1600*2+896
      const messageContentLength = messageContent.length;
      const maxMessageLength = 1599;
      const numberOfMessages = Math.ceil(
        messageContentLength / maxMessageLength,
      );
      const messages = [];
      for (let i = 0; i < numberOfMessages; i++) {
        const start = i * maxMessageLength;
        const end = Math.min(start + maxMessageLength, messageContentLength);
        messages.push(messageContent.slice(start, end));
      }

      return from(messages).pipe(
        concatMap((message, index) => {
          return this.conversationMessageApi
            .conversationMessagesSendMessagePost({
              travisBackendMessageDomainViewModelsExtendedConversationMessageViewModel:
                {
                  conversationId: conversationId,
                  messageChecksum: index === 0 ? messageChecksum : uuid4(),
                  channel: messagingChannel.channelType,
                  channelIdentityId: messagingChannel.channelIdentityId,
                  messageType: 'text',
                  messageContent: message,
                  scheduleSentAt: scheduleSentAt,
                },
            })
            .pipe(commonRetryPipeOperators);
        }),
      );
    }

    return this.conversationMessageApi
      .conversationMessagesSendMessagePost({
        travisBackendMessageDomainViewModelsExtendedConversationMessageViewModel:
          {
            conversationId: conversationId,
            messageChecksum,
            channel: messagingChannel.channelType,
            channelIdentityId:
              messagingChannel.channelIdentityId === null
                ? undefined
                : messagingChannel.channelIdentityId,
            messageType: 'text',
            quotedMsgId: unifiedMessage.quotedMessageId,
            messageContent: messageContent,
            scheduleSentAt: scheduleSentAt,
            messageTag: unifiedMessage.facebook?.messageTag,
            paymentIntentId: unifiedMessage.stripe?.paymentIntentId,
          },
      })
      .pipe(commonRetryPipeOperators);
  }

  public getSendingMessages$(conversationId: string) {
    return this.sendingMessages$$.pipe(
      filter(
        (sendingMessage) => sendingMessage.conversationId === conversationId,
      ),
    );
  }

  public getSentMessage$() {
    return this.sentMessage$$.asObservable();
  }

  public queueSendingMessages(sendingMessages: SendingMessage[]) {
    // Add messages to the sending messages map
    this.addToSendingMessagesMap(sendingMessages);

    sendingMessages.forEach((sendingMessage) =>
      this.sendingMessages$$.next(sendingMessage),
    );
  }

  /**
   * Adds messages to the sending messages map
   */
  private addToSendingMessagesMap(sendingMessages: SendingMessage[]): void {
    const currentMap = this.sendingMessagesMap$$.getValue();
    const newMap = { ...currentMap };

    sendingMessages.forEach((message) => {
      newMap[message.messageChecksum] = message;
    });

    this.sendingMessagesMap$$.next(newMap);
    this.updateBeforeUnloadListener();
  }

  /**
   * Removes a message from the sending messages map
   */
  private removeFromSendingMessagesMap(messageChecksum: string): void {
    const currentMap = this.sendingMessagesMap$$.getValue();
    const { [messageChecksum]: _, ...newMap } = currentMap;

    this.sendingMessagesMap$$.next(newMap);
    this.updateBeforeUnloadListener();
  }

  /**
   * Sets up the beforeunload event listener management
   */
  private setupBeforeUnloadListener(): void {
    // Subscribe to changes in the sending messages map
    this.sendingMessagesMap$$.subscribe((map) => {
      this.updateBeforeUnloadListener(map);
    });
  }

  /**
   * Updates the beforeunload event listener based on whether there are pending messages
   */
  private updateBeforeUnloadListener(
    map?: Record<string, SendingMessage>,
  ): void {
    const sendingMap = map || this.sendingMessagesMap$$.getValue();
    const hasPendingMessages = Object.keys(sendingMap).length > 0;

    if (hasPendingMessages) {
      this.addBeforeUnloadListener();
    } else {
      this.removeBeforeUnloadListener();
    }
  }

  /**
   * Adds the beforeunload event listener to prevent accidental navigation
   */
  private addBeforeUnloadListener(): void {
    window.addEventListener('beforeunload', this.handleBeforeUnload);
  }

  /**
   * Removes the beforeunload event listener
   */
  private removeBeforeUnloadListener(): void {
    window.removeEventListener('beforeunload', this.handleBeforeUnload);
  }

  /**
   * Handler for the beforeunload event
   */
  private handleBeforeUnload = (event: BeforeUnloadEvent): void => {
    const hasPendingMessages =
      Object.keys(this.sendingMessagesMap$$.getValue()).length > 0;

    if (hasPendingMessages) {
      // Standard way to show a confirmation dialog when leaving the page
      event.preventDefault();
      // This message might not be displayed in modern browsers, but the confirmation dialog will still appear
      event.returnValue = this.i18nService.t(
        'sending-conversation-message-manager.warning.unsent-messages',
        'You have unsent messages. Are you sure you want to leave?',
      );
    }
  };

  private handleKnownError(errorCode: number) {
    switch (errorCode) {
      case 20000:
        this.toastMessagesService.showToastMessage(
          'error',
          this.i18nService.t(
            'sending-conversation-message-manager.error.invalid-or-empty-default-channel-identity',
            'Invalid or empty default channel identity, please refresh the page and try again',
          ),
        );
        return true;
      case 20001:
        this.toastMessagesService.showToastMessage(
          'error',
          this.i18nService.t(
            'sending-conversation-message-manager.error.invalid-or-empty-default-channel',
            'Invalid or empty default channel, please refresh the page and try again',
          ),
        );
        return true;
      case 20002:
        this.toastMessagesService.showToastMessage(
          'error',
          this.i18nService.t(
            'sending-conversation-message-manager.error.no-default-channel-permission',
            'Channel permission updated, please refresh the page and try again',
          ),
        );
        return true;
      default:
        return false;
    }
  }
}
