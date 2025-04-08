import { TravisBackendMessageDomainViewModelsConversationMessageResponseViewModel } from '@sleekflow/sleekflow-core-typescript-rxjs-apis';
import { format } from 'date-fns';
import { BehaviorSubject, ReplaySubject, startWith, Subject, take } from 'rxjs';

import { StripePaymentStatus } from '@/services/commerces/stripe-payments/constants';
import { I18nService } from '@/services/i18n/i18n.service';
import { getFullName } from '@/utils/formatting';

import { DisposableDataSource } from '../../data-sources/disposable-data-source';
import { Wrapper } from '../../models/wrapper';
import type { ConversationMessageWrapperUpdate } from './conversation-message-wrapper-manager.service';
import {
  formatAiHandoverMessage,
  isAiHandoverMessage,
} from '@/pages/InboxRXJS/ConversationWindow/ConversationMessageHistory/MessageContent/utils';

const fromApiSleekPayRecord = (
  sleekPayRecord: ConversationMessageWrapperMessage['sleekPayRecord'],
) => {
  if (!sleekPayRecord) {
    throw new Error('sleekPayRecord is not existed');
  }

  return {
    ...sleekPayRecord,
    payAmount: sleekPayRecord.lineItems?.reduce((total, nextVal) => {
      if (nextVal.amount && nextVal.quantity) {
        total += nextVal.amount * nextVal.quantity;
      }
      if (nextVal.quantity && nextVal.totalDiscount) {
        total -= nextVal.totalDiscount * nextVal.quantity;
      }

      return total;
    }, 0),
    currency:
      sleekPayRecord.lineItems && sleekPayRecord.lineItems?.length > 0
        ? sleekPayRecord.lineItems[0].currency
        : 'hkd',
  };
};

export const CHANNEL = {
  whatsappTwilio: 'whatsapp',
  whatsapp360Dialog: 'whatsapp360dialog',
  whatsappCloudApi: 'whatsappcloudapi',
  facebook: 'facebook',
  line: 'line',
  wechat: 'wechat',
  note: 'note',
  sms: 'sms',
  telegram: 'telegram',
  viber: 'viber',
  instagram: 'instagram',
  web: 'web',
  email: 'email',
} as const;

export type ChannelType = (typeof CHANNEL)[keyof typeof CHANNEL];

export const MESSAGE_TYPE = {
  text: 'text',
  interactive: 'interactive',
  template: 'template',
  file: 'file',
  paymentLink: 'paymentLink',
  reaction: 'reaction',
  order: 'order',
  facebookAdClickToMessenger: 'facebookAdClickToMessenger',
  location: 'location',
  buttons: 'buttons',
  request_welcome: 'request_welcome',
  quick_reply: 'quick_reply',
  system: 'system',
} as const;

export type MessageType = (typeof MESSAGE_TYPE)[keyof typeof MESSAGE_TYPE];

export type MessageStatus =
  | 'Sending'
  | 'Sent'
  | 'Received'
  | 'Read'
  | 'Failed'
  | 'Undelivered'
  | 'Deleted'
  | 'OutOfCredit'
  | 'Scheduled'
  | 'Queued';

export type ConversationMessageWrapperSystemMetadata = {
  conversation_indicator: {
    i18n_key: string;
    default_value: string;
    components: {
      interpolation_key: string;
      i18n_key?: string;
      text?: string;
      id?: string;
      type?: string;
      color?: string;
      web_action?: {
        type: string;
        params: Record<string, any>;
      };
    }[];
  };
};

export type ConversationMessageWrapperMetadata = {
  errors?: {
    code?: string;
    message?: string;
    [rest: string]: unknown;
  }[];
  'whatsappcloudapi:flow_submission'?: {
    waba_id: string;
    flow_id: string;
    timestamp: string;
    flow_submission_data: {
      [rest: string]: string;
    };
  };
  [rest: string]: unknown;
} & Partial<ConversationMessageWrapperSystemMetadata>;

