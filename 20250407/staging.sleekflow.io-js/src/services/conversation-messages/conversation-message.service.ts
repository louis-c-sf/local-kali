import {
  AttachmentApi,
  AttachmentAttachmentTypeUrlFilenameIdGetRequest,
  ConversationApi,
  ConversationMessageApi,
  MessageApi,
  TravisBackendMessageDomainViewModelsConversationMessageResponseViewModel,
  TravisBackendMessageDomainViewModelsForwardMessageInput,
} from '@sleekflow/sleekflow-core-typescript-rxjs-apis';
import dayjs from 'dayjs';
import { inject, injectable } from 'inversify';
import {
  catchError,
  combineLatest,
  concatMap,
  EMPTY,
  filter,
  map,
  Observable,
  of,
  startWith,
  Subject,
  take,
} from 'rxjs';

import { MessagingChannel } from '@/services/companies/company.service';
import { LogService } from '@/services/logs/log.service';
import { RxjsUtils } from '@/services/rxjs-utils/rxjs-utils';
import { ClassicRealTimeService } from '@/services/signal-r/classic-real-time.service';

import { UserService } from '../user.service';
import { ConversationMessageWrapper } from './managers/conversation-message-wrapper';
import { ConversationMessageWrapperManagerService } from './managers/conversation-message-wrapper-manager.service';
import { GetConversationMessagesFilter } from './models/get-conversation-messages-filter';

@injectable()
export class ConversationMessageService {
  private searchMessageFailed$$ = new Subject<boolean>();

  constructor(
    @inject(ConversationMessageWrapperManagerService)
    private conversationMessageWrapperManagerService: ConversationMessageWrapperManagerService,
    @inject(ConversationApi) private conversationApi: ConversationApi,
    @inject(AttachmentApi) private attachmentApi: AttachmentApi,
    @inject(ConversationMessageApi)
    private conversationMessageApi: ConversationMessageApi,
    @inject(UserService)
    private userService: UserService,
    @inject(ClassicRealTimeService)
    private classicRealTimeService: ClassicRealTimeService,
    @inject(MessageApi)
    private messageApi: MessageApi,
    @inject(LogService)
    private logService: LogService,
  ) {
    // Sometimes, we need to refresh the message to get the latest status
    this.conversationMessageWrapperManagerService
      .getSendingMessages$()
      .subscribe((messages) => {
        messages
          // take random 10 to try to prevent overloading the server
          .sort(() => Math.random() - 0.5)
          .slice(0, 10)

          // refresh
          .forEach((m) => {
            this.refreshAndGetMessage$(
              m.getConversationId(),
              m.getId(),
            ).subscribe((msg) => {
              if (msg === undefined) {
                this.logService.error(
                  'Failed to refresh the message',
                  m.getId(),
                );

                return;
              }
            });
          });
      });
  }

  public onNextSearchMessageFailed$() {
    this.searchMessageFailed$$.next(true);
  }

  public getSearchMessageFailed$() {
    return this.searchMessageFailed$$.asObservable();
  }

  public refreshAndGetMessage$(conversationId: string, messageId: number) {
    return this.conversationMessageApi
      .conversationMessagesGetMessagePost({
        travisBackendControllersMessageControllersConversationMessageControllerGetMessageByMessageIdInput:
          {
            conversationId: conversationId,
            messageId: messageId,
            messageUniqueID: undefined,
          },
      })
      .pipe(
        map((resp) => {
          const message = resp?.message;

          if (!message) {
            return;
          }

          if (
            message.messageChecksum &&
            this.conversationMessageWrapperManagerService.getConversationMessageWrapper(
              message.messageChecksum,
            )
          ) {
            return this.conversationMessageWrapperManagerService.getOrInitConversationMessageWrapper(
              message.messageChecksum!,
              message,
            );
          }

          return this.conversationMessageWrapperManagerService.getOrInitConversationMessageWrapper(
            message.id!,
            message,
          );
        }),
      );
  }

