import { intersection } from "ramda";
import { aliasChannelName } from "../component/Channel/selectors";
import { ChannelType } from "../component/Chat/Messenger/types";
import { ProfileType } from "../types/LoginType";

export default function getProfileMatchers(profile: ProfileType) {
  function checkTagMatch(selectedTags: string[]) {
    const profileTags = profile?.tags ?? [];
    if (selectedTags.length === 0) {
      return true;
    }
    if (intersection(selectedTags, profileTags).length > 0) {
      return true;
    }
    return false;
  }
  function checkChannelMatch(
    selectedChannel: string,
    selectedInstanceId: string
  ) {
    if (selectedChannel === "all") {
      return true;
    }
    const aliasChannel = aliasChannelName(selectedChannel as ChannelType);
    if (profile.lastChannel === aliasChannel) {
      if (aliasChannel === "whatsapp") {
        return selectedInstanceId === profile.whatsAppAccount?.instanceId;
      }
      if (aliasChannel === "whatsapp360dialog") {
        return (
          selectedInstanceId ===
          String(profile.whatsApp360DialogUser?.channelId)
        );
      }
      if (aliasChannel === "facebook") {
        return selectedInstanceId === profile.facebookAccount?.pageId;
      }
      return true;
    }
    return false;
  }
  function checkStatusMatch(selectedStatus: string) {
    return profile.conversationStatus === selectedStatus;
  }
  function checkUnreadMatch(unreadStatus?: string) {
    if (unreadStatus === undefined) {
      return true;
    }
    if (profile.unReadMsg) {
      return unreadStatus === "UnreadOnly";
    }
    return true;
  }
  return {
    checkTagMatch,
    checkChannelMatch,
    checkStatusMatch,
    checkUnreadMatch,
  };
}