export type ConversationMessageWrapperMessage = {
  shouldHighlight?: boolean;
  id: number;
  messageContent: string;
  messageType: MessageType;
  messageChecksum: string;
  channelType: ChannelType;
  createdAt: string;
  updatedAt: string;
  deliveryType:
    | 'PaymentLink'
    | 'Normal'
    | 'ReadMore'
    | 'AutomatedMessage'
    | 'FlowHubAction'
    | 'Broadcast'
    | 'QuickReply';
  direction: 'outgoing' | 'incoming';
  status: MessageStatus;
  extendedMessagePayload?: TravisBackendMessageDomainViewModelsConversationMessageResponseViewModel['extendedMessagePayload'];
  whatsapp360DialogExtendedMessagePayload?: TravisBackendMessageDomainViewModelsConversationMessageResponseViewModel['whatsapp360DialogExtendedMessagePayload'];
  reactions: { count: number; emoji: string; users: string[] }[];
  channelIdentityId?: string;
  quotedMsgId?: string;
  messageUniqueID: string;
  uploadedFiles: TravisBackendMessageDomainViewModelsConversationMessageResponseViewModel['uploadedFiles'];
  sleekPayRecord?: TravisBackendMessageDomainViewModelsConversationMessageResponseViewModel['sleekPayRecord'] & {
    status: StripePaymentStatus;
  };
  timestamp: number;
  sender?: TravisBackendMessageDomainViewModelsConversationMessageResponseViewModel['sender'];
  channelStatusMessage?: string;
  messageAssignee?: TravisBackendMessageDomainViewModelsConversationMessageResponseViewModel['messageAssignee'];
  messagingChannel?:
    | ({
        channelType: 'whatsapp';
      } & TravisBackendMessageDomainViewModelsConversationMessageResponseViewModel['whatsappSender'])
    | ({
        channelType: 'whatsapp360dialog';
      } & TravisBackendMessageDomainViewModelsConversationMessageResponseViewModel['whatsapp360DialogReceiver'])
    | ({
        channelType: 'whatsappcloudapi';
      } & TravisBackendMessageDomainViewModelsConversationMessageResponseViewModel['whatsappCloudApiSender'])
    | ({
        channelType: 'facebook';
      } & TravisBackendMessageDomainViewModelsConversationMessageResponseViewModel['facebookReceiver'])
    | ({
        channelType: 'instagram';
      } & TravisBackendMessageDomainViewModelsConversationMessageResponseViewModel['instagramSender'])
    | ({
        channelType: 'viber';
      } & TravisBackendMessageDomainViewModelsConversationMessageResponseViewModel['viberReceiver'])
    | ({
        channelType: 'line';
      } & TravisBackendMessageDomainViewModelsConversationMessageResponseViewModel['lineSender'])
    | ({
        channelType: 'telegram';
      } & TravisBackendMessageDomainViewModelsConversationMessageResponseViewModel['telegramReceiver'])
    | ({
        channelType: 'wechat';
      } & TravisBackendMessageDomainViewModelsConversationMessageResponseViewModel['weChatReceiver'])
    | { channelType: 'note' }
    | { channelType: 'sms' }
    | { channelType: 'web' }
    | { channelType: 'email' };
  scheduleSentAt?: string | undefined | null;
  metadata?: ConversationMessageWrapperMetadata;
};

export interface ConversationMessageWrapperConstructorParams {
  travisBackendMessageDomainViewModelsConversationMessageResponseViewModel?: TravisBackendMessageDomainViewModelsConversationMessageResponseViewModel;
}