  public getMessage$(conversationId: string, messageId: number) {
    const message =
      this.conversationMessageWrapperManagerService.getConversationMessageWrapper(
        messageId!,
      );
    if (message) {
      return of(message);
    }

    return this.refreshAndGetMessage$(conversationId, messageId);
  }

  public getMessages$({
    offset = 0,
    limit = 20,
    conversationId,
    channelMessageFilters,
    afterTimestamp,
    beforeTimestamp,
    isFromUser,
    messageStatus,
    messageType,
    order,
    beforeMessageId,
    afterMessageId,
    isGetFileOnly,
  }: GetConversationMessagesFilter) {
    const key = {
      isGetFileOnly,
      conversationId: conversationId!,
      offset: offset,
      limit: limit,
      channelMessageFilters: channelMessageFilters,
      afterTimestamp: afterTimestamp,
      beforeTimestamp: beforeTimestamp,
      messageStatus,
      isFromUser,
      isFromImport: undefined,
      order,
      messageType,
      beforeMessageId,
      afterMessageId,
    };

    return this.conversationMessageApi
      .conversationMessagesGetMessagesPost({
        travisBackendControllersMessageControllersConversationMessageControllerGetConversationMessagesInput:
          key,
      })
      .pipe(
        take(1),
        RxjsUtils.getRetryAPIRequest(),
        map((response) => {
          return response.messages?.map(
            (
              travisBackendMessageDomainViewModelsConversationMessageResponseViewModel,
            ) => {
              return this.conversationMessageWrapperManagerService.getOrInitConversationMessageWrapper(
                travisBackendMessageDomainViewModelsConversationMessageResponseViewModel.id!,

                travisBackendMessageDomainViewModelsConversationMessageResponseViewModel,
              );
            },
          );
        }),
      );
  }

  public getRecentLastMessages$(
    conversationId: string,
    messagingChannel: MessagingChannel | '',
    numOfMessages = 1,
  ) {
    return this.conversationMessageApi
      .conversationMessagesGetMessagesPost({
        travisBackendControllersMessageControllersConversationMessageControllerGetConversationMessagesInput:
          {
            channelMessageFilters:
              messagingChannel === ''
                ? []
                : [
                    {
                      channelType: messagingChannel.channelType,
                      channelIdentityId: messagingChannel.channelIdentityId,
                    },
                  ],
            conversationId,
            offset: 0,
            limit: numOfMessages,
            afterTimestamp: dayjs().subtract(7, 'day').unix(),
          },
      })
      .pipe(
        map((resp) => {
          const messages = resp.messages!;

          if (messages.length === 0) {
            return [];
          }

          return messages.map((message) => {
            return this.conversationMessageWrapperManagerService.getOrInitConversationMessageWrapper(
              message.id!,
              message,
            );
          });
        }),
      );
  }

  public getLastMessage$(
    channelType: string,
    conversationId: string,
    channelIdentityId?: string,
    isOngoing = true,
  ) {
    const realtimeMessage$ = this.classicRealTimeService
      .getOnMessageReceived$()
      .pipe(
        filter((msg) => {
          return (
            msg.conversationId === conversationId &&
            msg.channel === channelType &&
            msg.channelIdentityId === channelIdentityId
          );
        }),
        map(
          (
            resp: TravisBackendMessageDomainViewModelsConversationMessageResponseViewModel,
          ) => {
            return this.conversationMessageWrapperManagerService.getOrInitConversationMessageWrapper(
              resp.id!,
              resp,
            );
          },
        ),
        startWith(undefined),
      );

    const lastMessage$ = this.conversationMessageApi
      .conversationMessagesGetMessagesPost({
        travisBackendControllersMessageControllersConversationMessageControllerGetConversationMessagesInput:
          {
            channelMessageFilters: [
              {
                channelType: channelType,
                channelIdentityId: channelIdentityId,
              },
            ],
            conversationId,
            offset: 0,
            limit: 1,
          },
      })
      .pipe(
        map((resp) => {
          const messages = resp.messages!;

          if (messages.length === 0) {
            return undefined;
          }

          return this.conversationMessageWrapperManagerService.getOrInitConversationMessageWrapper(
            messages[0].id!,

            messages[0],
          );
        }),
      );

    if (!isOngoing) {
      return lastMessage$;
    }

    return combineLatest([realtimeMessage$, lastMessage$]).pipe(
      map(([realtimeMessage, lastMessage]) => {
        // Combine the latest values from both streams
        // You can perform any necessary logic here
        // For example, you can return the most recent message
        return realtimeMessage || lastMessage;
      }),
    );
  }

