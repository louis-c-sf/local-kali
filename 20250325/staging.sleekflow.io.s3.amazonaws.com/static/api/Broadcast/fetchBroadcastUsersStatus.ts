import { BroadcastStatusType } from "../../types/BroadcastCampaignType";
import { postWithExceptions } from "../apiRequest";
import { POST_BROADCAST_STATUSES } from "../apiPath";
import MessageType from "../../types/MessageType";
import { StaffType } from "../../types/StaffType";
import { HashTagType } from "../../types/ConversationType";
import { TeamType } from "../../types/TeamType";

export interface MessageStatusType extends MessageType {
  ChannelStatusMessage?: string;
  channelStatusMessage?: string;
  updatedAt: string;
}

export interface BroadcastUserStatusResponseType {
  userProfileId: string;
  conversationId: string;
  broadcastMessageStatus: BroadcastStatusType;
  repliedMessage: MessageStatusType;
  broadcastMessage: MessageStatusType;
  conversation: {
    assignee?: StaffType;
    assignedTeam?: TeamType;
    conversationId: string;
    companyId: string;
    messageGroupName: string;
    status: string;
    additionalAssignees: StaffType[];
    conversationHashtags: HashTagType[];
    updatedTime: string;
    modifiedAt: string;
    unreadMessageCount: number;
    isSandbox: boolean;
    isBookmarked: boolean;
  };
}

export function fetchBroadcastUsersStatus(
  campaignId: string,
  status: BroadcastStatusType,
  userIds: string[]
): Promise<BroadcastUserStatusResponseType[]> {
  return postWithExceptions(
    POST_BROADCAST_STATUSES.replace("{id}", `${campaignId}`),
    {
      param: {
        userProfileIds: userIds,
        broadcastMessageStatus: status,
      },
    }
  );
}
