import {
  AutomationActionWaitableType,
  orderableActionDefaults,
  waitableActionDefaults,
  DMMediaFileNormalized,
} from "../../../../../types/AutomationActionType";

export interface PostCommentConditionField {
  keywords?: string[];
  pageId: string;
  postId: string;
  noPosts: boolean;
}

export const FbPostComment = "FacebookPostComment";
export const IgPostComment = "InstagramMediaComment";
export const PostCommentAutomation = FbPostComment || IgPostComment;
export type PostCommentAutomationType = typeof PostCommentAutomation;
export const FacebookActionTypes = [
  "FacebookInitiateDm",
  "FacebookReplyComment",
];
export const InstagramActionTypes = [
  "InstagramInitiateDm",
  "InstagramReplyComment",
];

export enum MessageFormatEnum {
  Text,
  Attachment,
}
export type MessageFormatType =
  | MessageFormatEnum.Text
  | MessageFormatEnum.Attachment;
type InitiateDmActionType = {
  id?: string;
  fbIgAutoReply: {
    fbIgAutoReplyId?: string;
    messageFormat: MessageFormatType;
    fbIgAutoReplyFiles?: DMMediaFileNormalized[];
    messageContent?: string;
  };
};

type ReplyCommentActionType = {
  fbIgAutoReply: {
    fbIgAutoReplyId?: string;
    messageContent: string;
    likeComment?: boolean;
  };
};

export type FacebookInitiateDmActionType = {
  automatedTriggerType: "FacebookInitiateDm";
} & AutomationActionWaitableType &
  InitiateDmActionType;

export type InstagramInitiateDmActionType = {
  automatedTriggerType: "InstagramInitiateDm";
} & AutomationActionWaitableType &
  InitiateDmActionType;

export type FacebookReplyCommentActionType = {
  automatedTriggerType: "FacebookReplyComment";
} & AutomationActionWaitableType &
  ReplyCommentActionType;

export type InstagramReplyCommentActionType = {
  automatedTriggerType: "InstagramReplyComment";
} & AutomationActionWaitableType &
  ReplyCommentActionType;

export function facebookInitiateDmActionDefaults(): FacebookInitiateDmActionType {
  return {
    automatedTriggerType: "FacebookInitiateDm",
    fbIgAutoReply: {
      messageFormat: MessageFormatEnum.Text,
      messageContent: "",
    },
    ...orderableActionDefaults(),
    ...waitableActionDefaults(),
  };
}

export function facebookReplyCommentActionDefaults(): FacebookReplyCommentActionType {
  return {
    automatedTriggerType: "FacebookReplyComment",
    fbIgAutoReply: {
      messageContent: "",
      likeComment: true,
    },
    ...orderableActionDefaults(),
    ...waitableActionDefaults(),
  };
}
export function instagramInitiateDmActionDefaults(): InstagramInitiateDmActionType {
  return {
    automatedTriggerType: "InstagramInitiateDm",
    fbIgAutoReply: {
      messageFormat: MessageFormatEnum.Text,
      messageContent: "",
    },
    ...orderableActionDefaults(),
    ...waitableActionDefaults(),
  };
}
export function instagramReplyCommentActionDefaults(): InstagramReplyCommentActionType {
  return {
    automatedTriggerType: "InstagramReplyComment",
    fbIgAutoReply: {
      messageContent: "",
    },
    ...orderableActionDefaults(),
    ...waitableActionDefaults(),
  };
}

export const PostTypeEnum = {
  Specific: "specific",
  All: "all",
};
export type PostTypeType = keyof typeof PostTypeEnum;
type CommonPostType = {
  id: string;
  createdAt: string;
};
export interface ContentType extends CommonPostType {
  content: string;
}
export interface MediaType extends CommonPostType {
  mediaUrl: string;
}

export type SinglePostType = ContentType | MediaType;
export enum FbIgAutoActionEnum {
  FacebookInitiateDm,
  FacebookReplyComment,
  FacebookLikeComment,
  InstagramInitiateDm,
  InstagramReplyComment,
}
export enum PlatformType {
  Facebook,
  Instagram,
}

export enum MessageFormat {
  Text,
  Attachment,
  Carousel,
  Button,
  QuickReplyButton,
}

export const DirectMessageTextLimit = 2000;
export const InstagramDirectMessageTextLimit = 1000;
export const ReplyCommentTextLimit = 2000;
export const PostsOffsetLimit = 9;
export const UploadFileMaxSizeEnum = {
  fb: 25,
  ig: 8,
};
export const UploadFileCount = 1;
export const AllowFileTypes =
  "image/*,audio/*,video/*,application/pdf,*.pdf,*.doc,*.docx,*.xlsx";
enum AutomationHistoryEnum {
  Sent,
  NewContacts,
  Replied,
}
export type FbIgAutomationHistoryType = {
  createdAt: string;
  fbIgAutoReplyId: string;
  id: number;
  name: string;
  status: string;
  targetUserProfileId: string;
};
export type FbIgAutomationHistoryResponseType = {
  tab: typeof AutomationHistoryEnum;
  sendDirectMessageNumber: number;
  newContactNumber: number;
  userReplyDmNumber: number;
  newContactPercentage: string;
  repliedToDmPercentage: string;
  triggerHistories: FbIgAutomationHistoryType[];
};
export interface FbIgAutomationHistoriesParamsType {
  tab?: number;
}
export enum TabEnum {
  Sent,
  NewContact,
  Replied,
}

type infoType = {
  number: number;
  percentage: string;
};
export type TabInfoType = {
  sent: number;
  newContact: infoType;
  replied: infoType;
};

export const DefaultTabInfo = {
  sent: 0,
  newContact: {
    number: 0,
    percentage: "0.0",
  },
  replied: {
    number: 0,
    percentage: "0.0",
  },
};

export type PagesChoiceType = {
  pageId: string;
  pageName: string;
  pageProfilePictureLink: string;
  status: number;
};
