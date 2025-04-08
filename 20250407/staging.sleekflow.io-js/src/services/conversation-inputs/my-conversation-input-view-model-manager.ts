import type {
  TravisBackendConversationDomainViewModelsCompanyResponse,
  TravisBackendMessageDomainViewModelsConversationMessageResponseViewModel,
} from '@sleekflow/sleekflow-core-typescript-rxjs-apis';
import dayjs from 'dayjs';
import { inject, injectable } from 'inversify';
import {
  BehaviorSubject,
  combineLatest,
  filter,
  map,
  Observable,
  of,
  startWith,
  switchMap,
  take,
} from 'rxjs';

import { ExtendedMessageType } from '@/api/types';
import { AUDIO_TYPES } from '@/pages/Inbox/ConversationInput';
import { CommerceService } from '@/services/commerces/commerce.service';
import {
  CompanyService,
  MessagingChannel,
  Staff,
} from '@/services/companies/company.service';
import { StaffCore } from '@/services/companies/types';
import {
  MyConversationInputViewModel,
  MyConversationInputViewModelProps,
} from '@/services/conversation-inputs/my-conversation-input-view-model';
import { ConversationMessageService } from '@/services/conversation-messages/conversation-message.service';
import { ConversationMessageWrapper } from '@/services/conversation-messages/managers/conversation-message-wrapper';
import { ConversationMessageWrapperManagerService } from '@/services/conversation-messages/managers/conversation-message-wrapper-manager.service';
import { SendingConversationMessageManager } from '@/services/conversation-messages/managers/sending-conversation-message-manager';
import { ConversationService } from '@/services/conversations/conversation.service';
import { FeatureService } from '@/services/features/feature.service';
import { SendingMessage } from '@/services/persistences/sf-dexie';
import { UserProfileService } from '@/services/user-profiles/user-profile.service';
import { notEmpty } from '@/utils/ts-utils';
import { I18nService } from '../i18n/i18n.service';
import { ToastMessagesService } from '../toast-messages/toast-messages.service';
import { LogService } from '../logs/log.service';

type ConversationInputMode =
  | 'messaging'
  | 'internal-note'
  | 'messaging-forwarding';

const createImageBitmapFromURL = async (url: string) => {
  return await new Promise<ImageBitmap>((resolve, reject) => {
    const img = new Image();
    img.src = url;
    img.addEventListener('load', (e) => {
      if (e.target === null) {
        return reject(new Error('Image element is null'));
      }
      resolve(createImageBitmap(e.target as unknown as Blob));
    });
  });
};

const createImageBitmapFromBlob = async (blob: Blob) => {
  const bmp = await createImageBitmap(blob);
  return bmp;
};

@injectable()
export class MyConversationInputViewModelManager {
  constructor(
    @inject(UserProfileService)
    private userProfileService: UserProfileService,
    @inject(ConversationService)
    private conversationService: ConversationService,
    @inject(CompanyService)
    private companyService: CompanyService,
    @inject(ConversationMessageWrapperManagerService)
    private conversationMessageWrapperManagerService: ConversationMessageWrapperManagerService,
    @inject(ConversationMessageService)
    private conversationMessageService: ConversationMessageService,
    @inject(FeatureService)
    private featureService: FeatureService,
    @inject(CommerceService)
    private commerceService: CommerceService,
    @inject(SendingConversationMessageManager)
    private sendingConversationMessageManager: SendingConversationMessageManager,
    @inject(I18nService)
    private i18nService: I18nService,
    @inject(ToastMessagesService)
    private toastMesageService: ToastMessagesService,
    @inject(LogService)
    private logService: LogService,
  ) {}

  public vmPropsToViewModelMap: Map<string, MyConversationInputViewModel> =
    new Map<string, MyConversationInputViewModel>();

  public conversationWindowScrollContainer$$ =
    new BehaviorSubject<HTMLDivElement | null>(null);

  public getOrCreateViewModel(props: MyConversationInputViewModelProps) {
    if (this.vmPropsToViewModelMap.has(JSON.stringify(props))) {
      return this.vmPropsToViewModelMap.get(JSON.stringify(props))!;
    }

    const vm = new MyConversationInputViewModel(
      this.conversationMessageService,
      this.featureService,
      this.commerceService,
      this.sendingConversationMessageManager,
      this.companyService,
      this.conversationService,
      this.i18nService,
      this.toastMesageService,
      this.logService,
    );

    vm.setup(props);

    this.vmPropsToViewModelMap.set(JSON.stringify(props), vm);

    return vm;
  }

