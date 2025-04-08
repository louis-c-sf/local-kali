import { MessageTypeSelectedType } from "features/Facebook/models/facebookReducer";
import { HashTagCountedType } from "types/ConversationType";

//inbox
export const FacebookOTNStateDict = {
  within: "Within",
  over: "Over",
} as const;

type FacebookOTNStateDictType = typeof FacebookOTNStateDict;
type FacebookOTNStateDictKey = keyof FacebookOTNStateDictType;
export type FacebookOTNStateDictEnum =
  FacebookOTNStateDictType[FacebookOTNStateDictKey];

export const ModalSceneDic = {
  learnFeature: "LearnFeature",
  sendRequest: "SendRequest",
} as const;
type ModalSceneDicType = typeof ModalSceneDic;
type ModalSceneDicKey = keyof ModalSceneDicType;
export type ModalSceneDicEnum = ModalSceneDicType[ModalSceneDicKey];
export type TopicResponseType = {
  hashTagIds?: string[];
  id?: string;
  pageId: string;
  topic: string;
  topicStatus: string;
};
export type FacebookOTNRequestParamType = {
  topicId: string | null;
  topic: string;
  pageId: string;
  facebookReceiverId: string;
  conversationId: string | undefined;
  messageCheckSum: string;
  title: string;
  hashTagIds: string[];
};

export type SelectedTopicType = {
  name: string;
  id: string | null;
};

export type MessageTypeInfoType = {
  showOverlay: boolean;
  showModal: boolean;
  selectedOption: string;
};

export type OptionType = {
  name?: string;
  value: string;
  number?: number;
  tags?: HashTagCountedType[];
  validUntil?: string;
  description?: string;
  example?: string[];
};

export type HoverDetailType = {
  isFacebookOTN: boolean;
  option: OptionType;
};

export type FacebookMessageType = {
  type?: MessageTypeSelectedType;
  value?: string;
  showBanner: boolean;
  bannerState?: FacebookOTNStateDictEnum;
  validToken?: number;
  refreshFacebookOTNState: () => void;
  showOverlay: boolean;
  showModal: boolean;
  showMessageTag: boolean;
  hasHumanAgent?: boolean;
  loading: boolean;
  selectedOption?: OptionType;
};

//Broadcast
export const MessageTagEnum = {
  human_agent: "HUMAN_AGENT",
  account_update: "ACCOUNT_UPDATE",
  post_purchase_update: "POST_PURCHASE_UPDATE",
  confirmed_event_update: "CONFIRMED_EVENT_UPDATE",
} as const;

export const FacebookOTNBroadcastMapType = {
  messageTag: "messageTag",
  facebookOTN: "otn",
} as const;
type FacebookOTNBroadcastType = typeof FacebookOTNBroadcastMapType;
type FacebookOTNBroadcastKey = keyof FacebookOTNBroadcastType;
export type FacebookOTNBroadcastMapEnum =
  FacebookOTNBroadcastType[FacebookOTNBroadcastKey];

export type FacebookOTNStateType = {
  tab: FacebookOTNBroadcastMapEnum;
  option: string;
  recipient?: number;
};

export type FacebookOTNAmountTokenType = {
  pageId: string;
  facebookReceiverId: string;
  tokenNumber: number;
};

export type FacebookAvailableRecipientsType = {
  totalRecipients: number;
  otnAvailableRecipients: number;
};

export type FacebookOTNTopicsType = {
  id: string;
  pageId: string;
  facebookReceiverId: string;
  topic: string;
  topicStatus: string;
  hashTagIds: string[];
  isOtnRequestSent: boolean;
  permissionNotEnabled: boolean;
};

export type FacebookOTNTopicValidTokenType = {
  id: string;
  pageId: string;
  facebookReceiverId: string;
  topic: string;
  topicStatus: string;
  tokenNumber: number;
  validUntil?: string;
};

export type FacebookPageInfoType = {
  pageName: string;
  pageId: string;
  pageProfilePictureLink: string;
  status: number;
};

export type FacebookOTNRequestType = {
  topicId: string;
  pageId: string;
  facebookReceiverId: string;
  conversationId: string;
  messageCheckSum: string;
  topic: string;
  title: string;
  hashTagIds: string[];
  messageTag: string;
  permissionNotEnabled?: boolean;
  isFacebookOTNRequestSent?: boolean;
};
