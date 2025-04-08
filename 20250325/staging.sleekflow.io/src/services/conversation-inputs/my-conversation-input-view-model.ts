import { v4 as uuid4 } from 'uuid';
import type {
  SleekflowApisCommerceHubModelProductVariantDto,
  SleekflowApisMessagingHubModelBusinessBalanceDto,
  SleekflowApisMessagingHubModelWhatsappCloudApiInteractiveObject,
  TravisBackendChannelDomainViewModelsCreateTemplateWithContentApiResponse,
  TravisBackendChannelDomainViewModelsWhatsAppBusinessApiTemplateViewModel,
  TravisBackendCompanyDomainModelsCompanyQuickReplyFile,
  TravisBackendConversationDomainViewModelsCompanyResponse,
  TravisBackendDataWhatsappCloudApiWhatsappCloudApiTemplateResponse,
  TravisBackendIntegrationServicesModelsShopifyProduct,
  TravisBackendMessageDomainModelsWhatsappTwilioContentApiObject,
  TravisBackendMessageDomainViewModelsWhatsapp360DialogTemplateMessageViewModel,
  TravisBackendMessageDomainViewModelsWhatsappCloudApiTemplateMessageViewModel,
  WABA360DialogApiClientPayloadsModelsMessageObjectsInteractiveObjectsInteractiveObject,
} from '@sleekflow/sleekflow-core-typescript-rxjs-apis';
import dayjs from 'dayjs';
import {
  BehaviorSubject,
  combineLatest,
  map,
  Observable,
  of,
  switchMap,
} from 'rxjs';

import { trackMessageSentFromInbox } from '@/pages/InboxRXJS/ConversationWindow/ConversationInput/RichTextEditor/utils';
import { FlattenedWhatsappTwilioTemplate } from '@/pages/InboxRXJS/ConversationWindow/ConversationMessageHistory/MessageContent/message-blocks/WhatsAppTwilioTemplateMessage/utils';
import { CommerceService } from '@/services/commerces/commerce.service';
import {
  CompanyService,
  MessagingChannel,
} from '@/services/companies/company.service';
import { ConversationMessageService } from '@/services/conversation-messages/conversation-message.service';
import { ConversationMessageWrapper } from '@/services/conversation-messages/managers/conversation-message-wrapper';
import { SendingConversationMessageManager } from '@/services/conversation-messages/managers/sending-conversation-message-manager';
import { FeatureService } from '@/services/features/feature.service';

import { ConversationService } from '../conversations/conversation.service';
import { I18nService } from '../i18n/i18n.service';
import { ToastMessagesService } from '../toast-messages/toast-messages.service';
import { LogService } from '../logs/log.service';

export interface QuickReply {
  id: number;
  title: string;
  previewContent: string;
  attachment?: TravisBackendCompanyDomainModelsCompanyQuickReplyFile;
  conversationId: string;
}

export interface MyConversationInputViewModelProps {
  conversationId: string;
  messagingChannel: MessagingChannel | '';
}

export interface UnifiedMessageShopifySharedProduct {
  messagePreview: string;
  coverImageUrl: string;
  product: TravisBackendIntegrationServicesModelsShopifyProduct;
}

export interface UnifiedMessageCommerceHubSharedProduct {
  messagePreview: string;
  coverImageUrl: string;
  productVariant: SleekflowApisCommerceHubModelProductVariantDto;
}

export interface UnifiedMessageAttachment {
  blob: File;
  id: string;
}

// 1. template - ok
// 2. interactive message - ok
// 3. attachments i.e. image / video / voice / ...
// 4. text + emoji - ok
// 5. shopify / custom catalog / payment link - ok
// 6. enrichment
// 7. replying