  private getInitialChannel$(
    conversationId: string,
    userProfileId: string,
    selectedChannel?: MessagingChannel | '',
  ): Observable<MessagingChannel | ''> {
    return combineLatest({
      lastMessageId: this.conversationService
        .getConversationWrapper$(conversationId)
        .pipe(
          take(1),
          switchMap((conversation) => {
            return conversation
              .getLastMessageId$()
              .pipe(
                filter(
                  (x) =>
                    x !== ConversationMessageWrapper.initializing().getId(),
                ),
              );
          }),
        ),
      lastIncomingMessagingChannelType: this.conversationService
        .getConversationWrapper$(conversationId)
        .pipe(
          take(1),
          switchMap((conversation) => {
            return conversation.getLastIncomingMessagingChannelType$();
          }),
        ),
      lastIncomingMessagingChannelIdentityId: this.conversationService
        .getConversationWrapper$(conversationId)
        .pipe(
          take(1),
          switchMap((conversation) => {
            return conversation.getLastIncomingMessagingChannelIdentityId$();
          }),
        ),
      allMessagingChannels: this.companyService
        .getDisplayableMessageChannels$()
        .pipe(filter((channels) => channels.length > 0)),
      selectedMessagingChannel: of(selectedChannel),
      supportedMessagingChannels: this.userProfileService
        .getUserProfileWrapper$(userProfileId)
        .pipe(
          take(1),
          switchMap((userProfileWrapper) => {
            return userProfileWrapper.getSupportedMessagingChannels$();
          }),
        ),
    }).pipe(
      take(1),
      map(
        ({
          allMessagingChannels,
          supportedMessagingChannels,
          lastMessageId,
          selectedMessagingChannel,
          lastIncomingMessagingChannelType,
          lastIncomingMessagingChannelIdentityId,
        }) => {
          if (selectedMessagingChannel !== '' && !!selectedMessagingChannel) {
            return selectedMessagingChannel;
          }

          const lastMessage =
            this.conversationMessageWrapperManagerService.getConversationMessageWrapper(
              lastMessageId,
            );
          const lastMessageChannelType = lastMessage?.getChannelType();

          // Web doesn't have a channel identity id
          if (lastMessageChannelType === 'web') {
            const webChannel = allMessagingChannels.find(
              (mc) => mc.channelType === 'web',
            );
            if (webChannel) {
              return webChannel!;
            }
          }

          if (lastMessage?.getChannelType() === 'note') {
            return { channelType: 'note' } as MessagingChannel;
          }

          // TODO: Optimize if only one channel for that channel type, no need fetch
          // find last messaging channel by checking last message
          if (
            lastIncomingMessagingChannelType &&
            lastIncomingMessagingChannelIdentityId
          ) {
            const targetChannel = allMessagingChannels.find((mc) => {
              return (
                mc.channelIdentityId ===
                  lastIncomingMessagingChannelIdentityId &&
                mc.channelType === lastIncomingMessagingChannelType
              );
            });
            if (targetChannel) {
              return targetChannel!;
            }
          }

          if (
            lastMessage?.getChannelType() &&
            lastMessage?.getChannelIdentityId()
          ) {
            const targetChannel = allMessagingChannels.find((mc) => {
              return (
                mc.channelIdentityId === lastMessage?.getChannelIdentityId() &&
                mc.channelType === lastMessage?.getChannelType()
              );
            });
            if (targetChannel) {
              return targetChannel;
            }
          }
          // last resort is to find first supported channel
          const firstSupportedChannel = allMessagingChannels.find((mc) => {
            return supportedMessagingChannels.includes(mc.channelType);
          });

          if (firstSupportedChannel) {
            return firstSupportedChannel!;
          }

          return '';
        },
      ),
    );
  }