export class ConversationMessageWrapper implements Wrapper {
  private i18nService: I18nService;
  private conversationMessageWrapperUpdate$$: Subject<ConversationMessageWrapperUpdate>;
  private readonly id: ConversationMessageWrapperMessage['id'];
  private readonly conversationId: string;
  private readonly messageContent: string;
  private readonly messageType: ConversationMessageWrapperMessage['messageType'];
  private readonly channelType: ConversationMessageWrapperMessage['channelType'];
  private readonly createdAt$$ = new BehaviorSubject<string>('');
  private readonly messageChecksum: string;
  private readonly updatedAt$$ = new ReplaySubject<string>(1);
  private readonly timestamp$$ = new BehaviorSubject<
    ConversationMessageWrapperMessage['timestamp']
  >(0);
  private readonly direction: 'incoming' | 'outgoing' | undefined = undefined;
  private readonly status$$ = new BehaviorSubject<
    ConversationMessageWrapperMessage['status']
  >('Sending');
  private readonly HTMLElement$$ = new BehaviorSubject<HTMLElement | null>(
    null,
  );
  private readonly shouldHighlight$$ = new BehaviorSubject<boolean>(false);
  private readonly quoteMsgId: ConversationMessageWrapperMessage['quotedMsgId'];
  private readonly messageUniqueID: ConversationMessageWrapperMessage['messageUniqueID'];
  private readonly extendedMessagePayload?: ConversationMessageWrapperMessage['extendedMessagePayload'];
  private readonly whatsapp360DialogExtendedMessagePayload?: ConversationMessageWrapperMessage['whatsapp360DialogExtendedMessagePayload'];
  private readonly storyUrl: string | null | undefined;

  private readonly sender?: ConversationMessageWrapperMessage['sender'];

  private readonly messageAssignee?: ConversationMessageWrapperMessage['messageAssignee'];
  private readonly uploadedFiles: ConversationMessageWrapperMessage['uploadedFiles'] =
    [];
  private readonly deliveryType: ConversationMessageWrapperMessage['deliveryType'];
  private readonly sleekPayRecord: ConversationMessageWrapperMessage['sleekPayRecord'];
  private readonly channelIdentityId?: ConversationMessageWrapperMessage['channelIdentityId'];
  private readonly channelStatusMessage?: ConversationMessageWrapperMessage['channelStatusMessage'];

  private readonly scheduleSentAt?: ConversationMessageWrapperMessage['scheduleSentAt'];
  private readonly metadata$$ = new BehaviorSubject<
    NonNullable<ConversationMessageWrapperMessage['metadata']>
  >({});
  private readonly isFromImport?: boolean;

  // Those handling sepecical casse for note message due to conversation last message channel not be able to update if current sending message is note
  private readonly lastConversationIncomingMessageChannel?: string;
  private readonly lastConversationIncomingChannelIdentityId?: string;

