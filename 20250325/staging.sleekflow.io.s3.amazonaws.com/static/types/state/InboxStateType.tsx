import { AssigneeSummaryResponseType } from "../ChatsSummaryResponseType";
import { MessengerState } from "./MessengerState";
import {
  defaultMessengerState,
  defaultTemplateState,
} from "component/Chat/Messenger/messengerReducer";
import {
  MessageSearchType,
  messageSearchInit,
} from "./inbox/MessageSearchType";
import { WebClientInfoResponseType } from "../Analytics/api/WebClientInfoResponseType";
import MessageType from "../MessageType";
import {
  PreselectedMessageType,
  preselectedMessageDefaults,
} from "./inbox/PreselectedMessageType";
import { WhatsappTemplatesStateType } from "App/reducers/Chat/whatsappTemplatesReducer";
import {
  defaultPaymentHistoryState,
  PaymentHistoryStateType,
} from "App/reducers/Chat/paymentHistoryReducer";
import { FacebookMessageType } from "features/Facebook/models/FacebookOTNTypes";
import { defaultMessageTypeState } from "features/Facebook/models/facebookReducer";
import { GenericCartItemType } from "core/models/Ecommerce/Catalog/GenericCartItemType";
import { ShoppingVendorType } from "features/Ecommerce/usecases/Inbox/Share/ShareProductModal/ProductCartContext";
import { GenericCartCalculationResult } from "core/models/Ecommerce/Catalog/GenericCartCalculationResult";
import {
  MessageCartStateType,
  defaultMessageCartState,
} from "App/reducers/Chat/messageCartReducer";
import { ConversationTypingType } from "types/LoginType";

export const InboxOrderDic = {
  newest: "desc",
  oldest: "asc",
} as const;
type InboxOrderDictType = typeof InboxOrderDic;
type InboxOrderDictKey = keyof InboxOrderDictType;
export type InboxOrderDictEnum = InboxOrderDictType[InboxOrderDictKey];

export const DefaultOrderBy = InboxOrderDic.newest;

export type PickingModeType = "forward" | "delete";

export type ChatMessageDraftType = {
  conversationId: string;
  text: string;
  markupText: string;
};

export type AnalyticsSummaryOverride = {
  webPath?: string;
  country?: string;
  city?: string;
  area?: string;
  address?: string;
  organisationName?: string;
  businessName?: string;
  businessWebsite?: string;
  isp?: string;
  timezone?: string;
  region?: string;
  ipAddress?: string;
  locale?: string;
  onlineStatus?: string;
  device?: string;
  updatedAt?: string;
};

export type AnalyticsHistoryRecordType = {
  conversationId: string;
  summary: WebClientInfoResponseType[];
  override: AnalyticsSummaryOverride;
};

export type AnalyticsStateType = {
  loading: boolean;
  recordsMemoized: AnalyticsHistoryRecordType[];
};

export interface MessagesFilterType {
  channelName: string | null;
  channelId: string | null;
  selectedFrom: "reply" | "filter";
}

export interface InboxStateType {
  filter: {
    tagIds: string[];
    unreadStatus?: "UnreadOnly" | "ReadOnly";
    channel?: string;
    shopify?: ShopifyFilterType;
    orderBy?: InboxOrderDictEnum;
  };
  messagesFilter: MessagesFilterType;
  allowSwitchConversation: boolean;
  audioPlayingId: string | null;
  startAudioId: string | null;
  quote: {
    id: string | null;
    show: boolean;
  };
  messenger: MessengerState;
  pickingMessages: {
    active: boolean;
    mode: PickingModeType | undefined;
    pickedIds: number[];
  };
  summary: {
    filters: AssigneeSummaryResponseType;
    teams: {
      [teamId: number]: {
        [assigneeId: string]: number;
      };
    };
    loading: boolean;
  };
  messageSearch: MessageSearchType;
  messageDrafts: ChatMessageDraftType[];
  preselectedMessage: PreselectedMessageType;
  unreadMessagesCount: number | undefined;
  sendAsMessage: MessageType | null;
  whatsAppTemplates: WhatsappTemplatesStateType;
  editContactForm: {
    visible: boolean;
    focusField?: string;
  };
  product?: {
    calcLoading: boolean;
    showModal: boolean;
    vendor: ShoppingVendorType;
    storeId?: number | string;
    cart?: GenericCartItemType[];
    productId?: number | string;
    language: string;
    languages: Array<{ code: string; name: string }>;
    totals?: GenericCartCalculationResult;
    currency: string | null;
  };
  conversationTypingSignalrResponse: ConversationTypingType | null;
  analytics: AnalyticsStateType;
  paymentHistory: PaymentHistoryStateType;
  facebook: {
    messageType: FacebookMessageType;
  };
  isShopifyModalOpen: boolean;
  messageCart: MessageCartStateType;
}

export interface ShopifyFilterType {
  collectionId?: number;
  shopifyId: number;
}

export const initInboxState: InboxStateType = {
  analytics: { loading: false, recordsMemoized: [] },
  allowSwitchConversation: true,
  audioPlayingId: null,
  filter: {
    tagIds: [],
    unreadStatus: undefined,
    channel: undefined,
    shopify: undefined,
    orderBy: undefined,
  },
  messagesFilter: {
    channelName: null,
    channelId: null,
    selectedFrom: "reply",
  },
  messageDrafts: [],
  messenger: defaultMessengerState(),
  quote: { id: null, show: false },
  pickingMessages: { active: false, pickedIds: [], mode: undefined },
  startAudioId: null,
  conversationTypingSignalrResponse: null,
  summary: {
    filters: {
      conversationSummaries: [],
      hashtagSummaries: [],
      unreadCount: 0,
    },
    loading: false,
    teams: {},
  },
  unreadMessagesCount: undefined,
  messageSearch: { ...messageSearchInit },
  preselectedMessage: preselectedMessageDefaults(),
  editContactForm: {
    visible: false,
  },
  sendAsMessage: null,
  whatsAppTemplates: {
    optIn: {
      booted: false,
      data: {
        isOptInOn: false,
      },
    },
    whatsapp360Templates: defaultTemplateState(),
    templates: {
      booted: false,
      data: {},
    },
    whatsappCloudApiTemplates: [],
  },
  paymentHistory: defaultPaymentHistoryState(),
  facebook: {
    messageType: defaultMessageTypeState(),
  },
  isShopifyModalOpen: false,
  messageCart: defaultMessageCartState(),
};

export type OrderByOptionType = {
  key: string;
  value: InboxOrderDictEnum;
  label: string;
  onClick: () => void;
  isActive: boolean;
};