  private getInitialChannelWithoutNote$(
    conversationId: string,
    userProfileId: string,
    selectedChannel?: MessagingChannel | '',
  ): Observable<MessagingChannel | ''> {
    return combineLatest({
      lastMessageId: this.conversationService
        .getConversationWrapper$(conversationId)
        .pipe(
          take(1),
          switchMap((conversation) => {
            return conversation
              .getLastMessageId$()
              .pipe(
                startWith(ConversationMessageWrapper.initializing().getId()),
              );
          }),
        ),
      allMessagingChannels:
        this.companyService.getDisplayableMessageChannels$(),
      selectedMessagingChannel: of(selectedChannel),
      supportedMessagingChannels: this.userProfileService
        .getUserProfileWrapper$(userProfileId)
        .pipe(
          take(1),
          switchMap((userProfileWrapper) => {
            return userProfileWrapper.getSupportedMessagingChannels$();
          }),
        ),
      lastIncomingMessagingChannelType: this.conversationService
        .getConversationWrapper$(conversationId)
        .pipe(
          take(1),
          switchMap((conversation) => {
            return conversation.getLastIncomingMessagingChannelType$();
          }),
        ),
      lastIncomingMessagingChannelIdentityId: this.conversationService
        .getConversationWrapper$(conversationId)
        .pipe(
          take(1),
          switchMap((conversation) => {
            return conversation.getLastIncomingMessagingChannelIdentityId$();
          }),
        ),
    }).pipe(
      take(1),
      map(
        ({
          allMessagingChannels,
          supportedMessagingChannels,
          lastMessageId,
          selectedMessagingChannel,
          lastIncomingMessagingChannelType,
          lastIncomingMessagingChannelIdentityId,
        }) => {
          if (selectedMessagingChannel !== '' && !!selectedMessagingChannel) {
            return selectedMessagingChannel;
          }

          const lastMessage =
            this.conversationMessageWrapperManagerService.getConversationMessageWrapper(
              lastMessageId,
            );

          // Web doesn't have a channel identity id
          if (lastMessage?.getChannelType() === 'web') {
            const webChannel = allMessagingChannels.find(
              (mc) => mc.channelType === 'web',
            );
            if (webChannel) {
              return webChannel!;
            }
          }

          if (
            lastMessage?.getChannelType() === 'note' &&
            lastIncomingMessagingChannelType &&
            lastIncomingMessagingChannelIdentityId
          ) {
            // TODO: Optimize if only one channel for that channel type, no need fetch
            // find last messaging channel by checking last message
            const targetChannel = allMessagingChannels.find((mc) => {
              return (
                mc.channelIdentityId ===
                  lastIncomingMessagingChannelIdentityId &&
                mc.channelType === lastIncomingMessagingChannelType
              );
            });

            if (targetChannel) {
              return targetChannel!;
            }
            // return '';
          }

          // TODO: Optimize if only one channel for that channel type, no need fetch
          // find last messaging channel by checking last message
          if (
            lastMessage?.getChannelType() &&
            lastMessage?.getChannelIdentityId()
          ) {
            const targetChannel = allMessagingChannels.find((mc) => {
              return (
                mc.channelIdentityId === lastMessage?.getChannelIdentityId() &&
                mc.channelType === lastMessage?.getChannelType()
              );
            });
            if (targetChannel) {
              return targetChannel;
            }
          }

          // last resort is to find first supported channel
          const firstSupportedChannel = allMessagingChannels.find((mc) => {
            return supportedMessagingChannels.includes(mc.channelType);
          });

          if (firstSupportedChannel) {
            return firstSupportedChannel!;
          }

          return '';
        },
      ),
    );
  }

  private conversationIdToSelectedDisplayChannelMap: Map<
    string,
    BehaviorSubject<MessagingChannel | ''>
  > = new Map<string, BehaviorSubject<MessagingChannel | ''>>();

  public getConversationSelectedDisplayChannel$(conversationId: string) {
    if (!this.conversationIdToSelectedDisplayChannelMap.has(conversationId)) {
      const behaviorSubject = new BehaviorSubject<MessagingChannel | ''>('');

      this.conversationIdToSelectedDisplayChannelMap.set(
        conversationId,
        behaviorSubject,
      );
    }

    return this.conversationIdToSelectedDisplayChannelMap
      .get(conversationId)!
      .asObservable();
  }

  public setConversationSelectedDisplayChannel(
    conversationId: string,
    userProfileId: string,
    channel: MessagingChannel | '',
  ) {
    if (!this.conversationIdToSelectedDisplayChannelMap.has(conversationId)) {
      const behaviorSubject = new BehaviorSubject<MessagingChannel | ''>('');

      this.conversationIdToSelectedDisplayChannelMap.set(
        conversationId,
        behaviorSubject,
      );
    }

    this.conversationIdToSelectedDisplayChannelMap
      .get(conversationId)!
      .next(channel);

    if (channel !== '') {
      this.setConversationSelectedInputChannel(
        conversationId,
        userProfileId,
        channel,
      );
    }
  }