  constructor({
    conversationMessageWrapperConstructorParams,
    conversationMessageWrapperUpdate$$,
    i18nService,
  }: {
    conversationMessageWrapperConstructorParams: ConversationMessageWrapperConstructorParams;
    conversationMessageWrapperUpdate$$: Subject<ConversationMessageWrapperUpdate>;
    i18nService: I18nService;
  }) {
    this.i18nService = i18nService;
    this.conversationMessageWrapperUpdate$$ =
      conversationMessageWrapperUpdate$$;
    if (
      conversationMessageWrapperConstructorParams.travisBackendMessageDomainViewModelsConversationMessageResponseViewModel
    ) {
      this.messageChecksum =
        conversationMessageWrapperConstructorParams
          .travisBackendMessageDomainViewModelsConversationMessageResponseViewModel
          ?.messageChecksum || '';
      const travisBackendMessageDomainViewModelsConversationMessageResponseViewModel =
        conversationMessageWrapperConstructorParams.travisBackendMessageDomainViewModelsConversationMessageResponseViewModel;
      this.messageAssignee =
        travisBackendMessageDomainViewModelsConversationMessageResponseViewModel.messageAssignee;
      this.channelStatusMessage =
        travisBackendMessageDomainViewModelsConversationMessageResponseViewModel.channelStatusMessage as ConversationMessageWrapperMessage['channelStatusMessage'];
      this.id =
        travisBackendMessageDomainViewModelsConversationMessageResponseViewModel.id!;
      this.conversationId =
        travisBackendMessageDomainViewModelsConversationMessageResponseViewModel.conversationId!;
      this.messageContent =
        travisBackendMessageDomainViewModelsConversationMessageResponseViewModel.messageContent!;
      this.messageType =
        travisBackendMessageDomainViewModelsConversationMessageResponseViewModel.messageType! as ConversationMessageWrapperMessage['messageType'];
      this.channelType =
        travisBackendMessageDomainViewModelsConversationMessageResponseViewModel.channel! as ConversationMessageWrapperMessage['channelType'];
      this.direction =
        travisBackendMessageDomainViewModelsConversationMessageResponseViewModel.isSentFromSleekflow ===
        true
          ? 'outgoing'
          : 'incoming';

      this.uploadedFiles =
        travisBackendMessageDomainViewModelsConversationMessageResponseViewModel.uploadedFiles as ConversationMessageWrapperMessage['uploadedFiles'];

      // need to transform?
      this.extendedMessagePayload =
        travisBackendMessageDomainViewModelsConversationMessageResponseViewModel.extendedMessagePayload;

      // need to transform?
      this.whatsapp360DialogExtendedMessagePayload =
        travisBackendMessageDomainViewModelsConversationMessageResponseViewModel.whatsapp360DialogExtendedMessagePayload;
      this.storyUrl =
        travisBackendMessageDomainViewModelsConversationMessageResponseViewModel.storyURL;

      this.quoteMsgId =
        travisBackendMessageDomainViewModelsConversationMessageResponseViewModel.quotedMsgId as ConversationMessageWrapperMessage['quotedMsgId'];

      this.messageUniqueID =
        travisBackendMessageDomainViewModelsConversationMessageResponseViewModel.messageUniqueID as ConversationMessageWrapperMessage['messageUniqueID'];

      if (
        travisBackendMessageDomainViewModelsConversationMessageResponseViewModel.sender
      ) {
        this.sender = {
          ...travisBackendMessageDomainViewModelsConversationMessageResponseViewModel.sender,
          displayName:
            travisBackendMessageDomainViewModelsConversationMessageResponseViewModel.sender.displayName?.trim() ||
            getFullName({
              firstName:
                travisBackendMessageDomainViewModelsConversationMessageResponseViewModel
                  .sender.firstName,
              lastName:
                travisBackendMessageDomainViewModelsConversationMessageResponseViewModel
                  .sender.lastName,
              fallback:
                travisBackendMessageDomainViewModelsConversationMessageResponseViewModel
                  .sender.email || this.i18nService.t('general.unknown-label'),
            }),
        };
      }

      this.deliveryType =
        travisBackendMessageDomainViewModelsConversationMessageResponseViewModel.deliveryType as ConversationMessageWrapperMessage['deliveryType'];

      if (
        travisBackendMessageDomainViewModelsConversationMessageResponseViewModel.sleekPayRecord
      ) {
        this.sleekPayRecord = fromApiSleekPayRecord(
          travisBackendMessageDomainViewModelsConversationMessageResponseViewModel.sleekPayRecord as ConversationMessageWrapperMessage['sleekPayRecord'],
        );
      }

      if (
        travisBackendMessageDomainViewModelsConversationMessageResponseViewModel.channelIdentityId
      ) {
        this.channelIdentityId =
          travisBackendMessageDomainViewModelsConversationMessageResponseViewModel.channelIdentityId;
      }

      this.scheduleSentAt =
        travisBackendMessageDomainViewModelsConversationMessageResponseViewModel.scheduleSentAt;

      if (
        travisBackendMessageDomainViewModelsConversationMessageResponseViewModel.channelName ===
          'note' &&
        travisBackendMessageDomainViewModelsConversationMessageResponseViewModel.metadata
      ) {
        this.lastConversationIncomingMessageChannel =
          travisBackendMessageDomainViewModelsConversationMessageResponseViewModel.metadata?.conversationLastMessageChannel;
        this.lastConversationIncomingChannelIdentityId =
          travisBackendMessageDomainViewModelsConversationMessageResponseViewModel.metadata?.conversationLastChannelIdentityId;
      }

      this.onNextTravisBackendMessageDomainViewModelsConversationMessageResponseViewModel(
        travisBackendMessageDomainViewModelsConversationMessageResponseViewModel,
      );
    } else {
      throw new Error();
    }
  }