  public getLastMessageFromUser$(
    channelType: string,
    conversationId: string,
    channelIdentityId?: string,
    isOngoing = true,
  ) {
    const realtimeMessage$ = this.classicRealTimeService
      .getOnMessageReceived$()
      .pipe(
        filter((msg) => {
          return (
            msg.conversationId === conversationId &&
            msg.channel === channelType &&
            msg.channelIdentityId === channelIdentityId &&
            msg.isSentFromSleekflow === false
          );
        }),
        map(
          (
            resp: TravisBackendMessageDomainViewModelsConversationMessageResponseViewModel,
          ) => {
            return this.conversationMessageWrapperManagerService.getOrInitConversationMessageWrapper(
              resp.id!,

              resp,
            );
          },
        ),
        startWith(undefined),
      );

    const lastMessage$ = this.conversationMessageApi
      .conversationMessagesGetMessagesPost({
        travisBackendControllersMessageControllersConversationMessageControllerGetConversationMessagesInput:
          {
            channelMessageFilters: [
              {
                channelType: channelType,
                channelIdentityId: channelIdentityId,
              },
            ],
            conversationId,
            offset: 0,
            limit: 1,
            isFromUser: true,
          },
      })
      .pipe(
        map((resp) => {
          const messages = resp.messages!;

          if (messages.length === 0) {
            return undefined;
          }

          return this.conversationMessageWrapperManagerService.getOrInitConversationMessageWrapper(
            messages[0].id!,
            messages[0],
          );
        }),
      );

    if (!isOngoing) {
      return lastMessage$;
    }

    return combineLatest([realtimeMessage$, lastMessage$]).pipe(
      map(([realtimeMessage, lastMessage]) => {
        // Combine the latest values from both streams
        // You can perform any necessary logic here
        // For example, you can return the most recent message
        return realtimeMessage || lastMessage;
      }),
    );
  }

  public getQuoteMessage$(
    conversationId: string,
    quotedMsgId?: string,
  ): Observable<ConversationMessageWrapper> {
    const message =
      this.conversationMessageWrapperManagerService.getConversationMessageWrapperWithQuoteMessageId(
        quotedMsgId!,
      );
    if (message) {
      return of(message);
    }

    return this.conversationMessageApi
      .conversationMessagesGetMessagePost({
        travisBackendControllersMessageControllersConversationMessageControllerGetMessageByMessageIdInput:
          {
            conversationId: conversationId,
            messageUniqueID: quotedMsgId,
          },
      })
      .pipe(
        map((resp) => {
          const { message } = resp;
          if (!message?.id) {
            throw new Error('Message not found');
          }

          return this.conversationMessageWrapperManagerService.getOrInitConversationMessageWrapper(
            message.id,
            message,
          );
        }),
        catchError(() => EMPTY),
      );
  }

  private attachmentUrls: Record<
    string,
    Observable<{ url: string; MIMEType: string }>
  > = {};

  public getAttachmentUrl$({
    attachmentType,
    filenameId,
  }: AttachmentAttachmentTypeUrlFilenameIdGetRequest) {
    if (!this.attachmentUrls[filenameId]) {
      this.attachmentUrls[filenameId] =
        this.attachmentApi.attachmentAttachmentTypeUrlFilenameIdGet({
          attachmentType,
          filenameId,
        }) as unknown as Observable<{ url: string; MIMEType: string }>;
    }

    return this.attachmentUrls[filenameId];
  }