  private conversationIdToSelectedInputChannelMap: Map<
    string,
    BehaviorSubject<MessagingChannel | ''>
  > = new Map<string, BehaviorSubject<MessagingChannel | ''>>();

  public getConversationSelectedInputChannel$(
    conversationId: string,
    userProfileId: string,
  ) {
    if (!this.conversationIdToSelectedInputChannelMap.has(conversationId)) {
      const behaviorSubject = new BehaviorSubject<MessagingChannel | ''>('');

      // Set the initial channel as the selected channel
      this.getInitialChannel$(conversationId, userProfileId, '')
        .pipe(take(1))
        .subscribe((messagingChannel) => {
          behaviorSubject.next(messagingChannel);
        });

      this.conversationIdToSelectedInputChannelMap.set(
        conversationId,
        behaviorSubject,
      );
    }

    return this.conversationIdToSelectedInputChannelMap
      .get(conversationId)!
      .asObservable();
  }

  public resetConversationSelectedInputChannel(conversationId: string) {
    if (!this.conversationIdToSelectedInputChannelMap.has(conversationId)) {
      const behaviorSubject = new BehaviorSubject<MessagingChannel | ''>('');

      this.conversationIdToSelectedInputChannelMap.set(
        conversationId,
        behaviorSubject,
      );
    }

    this.conversationService
      .getConversationWrapper$(conversationId)
      .subscribe((conversation) => {
        // Set the initial channel as the selected channel
        this.getInitialChannel$(
          conversationId,
          conversation.getUserProfileId(),
          '',
        )
          .pipe(take(1))
          .subscribe((messagingChannel) => {
            if (messagingChannel === '') {
              this.conversationIdToSelectedInputChannelMap
                .get(conversationId)!
                .next('');
              return;
            }

            if (messagingChannel.channelType === 'note') {
              this.setConversationInputMode(
                conversationId,
                conversation.getUserProfileId(),
                'internal-note',
              );

              return;
            }

            this.conversationIdToSelectedInputChannelMap
              .get(conversationId)!
              .next(messagingChannel);
          });
      });
  }

  public setConversationSelectedInputChannel(
    conversationId: string,
    userProfileId: string,
    channel: MessagingChannel | '',
  ) {
    if (!this.conversationIdToSelectedInputChannelMap.has(conversationId)) {
      const behaviorSubject = new BehaviorSubject<MessagingChannel | ''>('');

      // Set the initial channel as the selected channel
      this.getInitialChannel$(conversationId, userProfileId, '')
        .pipe(take(1))
        .subscribe((messagingChannel) => {
          behaviorSubject.next(messagingChannel);
        });

      this.conversationIdToSelectedInputChannelMap.set(
        conversationId,
        behaviorSubject,
      );
    }

    // If the selected display channel is not empty (all channel), then set the selected input channel
    if (
      this.conversationIdToSelectedDisplayChannelMap.has(conversationId) &&
      this.conversationIdToSelectedDisplayChannelMap
        .get(conversationId)!
        .getValue() !== ''
    ) {
      this.conversationIdToSelectedDisplayChannelMap
        .get(conversationId)!
        .next(channel);
    }

    this.conversationIdToSelectedInputChannelMap
      .get(conversationId)!
      .next(channel);
  }

  private conversationIdToInputModeMap: Map<
    string,
    BehaviorSubject<ConversationInputMode>
  > = new Map<string, BehaviorSubject<ConversationInputMode>>();

  public getConversationInputMode$(
    conversationId: string,
    userProfileId: string,
  ) {
    if (!this.conversationIdToInputModeMap.has(conversationId)) {
      const behaviorSubject = new BehaviorSubject<ConversationInputMode>(
        'messaging',
      );

      // Set the initial mode
      this.getInitialChannel$(conversationId, userProfileId, '')
        .pipe(take(1))
        .subscribe((messagingChannel) => {
          if (messagingChannel === '') {
            behaviorSubject.next('messaging');
            return;
          }

          if (messagingChannel.channelType === 'note') {
            behaviorSubject.next('internal-note');
            return;
          }

          behaviorSubject.next('messaging');
        });

      this.conversationIdToInputModeMap.set(conversationId, behaviorSubject);
    }

    return this.conversationIdToInputModeMap
      .get(conversationId)!
      .asObservable();
  }

