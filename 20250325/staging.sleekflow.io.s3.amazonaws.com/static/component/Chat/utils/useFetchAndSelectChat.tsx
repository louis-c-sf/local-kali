import ConversationType from "../../../types/ConversationType";
import { get } from "../../../api/apiRequest";
import {
  GET_CONVERSATIONS_DETAIL,
  GET_USERPROFILE_DETAIL,
} from "../../../api/apiPath";
import { ProfileType } from "../../../types/LoginType";
import lastChannelName from "./lastChannelName";
import { normalizeApiMessage } from "../mutators/messageMutators";
import { useAppDispatch, useAppSelector } from "../../../AppRootContext";
import { denormalizeConversationCollaborators } from "../../../types/Chat/denormalizeConversationCollaborators";
import { getChannelInstanceId } from "./useChatSelectors";

export function useFetchAndSelectChat() {
  const company = useAppSelector((s) => s.company);
  const loginDispatch = useAppDispatch();

  return async (id: string) => {
    const profileTmp: ConversationType = await get(
      GET_CONVERSATIONS_DETAIL.replace("{id}", id),
      { param: {} }
    );
    const details: ProfileType = await get(
      GET_USERPROFILE_DETAIL.replace("{id}", profileTmp.userProfile.id),
      { param: {} }
    );
    if (profileTmp) {
      const [lastMessage] = profileTmp.lastMessage;
      const lastChannel = lastChannelName(details.customFields, company);
      loginDispatch({
        type: "CHAT_SELECTED",
        selectedUser: profileTmp.assignee?.userInfo,
        profile: {
          ...profileTmp.userProfile,
          assignee: profileTmp.assignee?.userInfo,
          collaboratorIds: denormalizeConversationCollaborators(profileTmp),
          conversationHashtags: profileTmp.conversationHashtags,
          unReadMsg: profileTmp.unreadMessageCount > 0,
          conversationStatus: profileTmp.status,
          numOfNewMessage: profileTmp.unreadMessageCount,
          messageGroupName: profileTmp.messageGroupName,
          conversationId: profileTmp.conversationId,
          updatedTime: profileTmp.updatedTime,
          conversation: {
            list: [normalizeApiMessage(lastMessage, profileTmp.userProfile)],
            lastUpdated: profileTmp.updatedTime,
          },
          lastChannel: lastChannelName(details.customFields, company),
        },
        selectedChannelFromConversation: lastChannel,
        selectedChannelIdFromConversation: getChannelInstanceId(
          lastChannel,
          profileTmp.userProfile
        ),
      });
    }
  };
}
