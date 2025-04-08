import ConversationType from "../ConversationType";
import { ProfileType } from "../LoginType";
import { denormalizeTeam } from "../TeamType";
import { denormalizeConversationCollaborators } from "./denormalizeConversationCollaborators";
import { normalizeApiMessage } from "../../component/Chat/mutators/messageMutators";

export function denormalizeConversation(
  conversation: ConversationType
): ProfileType {
  let profileDenormalized: ProfileType = {
    ...conversation.userProfile,
    assignedTeam: conversation.assignedTeam
      ? denormalizeTeam(conversation.assignedTeam)
      : undefined,
    assignee: conversation.assignee?.userInfo,
    conversation: { list: [], lastUpdated: conversation.updatedAt },
    conversationHashtags: conversation.conversationHashtags,
    conversationId: conversation.conversationId,
    conversationStatus: conversation.status,
    firstMessageId: conversation.firstMessageId ?? 0,
    isBookmarked: conversation.isBookmarked,
    lastChannel: conversation.lastMessageChannel || "",
    messageGroupName: conversation.messageGroupName,
    numOfNewMessage: conversation.unreadMessageCount,
    unReadMsg: conversation.unreadMessageCount > 0,
    collaboratorIds: denormalizeConversationCollaborators(conversation),
    updatedTime: conversation.updatedTime,
  };
  if (conversation.additionalAssignees) {
    profileDenormalized.collaboratorIds =
      denormalizeConversationCollaborators(conversation);
  }
  if (conversation.lastMessage.length > 0 || profileDenormalized.lastChannel) {
    const lastMessage = conversation.lastMessage[0];
    if (!lastMessage) {
      return {
        ...profileDenormalized,
        conversation: { list: [], lastUpdated: profileDenormalized.createdAt },
      };
    }

    const message = normalizeApiMessage(lastMessage, profileDenormalized);
    return {
      ...profileDenormalized,
      conversation: { list: [message], lastUpdated: message.createdAt },
    };
  } else {
    return profileDenormalized;
  }
}