  public setConversationInputMode(
    conversationId: string,
    userProfileId: string,
    mode: ConversationInputMode,
  ) {
    if (!this.conversationIdToInputModeMap.has(conversationId)) {
      const behaviorSubject = new BehaviorSubject<ConversationInputMode>(
        'messaging',
      );

      // Set the initial mode
      this.getInitialChannel$(conversationId, userProfileId, '')
        .pipe(take(1))
        .subscribe((messagingChannel) => {
          if (messagingChannel === '') {
            behaviorSubject.next('messaging');
            return;
          }

          if (messagingChannel.channelType === 'note') {
            behaviorSubject.next('internal-note');
            return;
          }

          behaviorSubject.next('messaging');
        });

      this.conversationIdToInputModeMap.set(conversationId, behaviorSubject);
    }

    this.conversationIdToInputModeMap.get(conversationId)!.next(mode);

    if (mode === 'messaging') {
      this.getInitialChannelWithoutNote$(
        conversationId,
        userProfileId,
        '',
      ).subscribe((messagingChannel) => {
        this.setConversationSelectedInputChannel(
          conversationId,
          userProfileId,
          messagingChannel,
        );
      });
    }
  }

  public conversationMessageHistoryBottomAnchorEl$ =
    new BehaviorSubject<HTMLElement | null>(null);

  public getConversationWindowScrollContainer$() {
    return this.conversationWindowScrollContainer$$.asObservable();
  }

  public getIsConversationWindowScrolledToBottom$() {
    const inaccuracy = 500;
    const maxScrollTop = (dom: HTMLElement) =>
      dom.scrollHeight - dom.clientHeight;

    return this.conversationWindowScrollContainer$$.pipe(
      map((anchor) => {
        if (anchor === null) {
          return false;
        }
        return Math.ceil(anchor.scrollTop) >= maxScrollTop(anchor) - inaccuracy;
      }),
    );
  }

  public scrollToBottomOfConversationWindowIfAtBottom() {
    this.getIsConversationWindowScrolledToBottom$()
      .pipe(take(1))
      .subscribe((v) => {
        if (v) {
          this.scrollToBottomOfConversationWindow();
        }
      });
  }

  public setConversationWindowScrollContainer(fn: HTMLDivElement) {
    this.conversationWindowScrollContainer$$.next(fn);
  }

  public setConversationMessageHistoryBottomAnchorEl$(fn: HTMLElement) {
    this.conversationMessageHistoryBottomAnchorEl$.next(fn);
  }

  public getConversationMessageHistoryBottomAnchorEl$() {
    return this.conversationMessageHistoryBottomAnchorEl$.asObservable();
  }

  public scrollToBottomOfConversationWindow() {
    this.conversationMessageHistoryBottomAnchorEl$.getValue()?.scrollIntoView({
      behavior: 'auto',
      block: 'start',
      inline: 'nearest',
    });
  }

  public conversationInputNotificationsAnchorEl$ =
    new BehaviorSubject<HTMLElement | null>(null);

  public setConversationInputNotificationsAnchorEl(el: HTMLElement | null) {
    this.conversationInputNotificationsAnchorEl$.next(el);
  }

  public getConversationInputNotificationsAnchorEl$() {
    return this.conversationInputNotificationsAnchorEl$.asObservable();
  }

  public conversationInputTextAreaElement$ =
    new BehaviorSubject<HTMLTextAreaElement | null>(null);

  public setConversationInputTextAreaElement(el: HTMLTextAreaElement | null) {
    this.conversationInputTextAreaElement$.next(el);
  }

  public getConversationInputTextAreaElement$() {
    return this.conversationInputTextAreaElement$.asObservable();
  }

  // setConversationInputActionButtonsAnchor
  public conversationInputActionButtonsAnchorEl$ =
    new BehaviorSubject<HTMLDivElement | null>(null);

  public setConversationInputActionButtonsAnchorEl(el: HTMLDivElement | null) {
    this.conversationInputActionButtonsAnchorEl$.next(el);
  }

  public getConversationInputActionButtonsAnchorEl$() {
    return this.conversationInputActionButtonsAnchorEl$.asObservable();
  }

