import { UserInfoType } from "../../ConversationType";
import { ProfileType, UserType } from "../../LoginType";

export interface AssigneeType {
  assigneeName?: string;
  userInfo?: UserInfoType;
  /** @deprecated no need to duplicate state.chats */
  conversations: ProfileType[];
  assigneeId?: string;
  totalAssigned: number;
}

export interface AssigneesType {
  [key: string]: AssigneeType;
}
export const defaultUser: UserType = {
  id: "",
  email: "",
  userName: "",
  accessToken: "",
  firstName: "",
  lastName: "",
  userAgent: "",
  isAuthenticated: false,
  isShopifyAccount: false,
  signalRGroupName: "",
  loginInAs: false,
};
export const defaultAssigee: AssigneeType = {
  assigneeId: "",
  totalAssigned: 0,
  assigneeName: "",
  userInfo: {
    displayName: "",
    email: "",
    id: "",
    userName: "",
    userRole: "",
    lastName: "",
    firstName: "",
    createdAt: "",
  },
  conversations: [
    {
      firstMessageId: 0,
      numOfNewMessage: 0,
      messageGroupName: "",
      lastChannel: "",
      id: "",
      conversationId: "",
      firstName: "",
      displayName: "",
      customFields: [],
      createdAt: "",
      updatedAt: "",
      pic: "",
      address: "",
      remarks: [],
      details: [],
      tags: [],
      conversationHashtags: [],
      conversation: { list: [], lastUpdated: "" },
      conversationStatus: "",
      selectedChannel: "",
      unReadMsg: false,
      displayProfilePicture: "",
      updatedTime: "",
      isBookmarked: false,
      isSandbox: false,
      isShopifyProfile: false,
    },
  ],
};