export interface UnifiedMessage {
  whatsappCloudApi:
    | {
        seletedTemplate?:
          | TravisBackendDataWhatsappCloudApiWhatsappCloudApiTemplateResponse
          | undefined;
        templateMessage:
          | TravisBackendMessageDomainViewModelsWhatsappCloudApiTemplateMessageViewModel
          | undefined;
        interactiveMessage:
          | SleekflowApisMessagingHubModelWhatsappCloudApiInteractiveObject
          | undefined;
      }
    | undefined;
  whatsappTwilio:
    | {
        // TravisBackendMessageDomainModelsExtendedMessagePayloadDetail
        selectedTemplate:
          | FlattenedWhatsappTwilioTemplate
          | TravisBackendChannelDomainViewModelsCreateTemplateWithContentApiResponse
          | undefined;
        templateMessage:
          | TravisBackendMessageDomainModelsWhatsappTwilioContentApiObject
          | undefined;
      }
    | undefined;
  whatsapp360Dialog:
    | {
        selectedTemplate:
          | TravisBackendChannelDomainViewModelsWhatsAppBusinessApiTemplateViewModel
          | undefined;
        templateMessage:
          | TravisBackendMessageDomainViewModelsWhatsapp360DialogTemplateMessageViewModel
          | undefined;
        interactiveMessage:
          | WABA360DialogApiClientPayloadsModelsMessageObjectsInteractiveObjectsInteractiveObject
          | undefined;
      }
    | undefined;
  facebook:
    | {
        // {"conversationId":"da48df24-f46e-4e94-acea-7ebd42512112","messageContent":"Testing","channel":"facebook","messageChecksum":"8e477cd8-a2d1-4198-bf0c-9cfc7c834a20","channelIdentityId":"175520422315600","messageTag":"CONFIRMED_EVENT_UPDATE","files":[],"messageType":"text","context":{"channelInfo":{"id":"175520422315600","channel":"facebook","name":"facebook","channelIdentityId":"175520422315600"}}}
        messageTag:
          | 'ACCOUNT_UPDATE'
          | 'POST_PURCHASE_UPDATE'
          | 'CONFIRMED_EVENT_UPDATE'
          | undefined;
      }
    | undefined;
  text: string;
  audio: Blob | undefined;
  attachments: UnifiedMessageAttachment[] | undefined;
  quotedMessageId: string | undefined;
  shopify: {
    sharedLineItems: UnifiedMessageShopifySharedProduct[] | undefined;
    link: string | undefined;
  };
  commerceHub: {
    sharedLineItems: UnifiedMessageCommerceHubSharedProduct[] | undefined;
  };
  stripe:
    | {
        paymentIntentId: string | undefined;
      }
    | undefined;
  savedReply: QuickReply | undefined;
  mentionedStaffIdentityId: string | undefined;
}

export const DEFAULT_UNIFIED_MESSAGE: UnifiedMessage = {
  whatsappCloudApi: {
    templateMessage: undefined,
    interactiveMessage: undefined,
  },
  whatsappTwilio: {
    selectedTemplate: undefined,
    templateMessage: undefined,
  },
  whatsapp360Dialog: {
    selectedTemplate: undefined,
    templateMessage: undefined,
    interactiveMessage: undefined,
  },
  facebook: undefined,
  text: '',
  audio: undefined,
  attachments: undefined,
  quotedMessageId: undefined,
  shopify: {
    sharedLineItems: undefined,
    link: undefined,
  },
  commerceHub: {
    sharedLineItems: undefined,
  },
  stripe: undefined,

  savedReply: undefined,
  mentionedStaffIdentityId: undefined,
};

export interface DisplayStates {
  shouldDisplayWhatsAppCloudApiTemplateMsgButton: boolean;
  shouldDisplayWhatsAppCloudApiInteractiveMsgButton: boolean;

  shouldDisplayWhatsAppTwilioTemplateMsgButton: boolean;
  shouldDisplayWhatsAppTwilioInteractiveMsgButton: boolean;

  shouldDisplayWhatsApp360DialogTemplateMsgButton: boolean;
  shouldDisplayWhatsApp360DialogInteractiveMsgButton: boolean;

  shouldDisplayAttachmentsButton: boolean;
  shouldDisplaySavedReplyButton: boolean;
  shouldDisplayEmojiButton: boolean;
  shouldDisplayAudioButton: boolean;
  shouldDisplayCommerceDropdownButton: boolean;
  shouldDisplayCommercePaymentLinkButton: boolean;

  shouldDisplayAiWritingAssistantButton: boolean;
  shouldDisplayAiSummarizeButton: boolean;
  shouldDisplayAiSmartReplyButton: boolean;
  shouldDisplayContactLimitExceededError: boolean;
  shouldDisplayWhatsappInsufficientBalanceError: boolean;

  numOfCharacters: number;
  maxNumOfCharacters: number;

