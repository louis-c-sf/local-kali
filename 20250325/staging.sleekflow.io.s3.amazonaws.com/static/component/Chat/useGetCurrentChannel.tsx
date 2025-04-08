import { equals, pick } from "ramda";
import { useEffect, useRef } from "react";
import { useConversationParams } from "../../api/Chat/useConversationParams";
import { useAppSelector } from "../../AppRootContext";
import { MessagesFilterType } from "../../types/state/InboxStateType";
import { getChannelInstanceId } from "./utils/useChatSelectors";
import useCompanyChannels from "./hooks/useCompanyChannels";
import { getConfigId } from "../Channel/selectors";
import { ChannelType } from "./Messenger/types";

export default function useGetCurrentChannel(
  messageFilter: MessagesFilterType
) {
  const {
    selectedChannelFromConversation,
    selectedChannelIdFromConversation,
    selectedChannel,
    selectedInstanceId,
    profile,
  } = useAppSelector(
    pick([
      "selectedChannelFromConversation",
      "selectedChannelIdFromConversation",
      "selectedChannel",
      "selectedInstanceId",
      "profile",
    ]),
    equals
  );
  const { channelName: channelNameFromURL } = useConversationParams();
  const companyChannels = useCompanyChannels();

  let currentChannel = (messageFilter?.channelName ||
    selectedChannelFromConversation ||
    channelNameFromURL ||
    profile.lastChannel ||
    "") as string | undefined;
  let currentChannelId =
    messageFilter?.channelId ??
    selectedChannelIdFromConversation ??
    (currentChannel
      ? getChannelInstanceId(currentChannel, profile) ??
        getChannelInstanceId(profile.lastChannel ?? "", profile)
      : getChannelInstanceId(profile.lastChannel ?? "", profile));

  const isInitialLoaded = useRef(true);
  const configs =
    companyChannels.find(
      (channel) => channel.type === selectedChannelFromConversation
    )?.configs ?? [];
  const selectedChannelIdentityId = configs.find(
    (c) =>
      getConfigId({
        name: selectedChannelFromConversation as ChannelType,
        config: c,
      }) === currentChannelId
  )?.channelIdentityId;

  useEffect(() => {
    if (selectedChannel === "all") {
      return;
    }
    if (isInitialLoaded.current) {
      currentChannel = selectedChannel;
      currentChannelId = selectedInstanceId;
      isInitialLoaded.current = false;
    }
  }, [
    profile.id,
    selectedChannel,
    selectedInstanceId,
    isInitialLoaded.current,
  ]);
  return {
    currentChannel,
    currentChannelId,
    currentChannelIdentity: selectedChannelIdentityId,
  };
}