  public sendTextMessage$(
    conversationId: string,
    channel: string,
    channelIdentityId: string,
    messageContent: string,
  ) {
    // {"conversationId":"400149d7-affb-4eb5-9d84-757616aa3234","messageContent":"Hi",
    // "channel":"whatsappcloudapi","messageChecksum":"72f77ed1-be9b-41ee-bbfe-c6b037ed64bd",
    // "channelIdentityId":"15734946372","files":[],"messageType":"text",
    // "context":{"channelInfo":{"id":"15734946372","channel":"whatsappcloudapi",
    // "name":"whatsappcloudapi","channelIdentityId":"15734946372"}}}

    return this.conversationMessageApi.conversationMessagesSendMessagePost({
      travisBackendMessageDomainViewModelsExtendedConversationMessageViewModel:
        {
          conversationId,
          messageContent,
          channel,
          channelIdentityId,
          messageType: 'text',
        },
    });
  }

  public forwardMessages$({
    forwardConversationMessages,
  }: TravisBackendMessageDomainViewModelsForwardMessageInput) {
    return this.conversationMessageApi.conversationMessagesForwardMessagePost({
      travisBackendMessageDomainViewModelsForwardMessageInput: {
        forwardConversationMessages,
      },
    });
  }

  public sendNote$(conversationId: string, text: string) {
    // ------WebKitFormBoundaryTkBxcKu5tAuclkew
    // Content-Disposition: form-data; name="conversationId"
    //
    // 400149d7-affb-4eb5-9d84-757616aa3234
    // ------WebKitFormBoundaryTkBxcKu5tAuclkew
    // Content-Disposition: form-data; name="messageContent"
    //
    // test
    // ------WebKitFormBoundaryTkBxcKu5tAuclkew
    // Content-Disposition: form-data; name="channel"
    //
    // note
    // ------WebKitFormBoundaryTkBxcKu5tAuclkew
    // Content-Disposition: form-data; name="messageChecksum"
    //
    // 8e59cc40-96b4-411c-827a-f4e146a637a4
    // ------WebKitFormBoundaryTkBxcKu5tAuclkew
    // Content-Disposition: form-data; name="channelIdentityId"
    //
    // undefined
    // ------WebKitFormBoundaryTkBxcKu5tAuclkew
    // Content-Disposition: form-data; name="messageGroupName"
    //
    // b6d7e442-38ae-4b9a-b100-2951729768bc
    // ------WebKitFormBoundaryTkBxcKu5tAuclkew
    // Content-Disposition: form-data; name="messageType"
    //
    // text
    // ------WebKitFormBoundaryTkBxcKu5tAuclkew
    // Content-Disposition: form-data; name="channelId"
    //
    // 15734946372
    // ------WebKitFormBoundaryTkBxcKu5tAuclkew
    // Content-Disposition: form-data; name="context"
    //
    // [object Object]
    // ------WebKitFormBoundaryTkBxcKu5tAuclkew--

    // {
    // conversationId, messageChecksum, conversationId2, assigneeId, channel,
    // messageChannel, messageGroupName, subject, messageType,
    // messageContent, files, fileUrls, localTimestamp }

    return this.userService.getMyCompany$().pipe(
      concatMap((company) => {
        return this.conversationApi.conversationNoteConversationIdPost({
          conversationId: conversationId,
          messageChecksum: crypto.randomUUID(),

          // TODO
          assigneeId: undefined,
          channel: 'note',
          messageContent: text,
          messageGroupName: company.id,
          messageType: 'text',
        });
      }),
    );
  }

  public cancelScheduledMessage$(messageId: number) {
    // https://sleekflow-core-dev-e6d7dyf5drg4eag5.z01.azurefd.net/Message/Schedule/Delete
    // {"messageIds":[385831]}

    return this.messageApi.messageScheduleDeletePost({
      travisBackendMessageDomainViewModelsDeleteMessageInput: {
        messageIds: [messageId],
      },
    });
  }
}