  shouldCalculateWhatsAppCloudApiWindow: boolean;
  shouldCalculateWhatsAppTwilioWindow: boolean;
  shouldCalculateWhatsApp360DialogWindow: boolean;
  shouldCalculateFacebookWindow: boolean;
  shouldCalculateWechatWindow: boolean;

  shouldEnableSendButton: boolean;
  shouldEnableRecordAudioButton: boolean;
  shouldEnableSavedReplyButton: boolean;

  shopify: {
    numOfCharactersEntries: number[];
  };
  commerceHub: {
    numOfCharactersEntries: number[];
  };
}

export class MyConversationInputViewModel {
  private messagingChannel$$: BehaviorSubject<MessagingChannel | ''> =
    new BehaviorSubject<MessagingChannel | ''>('');
  private unifiedMessage$$: BehaviorSubject<UnifiedMessage> =
    new BehaviorSubject<UnifiedMessage>(DEFAULT_UNIFIED_MESSAGE);
  private isSending$$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false,
  );
  private hasDismissedCTAOverlay$$: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);

  private conversationId: string | undefined;

  constructor(
    private conversationMessageService: ConversationMessageService,
    private featureService: FeatureService,
    private commerceService: CommerceService,
    private sendingConversationMessageManager: SendingConversationMessageManager,
    private companyService: CompanyService,
    private conversationService: ConversationService,
    private i18nService: I18nService,
    private toastMessagesService: ToastMessagesService,
    private logService: LogService,
  ) {}

  public setup(props: MyConversationInputViewModelProps) {
    this.messagingChannel$$.next(props.messagingChannel);

    this.conversationId = props.conversationId;
  }

  public getLastMessageFromUser$() {
    return this.messagingChannel$$.pipe(
      switchMap((messagingChannel) => {
        if (messagingChannel === '') {
          return of(undefined);
        }

        return this.conversationMessageService.getLastMessageFromUser$(
          messagingChannel.channelType,
          this.conversationId!,
          messagingChannel.channelIdentityId === null
            ? undefined
            : messagingChannel.channelIdentityId,
        );
      }),
    );
  }

  public onNextSeletedWhatsappCloudApiTemplate$(
    template:
      | TravisBackendDataWhatsappCloudApiWhatsappCloudApiTemplateResponse
      | undefined,
  ) {
    this.unifiedMessage$$.next({
      ...this.unifiedMessage$$.value,
      whatsappCloudApi: {
        seletedTemplate: template,
        templateMessage: undefined,
        interactiveMessage: undefined,
      },
    });
  }

  public onNextWhatsappCloudApiTemplate$(
    template: TravisBackendMessageDomainViewModelsWhatsappCloudApiTemplateMessageViewModel,
  ) {
    this.unifiedMessage$$.next({
      ...this.unifiedMessage$$.value,
      whatsappCloudApi: {
        seletedTemplate:
          this.unifiedMessage$$.value.whatsappCloudApi?.seletedTemplate,
        templateMessage: template,
        interactiveMessage: undefined,
      },
    });
  }

  public onNextSeletedWhatsappTwilioTemplate$(
    template:
      | FlattenedWhatsappTwilioTemplate
      | TravisBackendChannelDomainViewModelsCreateTemplateWithContentApiResponse
      | undefined,
  ) {
    this.unifiedMessage$$.next({
      ...this.unifiedMessage$$.value,
      whatsappTwilio: {
        selectedTemplate: template,
        templateMessage: undefined,
      },
    });
  }

  public onNextWhatsappTwilioTemplate$(
    template: TravisBackendMessageDomainModelsWhatsappTwilioContentApiObject,
  ) {
    this.unifiedMessage$$.next({
      ...this.unifiedMessage$$.value,
      whatsappTwilio: {
        templateMessage: template,
        selectedTemplate:
          this.unifiedMessage$$.value.whatsappTwilio?.selectedTemplate,
      },
    });
  }

  public onNextSelectedWhatsapp360DialogTemplate$(
    template:
      | TravisBackendChannelDomainViewModelsWhatsAppBusinessApiTemplateViewModel
      | undefined,
  ) {
    this.unifiedMessage$$.next({
      ...this.unifiedMessage$$.value,
      whatsapp360Dialog: {
        selectedTemplate: template,
        templateMessage: undefined,
        interactiveMessage: undefined,
      },
    });
  }

  public onNextWhatsapp360DialogTemplate$(
    template: TravisBackendMessageDomainViewModelsWhatsapp360DialogTemplateMessageViewModel,
  ) {
    this.unifiedMessage$$.next({
      ...this.unifiedMessage$$.value,
      whatsapp360Dialog: {
        selectedTemplate:
          this.unifiedMessage$$.value.whatsapp360Dialog?.selectedTemplate,
        templateMessage: template,
        interactiveMessage: undefined,
      },
    });
  }

  public onNextWhatsappInteractiveMessage$(
    channelType: string,
    interactiveMessage:
      | SleekflowApisMessagingHubModelWhatsappCloudApiInteractiveObject
      | WABA360DialogApiClientPayloadsModelsMessageObjectsInteractiveObjectsInteractiveObject
      | undefined,
  ) {
    if (channelType === 'whatsappcloudapi') {
      this.onNextWhatsappCloudApiInteractiveMessage$(
        (interactiveMessage as SleekflowApisMessagingHubModelWhatsappCloudApiInteractiveObject) ||
          undefined,
      );
    }
    if (channelType === 'whatsapp360dialog') {
      this.onNextWhatsapp360DialogInteractiveMessage$(
        (interactiveMessage as WABA360DialogApiClientPayloadsModelsMessageObjectsInteractiveObjectsInteractiveObject) ||
          undefined,
      );
    }
  }

  public onNextWhatsappCloudApiInteractiveMessage$(
    interactiveMessage:
      | SleekflowApisMessagingHubModelWhatsappCloudApiInteractiveObject
      | undefined,
  ) {
    this.unifiedMessage$$.next({
      ...this.unifiedMessage$$.value,
      whatsappCloudApi: {
        templateMessage: undefined,
        interactiveMessage: interactiveMessage,
      },
    });
  }

  public onNextWhatsapp360DialogInteractiveMessage$(
    interactiveMessage:
      | WABA360DialogApiClientPayloadsModelsMessageObjectsInteractiveObjectsInteractiveObject
      | undefined,
  ) {
    this.unifiedMessage$$.next({
      ...this.unifiedMessage$$.value,
      whatsapp360Dialog: {
        selectedTemplate: undefined,
        templateMessage: undefined,
        interactiveMessage: interactiveMessage,
      },
    });
  }

  public onNextText$(text: string) {
    if (text === '') {
      this.unifiedMessage$$.next({
        ...this.unifiedMessage$$.value,
        text: text,
        savedReply: DEFAULT_UNIFIED_MESSAGE.savedReply,
        stripe: DEFAULT_UNIFIED_MESSAGE.stripe,
      });

      return;
    }

    this.unifiedMessage$$.next({
      ...this.unifiedMessage$$.value,
      text,
    });
  }

  public onNextMentionedStaffIdentityId$(
    mentionedStaffIdentityId: string | undefined,
  ) {
    this.unifiedMessage$$.next({
      ...this.unifiedMessage$$.value,
      mentionedStaffIdentityId: mentionedStaffIdentityId,
    });
  }

  public onNextAudio$(audio: Blob | undefined) {
    if (audio) {
      this.unifiedMessage$$.next({
        ...this.unifiedMessage$$.value,
        audio,
      });
    } else {
      this.unifiedMessage$$.next({
        ...this.unifiedMessage$$.value,
        audio: undefined,
      });
    }
  }

  public onNextSavedReply$(savedReply: QuickReply) {
    this.unifiedMessage$$.next({
      ...this.unifiedMessage$$.value,
      savedReply: savedReply,
      attachments: DEFAULT_UNIFIED_MESSAGE.attachments,
      stripe: DEFAULT_UNIFIED_MESSAGE.stripe,
      text: savedReply.previewContent,
    });
  }

  public onNextAttachments$(attachments: UnifiedMessageAttachment[]) {
    this.unifiedMessage$$.next({
      ...this.unifiedMessage$$.value,
      attachments,
    });
  }

  public onNextQuotedMessageId$(quotedMessageId: string | undefined) {
    if (quotedMessageId) {
      this.unifiedMessage$$.next({
        ...this.unifiedMessage$$.value,
        quotedMessageId,
      });
    } else {
      this.unifiedMessage$$.next({
        ...this.unifiedMessage$$.value,
        quotedMessageId: undefined,
      });
    }
  }

  public onNextStripePaymentLink$(
    paymentIntentId: string,
    messagePreview: string,
  ) {
    this.unifiedMessage$$.next({
      ...DEFAULT_UNIFIED_MESSAGE,
      text: messagePreview,
      stripe: {
        paymentIntentId,
      },
    });
  }

  public onNextShopifyPaymentLink$(link: string, messagePreview: string) {
    this.unifiedMessage$$.next({
      ...DEFAULT_UNIFIED_MESSAGE,
      text: messagePreview,
      shopify: {
        sharedLineItems: undefined,
        link,
      },
    });
  }

  public onNextShopifySharedProducts$(
    lineItems: UnifiedMessageShopifySharedProduct[],
  ) {
    this.unifiedMessage$$.next({
      ...DEFAULT_UNIFIED_MESSAGE,
      shopify: {
        sharedLineItems: lineItems,
        link: undefined,
      },
    });
  }

  public onNextCommerceHubSharedProducts$(
    lineItems: UnifiedMessageCommerceHubSharedProduct[],
  ) {
    this.unifiedMessage$$.next({
      ...DEFAULT_UNIFIED_MESSAGE,
      commerceHub: {
        sharedLineItems: lineItems,
      },
    });
  }

  public onNextFacebookMessageTag$(
    messageTag:
      | 'ACCOUNT_UPDATE'
      | 'POST_PURCHASE_UPDATE'
      | 'CONFIRMED_EVENT_UPDATE'
      | undefined,
  ) {
    this.unifiedMessage$$.next({
      ...this.unifiedMessage$$.value,
      facebook: {
        messageTag,
      },
    });
  }

  public getUnifiedMessage$(): Observable<UnifiedMessage> {
    return this.unifiedMessage$$.asObservable();
  }

  public getMessagingChannel$(): Observable<MessagingChannel | ''> {
    return this.messagingChannel$$.asObservable();
  }

  private getIsWhatsappChannelInsufficientBalance(
    channel: MessagingChannel | '',
    company?: TravisBackendConversationDomainViewModelsCompanyResponse | null,
    cloudApiUsages?: SleekflowApisMessagingHubModelBusinessBalanceDto[],
  ) {
    if (
      !company ||
      !channel ||
      !['whatsapp', 'whatsapp360dialog', 'whatsappcloudapi'].includes(
        channel.channelType,
      )
    ) {
      return false;
    }

    if (channel.channelType === 'whatsapp360dialog') {
      return !!company.whatsApp360DialogConfigs?.find(
        (config) =>
          config.channelIdentityId === channel.channelIdentityId &&
          config.isSuspended,
      );
    }

    if (channel.channelType === 'whatsappcloudapi') {
      return !!cloudApiUsages?.find(
        (config) =>
          config.facebook_business_id === channel.facebookWabaBusinessId &&
          config.balance?.amount !== null &&
          config.balance?.amount !== undefined &&
          getWhatsappCloudApiBalanceAmount(config, channel.facebookWabaId) < 0,
      );
    }

    if (channel.channelType === 'whatsapp') {
      return !!company.twilioUsageRecords?.find(
        (config) =>
          config.twilioAccountId === channel.twilioAccountId?.split(';')[0] &&
          config.balance !== null &&
          config.balance !== undefined &&
          config.balance < 0,
      );
    }

    throw new Error('Unsupported channel type');
  }

  public getDisplayStates$(): Observable<DisplayStates> {
    return combineLatest({
      commerceStores: this.commerceService.getStores$(),
      unifiedMessage: this.unifiedMessage$$,
      messagingChannel: this.messagingChannel$$,
      isShopifyIntegrationEnabled:
        this.featureService.getIsShopifyIntegrationEnabled$(),
      isCommerceHubIntegrationEnabled:
        this.featureService.getIsCommerceHubStoresEnabled$(),
      isAiIntegrationEnabled: this.featureService.getIsAiIntegrationEnabled$(),
      isSleekpayEnabled: this.featureService.getIsSleekpayIntegrationEnabled$(),
      isWritingAssistantEnabled:
        this.featureService.getIsWritingAssistantEnabled$(),
      isSmartReplyEnabled: this.featureService.getIsSmartReplyEnabled$(),
      company: this.companyService.getCompany$(),
      companyUsage: this.companyService.getCompanyUsage$(),
      cloudApiUsage: this.companyService.getWhatsappCloudApiBalances$(),
    }).pipe(
      map(
        ({
          commerceStores,
          unifiedMessage,
          messagingChannel,
          isShopifyIntegrationEnabled,
          isCommerceHubIntegrationEnabled,
          isAiIntegrationEnabled,
          isSleekpayEnabled,
          isWritingAssistantEnabled,
          isSmartReplyEnabled,
          company,
          companyUsage,
          cloudApiUsage,
        }) => {
          const maxNumOfCharacters =
            messagingChannel === '' || messagingChannel.channelType === 'note'
              ? 32768
              : 4096;

          const isEmptyInput = unifiedMessage.text.length === 0;

          return {
            shouldDisplayWhatsAppCloudApiTemplateMsgButton:
              messagingChannel !== '' &&
              messagingChannel.channelType === 'whatsappcloudapi',
            shouldDisplayWhatsAppCloudApiInteractiveMsgButton:
              messagingChannel !== '' &&
              messagingChannel.channelType === 'whatsappcloudapi',

            shouldDisplayWhatsAppTwilioTemplateMsgButton:
              messagingChannel !== '' &&
              messagingChannel.channelType === 'whatsapp',
            shouldDisplayWhatsAppTwilioInteractiveMsgButton:
              messagingChannel !== '' &&
              messagingChannel.channelType === 'whatsapp',

            shouldDisplayWhatsApp360DialogTemplateMsgButton:
              messagingChannel !== '' &&
              messagingChannel.channelType === 'whatsapp360dialog',
            shouldDisplayWhatsApp360DialogInteractiveMsgButton:
              messagingChannel !== '' &&
              messagingChannel.channelType === 'whatsapp360dialog',

            shouldDisplayAttachmentsButton:
              !unifiedMessage.savedReply &&
              !unifiedMessage.shopify.sharedLineItems &&
              !unifiedMessage.commerceHub.sharedLineItems,
            shouldDisplaySavedReplyButton: messagingChannel !== '',
            shouldDisplayEmojiButton: messagingChannel !== '',
            shouldDisplayAudioButton:
              messagingChannel !== '' &&
              messagingChannel.channelType !== 'instagram',
            shouldDisplayCommerceDropdownButton:
              (isShopifyIntegrationEnabled ||
                isCommerceHubIntegrationEnabled) &&
              messagingChannel !== '' &&
              messagingChannel.channelType !== 'note' &&
              (commerceStores.commerceHubStores.length > 0 ||
                commerceStores.shopifyStores.length > 0),
            shouldDisplayCommercePaymentLinkButton:
              isSleekpayEnabled &&
              messagingChannel !== '' &&
              messagingChannel.channelType !== 'note',

            shouldDisplayAiWritingAssistantButton:
              isAiIntegrationEnabled &&
              isWritingAssistantEnabled &&
              (unifiedMessage.text || '').trim().length > 0,
            shouldDisplayAiSmartReplyButton:
              isAiIntegrationEnabled &&
              isSmartReplyEnabled &&
              (unifiedMessage.text || '').trim().length === 0,
            shouldDisplayAiSummarizeButton:
              isAiIntegrationEnabled &&
              isSmartReplyEnabled &&
              (unifiedMessage.text || '').trim().length === 0,

            shouldDisplayContactLimitExceededError:
              companyUsage?.maximumContacts !== undefined &&
              companyUsage?.totalContacts !== undefined &&
              companyUsage.totalContacts > companyUsage.maximumContacts,

            shouldDisplayWhatsappInsufficientBalanceError:
              this.getIsWhatsappChannelInsufficientBalance(
                messagingChannel,
                company,
                cloudApiUsage,
              ),

            numOfCharacters: unifiedMessage.text
              ? unifiedMessage.text.length
              : 0,
            maxNumOfCharacters: maxNumOfCharacters,

            shouldCalculateWhatsAppCloudApiWindow:
              messagingChannel !== '' &&
              messagingChannel.channelType === 'whatsappcloudapi',
            shouldCalculateWhatsAppTwilioWindow:
              messagingChannel !== '' &&
              messagingChannel.channelType === 'whatsapp',
            shouldCalculateWhatsApp360DialogWindow:
              messagingChannel !== '' &&
              messagingChannel.channelType === 'whatsapp360dialog',
            shouldCalculateFacebookWindow:
              messagingChannel !== '' &&
              messagingChannel.channelType === 'facebook',
            shouldCalculateWechatWindow:
              messagingChannel !== '' &&
              messagingChannel.channelType === 'wechat',

            shouldEnableSendButton:
              ((unifiedMessage.text || '').trim().length > 0 &&
                (unifiedMessage.text || '').length <= maxNumOfCharacters) ||
              !!unifiedMessage.audio ||
              (!!unifiedMessage.attachments &&
                unifiedMessage.attachments.length > 0) ||
              (!!unifiedMessage.commerceHub.sharedLineItems &&
                unifiedMessage.commerceHub.sharedLineItems.length > 0 &&
                unifiedMessage.commerceHub.sharedLineItems.every(
                  (i) => i.messagePreview.length <= maxNumOfCharacters,
                )) ||
              (!!unifiedMessage.shopify.sharedLineItems &&
                unifiedMessage.shopify.sharedLineItems.length > 0 &&
                unifiedMessage.shopify.sharedLineItems.every(
                  (i) => i.messagePreview.length <= maxNumOfCharacters,
                )),

            shouldEnableRecordAudioButton: isEmptyInput,
            shouldEnableSavedReplyButton:
              isEmptyInput || unifiedMessage.text === '/',

            shopify: {
              numOfCharactersEntries:
                unifiedMessage.shopify.sharedLineItems?.map(
                  (lineItem) => lineItem.messagePreview.length,
                ) || [],
            },
            commerceHub: {
              numOfCharactersEntries:
                unifiedMessage.commerceHub.sharedLineItems?.map(
                  (lineItem) => lineItem.messagePreview.length,
                ) || [],
            },
          };
        },
      ),
    );
  }

  public getMessageWindowInfo$(): Observable<
    | {
        lastMessage: ConversationMessageWrapper | undefined;
        lastMessageTimestamp: number | undefined;
        windowSizeInSeconds: number | undefined;
      }
    | undefined
  > {
    return this.messagingChannel$$.pipe(
      switchMap((messagingChannel) => {
        if (messagingChannel === '') {
          return of(undefined);
        }

        if (messagingChannel.channelType === 'whatsappcloudapi') {
          return this.getLastMessageFromUser$().pipe(
            map((lastMessage) => {
              return {
                lastMessage: lastMessage,
                lastMessageTimestamp: lastMessage?.getTimestamp() ?? 0,
                windowSizeInSeconds: 24 * 60 * 60,
              };
            }),
          );
        }

        if (messagingChannel.channelType === 'whatsapp360dialog') {
          return this.getLastMessageFromUser$().pipe(
            map((lastMessage) => {
              return {
                lastMessage: lastMessage,
                lastMessageTimestamp: lastMessage?.getTimestamp() ?? 0,
                windowSizeInSeconds: 24 * 60 * 60,
              };
            }),
          );
        }

        if (messagingChannel.channelType === 'whatsapp') {
          return this.getLastMessageFromUser$().pipe(
            map((lastMessage) => {
              return {
                lastMessage: lastMessage,
                lastMessageTimestamp: lastMessage?.getTimestamp() ?? 0,
                windowSizeInSeconds: 24 * 60 * 60,
              };
            }),
          );
        }

        if (messagingChannel.channelType === 'facebook') {
          return this.getLastMessageFromUser$().pipe(
            map((lastMessage) => {
              return {
                lastMessage: lastMessage,
                lastMessageTimestamp: lastMessage?.getTimestamp() ?? 0,
                windowSizeInSeconds: 7 * 24 * 60 * 60,
              };
            }),
          );
        }

        if (messagingChannel.channelType === 'wechat') {
          return this.getLastMessageFromUser$().pipe(
            map((lastMessage) => {
              return {
                lastMessage: lastMessage,
                lastMessageTimestamp: lastMessage?.getTimestamp() ?? 0,
                windowSizeInSeconds: 3 * 24 * 60 * 60,
              };
            }),
          );
        }

        return this.getLastMessageFromUser$().pipe(
          map((lastMessage) => {
            return {
              lastMessage: lastMessage,
              lastMessageTimestamp: lastMessage?.getTimestamp() ?? 0,
              windowSizeInSeconds: undefined,
            };
          }),
        );
      }),
    );
  }

  public getLastMessage$(): Observable<ConversationMessageWrapper | undefined> {
    return this.messagingChannel$$.pipe(
      switchMap((messagingChannel) => {
        if (messagingChannel === '') {
          return of(undefined);
        }

        return this.conversationMessageService.getLastMessage$(
          messagingChannel.channelType,
          this.conversationId!,
          messagingChannel.channelIdentityId === null
            ? undefined
            : messagingChannel.channelIdentityId,
        );
      }),
    );
  }

  public getIsSending$(): Observable<boolean> {
    return this.isSending$$.asObservable();
  }

  private composeUnifiedMessages(
    unifiedMessage: UnifiedMessage,
  ): UnifiedMessage[] {
    return (
      unifiedMessage.commerceHub.sharedLineItems?.map((item) => ({
        ...unifiedMessage,
        commerceHub: {
          ...unifiedMessage.commerceHub,
          sharedLineItems: [item],
        },
      })) || [unifiedMessage]
    );
  }

  public sendMessage(scheduleSentAt?: dayjs.Dayjs) {
    const unifiedMessage = this.unifiedMessage$$.value;
    const messagingChannel = this.messagingChannel$$.value;

    if (!messagingChannel) {
      this.toastMessagesService.showToastMessage(
        'error',
        this.i18nService.t(
          'sending-conversation-message-manager.error.invalid-or-empty-channel',
          'Failed to send a message. Please select a valid channel and try again',
        ),
      );
      return;
    }

    trackMessageSentFromInbox({
      channelType: messagingChannel.channelType,
      isScheduled: !!scheduleSentAt,
    });

    try {
      const unifiedMessages = this.composeUnifiedMessages(unifiedMessage);
      const sendingMessages = unifiedMessages.map((unifiedMessage) => ({
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'Queued' as const,
        unifiedMessage,
        messagingChannel,
        messageGroupName: uuid4(),
        messageChecksum: uuid4(),
        scheduleSentAt: scheduleSentAt?.toISOString(),
        conversationId: this.conversationId!,
      }));

      this.sendingConversationMessageManager.queueSendingMessages(
        sendingMessages,
      );

      if (unifiedMessage.audio) {
        this.onNextAudio$(undefined);
      } else {
        this.reset();
      }
    } catch (e) {
      this.toastMessagesService.showToastMessage(
        'error',
        this.i18nService.t(
          'sending-conversation-message-manager.error.failed-to-send-message',
          'Failed to send a message. Please try again',
        ),
      );
      this.logService.critical(e, {
        tags: {
          send_message_error: 'client_side',
        },
        extra: {
          unifiedMessage,
          messagingChannel,
          scheduleSentAt,
        },
      });
    }
  }

  public onTyping$() {
    if (!this.conversationId) {
      throw new Error('Missing conversationId in MyConversationInputViewModel');
    }
    return this.conversationService.onConversationTyping(this.conversationId);
  }

  private reset() {
    this.unifiedMessage$$.next(DEFAULT_UNIFIED_MESSAGE);
  }

  public dismissCTAOverlay() {
    this.hasDismissedCTAOverlay$$.next(true);
  }

  public getHasDismissedCTAOverlay$(): Observable<boolean> {
    return combineLatest({
      unifiedMessage: this.getUnifiedMessage$(),
      hasDismissedCTAOverlay: this.hasDismissedCTAOverlay$$,
    }).pipe(
      map(({ unifiedMessage, hasDismissedCTAOverlay }) => {
        return (
          hasDismissedCTAOverlay ||
          unifiedMessage.facebook?.messageTag !== undefined
        );
      }),
    );
  }
}
function getWhatsappCloudApiBalanceAmount(
  config: SleekflowApisMessagingHubModelBusinessBalanceDto,
  facebookWabaId?: string | null,
) {
  return (
    (config.is_by_waba_billing_enabled
      ? config.waba_balances?.find((x) => x.facebook_waba_id === facebookWabaId)
          ?.balance?.amount
      : config?.balance?.amount) ?? 0
  );
}