  public async transformMessagePayloadToTravisBackendMessageDomainViewModelsConversationMessageResponseViewModel({
    sendingMessage,
    staff,
    company,
    allStaff,
  }: {
    allStaff: StaffCore[];
    sendingMessage: SendingMessage;
    staff: Staff;
    company:
      | TravisBackendConversationDomainViewModelsCompanyResponse
      | null
      | undefined;
  }): Promise<TravisBackendMessageDomainViewModelsConversationMessageResponseViewModel> {
    if (!company) {
      throw new Error('Company is not found');
    }

    if (sendingMessage.messagingChannel === '') {
      throw new Error('Messaging channel is not selected');
    }

    const sender = {
      id: staff.id,
      firstName: staff.firstName,
      lastName: staff.lastName,
      displayName: staff.displayName,
      userName: '',
      email: staff.email,
      phoneNumber: '',
      emailConfirmed: true,
      createdAt: dayjs().toISOString(),
    };

    const response: TravisBackendMessageDomainViewModelsConversationMessageResponseViewModel =
      {
        sender,
        companyId: company.id,
        uploadedFiles: [],
        createdAt: sendingMessage.createdAt.toISOString(),
        timestamp: dayjs(sendingMessage.createdAt).unix(),
        channelName: sendingMessage.messagingChannel.channelDisplayName,
        isSentFromSleekflow: true,
        channelStatusMessage: '',
        isSandbox: false,
        channelIdentityId: sendingMessage.messagingChannel.channelIdentityId,
        isFromImport: false,
        conversationId: sendingMessage.conversationId,
        messageChecksum: sendingMessage.messageChecksum,
        messageContent: sendingMessage.unifiedMessage.text,
        messageType: 'text',
        status: sendingMessage.status,
        channel: sendingMessage.messagingChannel.channelType,
        deliveryType: 'Normal',
        updatedAt: sendingMessage.createdAt.toISOString(),
        quotedMsgId: sendingMessage.unifiedMessage.quotedMessageId,
        quotedMsgBody: '',
        id: sendingMessage.messageChecksum as unknown as number,
      };

    if (sendingMessage.unifiedMessage.shopify.sharedLineItems) {
      const firstLineItem =
        sendingMessage.unifiedMessage.shopify.sharedLineItems[0];

      if (firstLineItem) {
        let imageDimensions = {
          width: 0,
          height: 0,
        };

        try {
          const bmp = await createImageBitmapFromURL(
            firstLineItem.coverImageUrl,
          );
          imageDimensions = {
            width: bmp.width,
            height: bmp.height,
          };
        } catch (e) {
          console.error(e);
        }
        response.messageContent = firstLineItem.messagePreview;
        response.messageType = 'file';
        response.uploadedFiles = [
          {
            sender,
            filename: firstLineItem.coverImageUrl,
            mimeType: 'image/jpeg',
            metadata: {
              ...imageDimensions,
            },
          },
        ];
      }
    }

    if (sendingMessage.unifiedMessage.commerceHub.sharedLineItems) {
      const firstLineItem =
        sendingMessage.unifiedMessage.commerceHub.sharedLineItems[0];
      if (firstLineItem) {
        let imageDimensions = {
          width: 0,
          height: 0,
        };

        try {
          const bmp = await createImageBitmapFromURL(
            firstLineItem.coverImageUrl,
          );
          imageDimensions = {
            width: bmp.width,
            height: bmp.height,
          };
        } catch (e) {
          console.error(e);
        }
        response.messageContent = firstLineItem.messagePreview;
        response.messageType = 'file';
        response.uploadedFiles = [
          {
            sender,
            filename: firstLineItem.coverImageUrl,
            metadata: {
              ...imageDimensions,
            },
          },
        ];
      }
    }

    if (sendingMessage.unifiedMessage.savedReply) {
      if (sendingMessage.unifiedMessage.savedReply.attachment) {
        response.messageType = 'file';
        let imageDimensions = {
          width: 0,
          height: 0,
        };

        try {
          if (sendingMessage.unifiedMessage.savedReply.attachment?.url) {
            const bmp = await createImageBitmapFromURL(
              sendingMessage.unifiedMessage.savedReply.attachment.url,
            );
            imageDimensions = {
              width: bmp.width,
              height: bmp.height,
            };
          }
        } catch (e) {
          console.error(e);
        }

        response.uploadedFiles = [
          {
            filename:
              sendingMessage.unifiedMessage.savedReply.attachment?.filename,
            mimeType:
              sendingMessage.unifiedMessage.savedReply.attachment?.mimeType,
            metadata: {
              ...imageDimensions,
            },
          },
        ];
      }
    }

    if (sendingMessage.unifiedMessage.attachments) {
      response.messageType = 'file';
      const uploadedFiles = await Promise.allSettled(
        sendingMessage.unifiedMessage.attachments.map(async (attachment) => {
          let imageDimensions = {
            width: 0,
            height: 0,
          };

          try {
            if (attachment.blob) {
              const bmp = await createImageBitmapFromBlob(attachment.blob);
              imageDimensions = {
                width: bmp.width,
                height: bmp.height,
              };
            }
          } catch (e) {
            console.error(e);
          }
          return {
            sender,
            fileSize: attachment.blob.size,
            name: attachment.blob.name,
            mimeType: attachment.blob.type,
            metadata: {
              ...imageDimensions,
            },
          };
        }),
      );

      response.uploadedFiles = uploadedFiles
        .map((x) => {
          if (x.status === 'fulfilled') {
            return x.value;
          }
          return;
        })
        .filter(notEmpty);
    }

    if (sendingMessage.unifiedMessage.whatsappCloudApi?.templateMessage) {
      response.messageType = 'template';
      response.extendedMessagePayload = {
        channel: sendingMessage.messagingChannel.channelType,
        extendedMessageType: 101,
        extendedMessagePayloadDetail: {
          whatsappCloudApiTemplateMessageObject:
            sendingMessage.unifiedMessage.whatsappCloudApi.templateMessage,
        },
      };
    }

    if (sendingMessage.unifiedMessage.whatsapp360Dialog?.templateMessage) {
      response.messageType = 'template';
      response.whatsapp360DialogExtendedMessagePayload = {
        whatsapp360DialogTemplateMessage:
          sendingMessage.unifiedMessage.whatsapp360Dialog.templateMessage,
      };
    }

    if (sendingMessage.unifiedMessage.whatsappTwilio?.templateMessage) {
      response.messageType = 'text';
      response.extendedMessagePayload = {
        channel: sendingMessage.messagingChannel.channelType,
        extendedMessageType:
          ExtendedMessageType.WhatsappTwilioContentTemplateMessage,
        extendedMessagePayloadDetail: {
          whatsappTwilioContentApiObject:
            sendingMessage.unifiedMessage.whatsappTwilio.templateMessage,
        },
      };
    }

    if (sendingMessage.unifiedMessage.whatsappCloudApi?.interactiveMessage) {
      response.messageType = 'interactive';
      response.extendedMessagePayload = {
        channel: sendingMessage.messagingChannel.channelType,
        extendedMessageType: 102,
        extendedMessagePayloadDetail: {
          whatsappCloudApiInteractiveObject:
            sendingMessage.unifiedMessage.whatsappCloudApi.interactiveMessage,
        },
      };
    }

    if (sendingMessage.unifiedMessage.whatsapp360Dialog?.interactiveMessage) {
      response.messageType = 'interactive';
      response.whatsapp360DialogExtendedMessagePayload = {
        whatsapp360DialogInteractiveObject:
          sendingMessage.unifiedMessage.whatsapp360Dialog.interactiveMessage,
      };
    }

    // note channel
    if (sendingMessage.messagingChannel.channelType === 'note') {
      const text = sendingMessage.unifiedMessage.text.replace(
        /@\[(.*?)]\(.*?\)/g,
        '$1',
      );
      response.messageContent = text;
      const foundStaff = allStaff.find(
        (staff) =>
          staff.staffIdentityId ===
          sendingMessage.unifiedMessage.mentionedStaffIdentityId,
      );
      if (foundStaff) {
        response.messageAssignee = foundStaff;
      }
    }

    if (sendingMessage.unifiedMessage.audio) {
      response.messageType = 'file';
      const blobType = sendingMessage.unifiedMessage.audio.type;
      const fileExtension = AUDIO_TYPES[blobType]?.extension ?? 'bin';
      response.uploadedFiles = [
        {
          sender,
          fileSize: sendingMessage.unifiedMessage.audio.size,
          filename: `voice.${fileExtension}`,
          mimeType: blobType,
        },
      ];
    }

    if (sendingMessage.messagingChannel.channelType !== 'note') {
      const messageContent = staff.shouldShowSenderName
        ? `*${staff.firstName} ${staff.lastName}*\n${sendingMessage.unifiedMessage.text}`
        : '' + sendingMessage.unifiedMessage.text;
      response.messageContent = messageContent;
    }

    return response;
  }
}