  public onNextTravisBackendMessageDomainViewModelsConversationMessageResponseViewModel(
    travisBackendMessageDomainViewModelsConversationMessageResponseViewModel: TravisBackendMessageDomainViewModelsConversationMessageResponseViewModel,
  ) {
    if (
      travisBackendMessageDomainViewModelsConversationMessageResponseViewModel.conversationId !==
      this.conversationId
    ) {
      throw new Error(
        `conversationId must match, received ${travisBackendMessageDomainViewModelsConversationMessageResponseViewModel.conversationId} but expected ${this.conversationId}`,
      );
    }

    this.updatedAt$$
      .pipe(take(1), startWith(format(new Date(0), "yyyy-MM-dd'T'HH:mm:ss'Z'")))
      .subscribe((lastUpdatedAt) => {
        const newUpdatedAt =
          travisBackendMessageDomainViewModelsConversationMessageResponseViewModel.updatedAt!;

        if (newUpdatedAt > lastUpdatedAt) {
          this.updatedAt$$.next(
            travisBackendMessageDomainViewModelsConversationMessageResponseViewModel.updatedAt!,
          );
          this.conversationMessageWrapperUpdate$$.next({
            id: this.id,
            type: 'updatedAt',
            newValue: {
              updatedAt:
                travisBackendMessageDomainViewModelsConversationMessageResponseViewModel.updatedAt!,
            },
          });

          this.status$$.next(
            travisBackendMessageDomainViewModelsConversationMessageResponseViewModel.status! as ConversationMessageWrapperMessage['status'],
          );

          this.createdAt$$.next(
            travisBackendMessageDomainViewModelsConversationMessageResponseViewModel.createdAt!,
          );

          this.timestamp$$.next(
            travisBackendMessageDomainViewModelsConversationMessageResponseViewModel.timestamp!,
          );

          this.metadata$$.next(
            travisBackendMessageDomainViewModelsConversationMessageResponseViewModel.metadata ||
              {},
          );

          this.conversationMessageWrapperUpdate$$.next({
            id: this.id,
            type: 'status',
            newValue: {
              status:
                travisBackendMessageDomainViewModelsConversationMessageResponseViewModel.status!,
            },
          });
        }
      });
  }

  public onNextStatus(status: ConversationMessageWrapperMessage['status']) {
    this.status$$.next(status);
  }

  public getHTMLElement$() {
    return this.HTMLElement$$.asObservable();
  }

  public setHTMLElement(HTMLElement: HTMLElement) {
    this.HTMLElement$$.next(HTMLElement);
  }

  public getShouldHighlight$() {
    return this.shouldHighlight$$.asObservable();
  }

  public getShouldHighlight() {
    return this.shouldHighlight$$.value;
  }

  public setShouldHighlight(shouldHighlight: boolean) {
    this.shouldHighlight$$.next(shouldHighlight);
  }

  // This would be "" for incoming messages
  public getMessageChecksum() {
    return this.messageChecksum;
  }

  public getId() {
    return this.id;
  }

  public getChannelStatusMessage() {
    return this.channelStatusMessage;
  }

  public getExtendedMessagePayload() {
    return this.extendedMessagePayload;
  }

  public getWhatsapp360DialogExtendedMessagePayload() {
    return this.whatsapp360DialogExtendedMessagePayload;
  }

  public getStoryUrl() {
    return this.storyUrl;
  }

  public getConversationId() {
    return this.conversationId;
  }

  public getMessageAssignee() {
    return this.messageAssignee;
  }

