import { ChannelType } from "../../Chat/Messenger/types";
import ConversationType from "../../../types/ConversationType";
import { get, post } from "../../../api/apiRequest";
import {
  GET_CONVERSATION_BY_PROFILE_ID,
  POST_COMPANY_WHATSAPP_CHATAPI_ASSIGN_INSTANCE,
  POST_360DIALOG_CHANGE_CHANNEL,
} from "../../../api/apiPath";
import { aliasChannelName } from "../../Channel/selectors";
import useRouteConfig from "../../../config/useRouteConfig";
import { useAppDispatch, useAppSelector } from "../../../AppRootContext";
import { useHistory } from "react-router-dom";

export function useOpenInboxChat() {
  const { routeTo } = useRouteConfig();
  const conversationId = useAppSelector((s) => s.profile?.conversationId);
  const profileId = useAppSelector((s) => s.profile?.id);
  const whatsappInstanceId = useAppSelector(
    (s) => s.profile?.whatsAppAccount?.instanceId
  );
  const whatsapp360DialogInstanceId = useAppSelector(
    (s) => s.profile.whatsApp360DialogUser?.channelId
  );
  const history = useHistory();
  const loginDispatch = useAppDispatch();

  async function openInboxChat(
    userId: string,
    channelName?: ChannelType,
    channelId?: string,
    conversationIdCustom?: string
  ) {
    let conversationIdSelected = conversationIdCustom ?? conversationId;

    if (!conversationIdSelected) {
      const profileTmp: ConversationType = await get(
        GET_CONVERSATION_BY_PROFILE_ID.replace("{id}", profileId),
        { param: {} }
      );
      if (!profileTmp && channelName) {
        const search = new URLSearchParams({
          selectedChannel: channelName,
          selectedStatus: "open",
        });
        if (channelId) {
          search.set("selectedInstanceId", channelId);
        }
        return history.push({
          pathname: routeTo(`/inbox/all`),
          search: String(search),
        });
      }
      if (profileTmp) {
        conversationIdSelected = profileTmp.conversationId;
      }
    }
    if (channelName) {
      const channelAliased = aliasChannelName(channelName);

      if (channelAliased === "whatsapp" && channelId) {
        if (profileId && whatsappInstanceId !== channelId) {
          try {
            await post(
              POST_COMPANY_WHATSAPP_CHATAPI_ASSIGN_INSTANCE.replace(
                "{id}",
                profileId
              ),
              { param: { instanceId: channelId } }
            );
          } catch (e) {
            console.error("Instance reassign fail", { e });
            return;
          }
        }
      } else if (channelAliased === "whatsapp360dialog" && channelId) {
        if (
          profileId &&
          whatsapp360DialogInstanceId &&
          String(whatsapp360DialogInstanceId) !== channelId
        ) {
          try {
            await post(POST_360DIALOG_CHANGE_CHANNEL, {
              param: { instanceId: channelId, userProfileId: profileId },
            });
          } catch (e) {
            console.error("Instance reassign fail", { e });
            return;
          }
        }
      }
    }
    loginDispatch({ type: "RESET_PROFILE" });
    const path = getConversationUrlPath(
      conversationIdSelected,
      userId,
      channelName
    );
    const searchParam = `selectedStatus=open&selectedChannel=all&selectedOrderBy=desc`;
    try {
      history.push({
        pathname: routeTo(path),
        search: searchParam,
      });
    } catch (e) {
      history.push({
        pathname: `/inbox/all/${conversationIdSelected}`,
        search: searchParam,
      });
      console.error(
        `redirect error: ${e} route: ${routeTo(
          path
        )}, searchParam: ${searchParam}`
      );
    }
  }

  return openInboxChat;
}

export function getConversationUrlPath(
  id: string,
  userId?: string,
  channel?: ChannelType
) {
  const parts = ["inbox", userId?.trim() || "all", id];
  if (channel) {
    const channelAliased = aliasChannelName(channel);
    parts.push(channelAliased);
  }
  return `/${parts.join("/")}`;
}
