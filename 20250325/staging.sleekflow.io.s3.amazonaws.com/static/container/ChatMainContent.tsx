import React, { useEffect, useState } from "react";
import ChatHeader from "../component/Chat/ChatHeader/ChatHeader";
import { ChatRecords } from "../component/Chat/ChatRecords";
import SendMessageBox from "../component/Chat/Messenger/SendMessageBox";
import ReplyMessageBox from "../component/Chat/Messenger/Warning/ReplyMessageBox";
import BalanceNegativeBox, {
  isCloudApiBalanceNegativeSelector,
} from "../component/Chat/Messenger/Warning/BalanceNegativeBox";
import { ProfileType } from "types/LoginType";
import { useAppSelector } from "AppRootContext";
import { equals } from "ramda";
import { ConfirmDeleteMessage } from "component/Chat/Messenger/Schedule/ConfirmDeleteMessage";
import { useFacebookOTNFlow } from "features/Facebook/usecases/Inbox/hooks/useFacebookOTNFlow";
import { EcommerceStoresContext } from "features/Ecommerce/components/EcommerceStoresContext";
import { SendMessageContext } from "component/Chat/Messenger/SendMessageBox/SendMessageContext";
import useGetCurrentChannel from "component/Chat/useGetCurrentChannel";
import { MessageCartModal } from "features/Ecommerce/usecases/Inbox/MessageCart/MessageCartModal";

function isCurrentChannelToDisplayBanner(
  profile: ProfileType,
  channel: string
) {
  return (
    (["twilio_whatsapp", "whatsapp"].includes(channel) &&
      profile.whatsAppAccount?.is_twilio) ||
    ["whatsapp360dialog", "facebook", "whatsappcloudapi", "wechat"].includes(
      channel
    )
  );
}

export function ChatMainContent() {
  const profile = useAppSelector((s) => s.profile, equals);
  const messagesFilter = useAppSelector((s) => s.inbox.messagesFilter, equals);
  const { currentChannel } = useGetCurrentChannel(messagesFilter);
  const isConfirmDeleteScheduledVisible = useAppSelector(
    (s) => s.inbox.messenger.schedule.deleteMessage.isPrompted
  );
  const deleteMessageId = useAppSelector(
    (s) => s.inbox.messenger.schedule.deleteMessage.messageId
  );
  const isMessageCartContentVisible = useAppSelector(
    (s) => s.inbox.messageCart.visible
  );

  const [contentNode, setContentNode] = useState<HTMLDivElement | null>(null);
  const facebookOTNFlow = useFacebookOTNFlow();
  const isCloudApiBalanceNegative = useAppSelector(
    isCloudApiBalanceNegativeSelector,
    equals
  );

  useEffect(() => {
    if (currentChannel === "facebook" && facebookOTNFlow.isReadyToInitiate) {
      facebookOTNFlow.initiate();
    } else {
      facebookOTNFlow.reset();
    }
  }, [facebookOTNFlow.isReadyToInitiate, currentChannel]);

  return (
    <div className={`chat-content`} ref={setContentNode}>
      <ChatHeader profile={profile} />
      <ChatRecords profile={profile} />
      {isCurrentChannelToDisplayBanner(profile, currentChannel ?? "") && (
        <ReplyMessageBox conversationId={profile.conversationId} />
      )}
      {isCloudApiBalanceNegative && <BalanceNegativeBox />}
      <SendMessageContext parentNode={contentNode}>
        <EcommerceStoresContext standalone={false}>
          <SendMessageBox profile={profile} channel={currentChannel} />
        </EcommerceStoresContext>
      </SendMessageContext>
      {isMessageCartContentVisible && <MessageCartModal />}
      {isConfirmDeleteScheduledVisible && deleteMessageId && (
        <ConfirmDeleteMessage messageId={deleteMessageId} />
      )}
    </div>
  );
}