  public getMessageContent() {
    return isAiHandoverMessage(this.messageContent)
      ? formatAiHandoverMessage(this.messageContent, this.i18nService.t)
      : this.messageContent;
  }

  public getRawMessageContent() {
    return this.messageContent;
  }

  public getMessageType() {
    return this.messageType;
  }

  public getChannelType() {
    return this.channelType;
  }

  public getCreatedAt() {
    return this.createdAt$$.getValue();
  }

  public getUpdatedAt$() {
    return this.updatedAt$$.asObservable();
  }

  public getMessageUniqueID() {
    return this.messageUniqueID;
  }

  public getDirection() {
    return this.direction;
  }

  public getQuoteMsgId() {
    return this.quoteMsgId;
  }

  public getUploadedFiles() {
    return this.uploadedFiles;
  }

  public getTimestamp() {
    return this.timestamp$$.getValue();
  }

  public getStatus$() {
    return this.status$$.asObservable();
  }

  public getDeliveryType() {
    return this.deliveryType;
  }

  public getSleekpayRecord() {
    return this.sleekPayRecord;
  }

  public getSender() {
    return this.sender;
  }

  public getChannelIdentityId() {
    return this.channelIdentityId;
  }

  public getScheduleSentAt() {
    return this.scheduleSentAt;
  }

  public getLastConversationIncomingMessageChannel() {
    return this.lastConversationIncomingMessageChannel;
  }

  public getLastConversationIncomingChannelIdentityId() {
    return this.lastConversationIncomingChannelIdentityId;
  }

  public getMetadata$() {
    return this.metadata$$.asObservable();
  }

  public getIsFromImport() {
    return this.isFromImport;
  }

  destroy() {
    this.updatedAt$$.complete();
    this.status$$.complete();
    this.metadata$$.complete();
  }

  private subscribingDataSources: DisposableDataSource[] = [];

  subscribe(disposableDataSource: DisposableDataSource): void {
    this.subscribingDataSources = [
      ...new Set([...this.subscribingDataSources, disposableDataSource]),
    ];
  }

  unsubscribe(disposableDataSource: DisposableDataSource): void {
    this.subscribingDataSources = this.subscribingDataSources.filter((d) => {
      return d !== disposableDataSource;
    });
  }

  observed() {
    this.subscribingDataSources = this.subscribingDataSources.filter((d) => {
      return !d.disconnected();
    });

    return (
      this.updatedAt$$.observed ||
      this.status$$.observed ||
      this.metadata$$.observed ||
      this.subscribingDataSources.length !== 0
    );
  }

  private static loading: ConversationMessageWrapper =
    new ConversationMessageWrapper({
      conversationMessageWrapperConstructorParams: {
        travisBackendMessageDomainViewModelsConversationMessageResponseViewModel:
          {
            id: -1,
          },
      },
      conversationMessageWrapperUpdate$$:
        new Subject<ConversationMessageWrapperUpdate>(),
      i18nService: new I18nService(),
    });

  public static initializing() {
    return this.loading;
  }
}

export function getIsSystemMessageMeta(
  meta: unknown,
): meta is ConversationMessageWrapperSystemMetadata {
  if (typeof meta !== 'object' || meta === null) {
    return false;
  }

  if (
    !('conversation_indicator' in meta) ||
    typeof meta.conversation_indicator !== 'object' ||
    meta.conversation_indicator === null
  ) {
    return false;
  }

  const conversationIndicator = meta.conversation_indicator;

  if (
    !('i18n_key' in conversationIndicator) ||
    typeof conversationIndicator.i18n_key !== 'string'
  ) {
    return false;
  }

  if (
    !('default_value' in conversationIndicator) ||
    typeof conversationIndicator.default_value !== 'string'
  ) {
    return false;
  }

  if (
    !('components' in conversationIndicator) ||
    !Array.isArray(conversationIndicator.components)
  ) {
    return false;
  }

  return true;
}
