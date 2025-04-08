import React, { useContext, useState } from "react";
import ChatHeader from "../../../../Chat/ChatHeader/ChatHeader";
import SendMessageBox from "../../../../Chat/Messenger/SendMessageBox";
import { useAppSelector, useAppDispatch } from "AppRootContext";
import { equals } from "ramda";
import TextRecord from "../../../../Chat/Records/TextRecord";
import { useTranslation } from "react-i18next";
import InboxDemoContext from "../inboxDemoContext";
import postDemoMessage from "api/Onboarding/postDemoMessage";
import postDemoNote from "api/Onboarding/postDemoNote";
import fetchInboxDemoConversation from "api/Onboarding/fetchInboxDemoConversation";
import postDemoConversationStatus from "api/Onboarding/postDemoConversationStatus";
import { SendMessageContext } from "component/Chat/Messenger/SendMessageBox/SendMessageContext";
import { getSenderProfilePic } from "component/Chat/Records/MessageRecord";

export type submitDemoTextMessageType = (
  channel: string,
  id: number,
  messageContent: string
) => void;

export type handleDemoStatusType = (status: string, id: string) => void;

export default function ChatMainContent() {
  const profile = useAppSelector((s) => s.profile, equals);
  const chats = useAppSelector((s) => s.chats, equals);
  const user = useAppSelector((s) => s.user, equals);
  const staffList = useAppSelector((s) => s.staffList, equals);

  const { demoDispatch } = useContext(InboxDemoContext);
  const { t } = useTranslation();
  const [contentNode, setContentNode] = useState<HTMLDivElement | null>(null);
  const loginDispatch = useAppDispatch();

  const currentChat = chats?.find(
    (chat) => chat.conversationId === profile.conversationId
  );

  const chatMessages =
    currentChat && currentChat.conversation
      ? currentChat?.conversation?.list
      : [];

  const updateConversation = async (id: number) => {
    try {
      const conversation = await fetchInboxDemoConversation(id);
      demoDispatch({ type: "UPDATE_CONVERSATION", conversation });
    } catch (error) {
      console.error("fetchInboxDemoConversation error", error);
    }
  };

  const submitTextMessage: submitDemoTextMessageType = async (
    channel,
    id,
    msg
  ) => {
    try {
      await postDemoMessage(channel, id, msg, true);
      updateConversation(id);
    } catch (error) {
      console.error("postDemoMessage error", error);
    }
  };

  const submitTextNote: submitDemoTextMessageType = async (
    channel,
    id,
    msg
  ) => {
    try {
      await postDemoNote(channel, id, msg, true);
      updateConversation(id);
    } catch (error) {
      console.error("postDemoNote error", error);
    }
  };

  const handleDemoStatus: handleDemoStatusType = async (id, status) => {
    try {
      await postDemoConversationStatus(id, status);
      updateConversation(Number(id));
      loginDispatch({
        type: "STATUS_UPDATED",
        isBookmarked: false,
        conversationId: id,
        status,
      });
    } catch (error) {
      console.error("postDemoConversationStatus error", error);
    }
  };

  return (
    <div className={`chat-content`} ref={setContentNode}>
      <ChatHeader
        profile={profile}
        isDemo
        handleDemoStatus={handleDemoStatus}
      />
      <div className="chats" id="chats-scroll-strip">
        <div className="scroll-animation" />
        <div className="chatsScroll">
          {chatMessages.map((record) => (
            <div className="checkable-row" key={record.id}>
              <TextRecord
                isDemo
                isShowIcon={true}
                message={record}
                profile={profile}
                channelTitle={"Official"}
                channelTypeName={record.channel.replace("whatsapp", "WhatsApp")}
                parentHeight={0}
                t={t}
                userId={"userId"}
                pickingMessagesActive={false}
                senderName={`${user.firstName} ${user.lastName}`}
                senderPic={getSenderProfilePic(record, staffList)}
                beforeContent={null}
              />
            </div>
          ))}
        </div>
      </div>
      <SendMessageContext parentNode={contentNode}>
        <SendMessageBox
          isDemo
          submitDemoTextMessage={submitTextMessage}
          submitDemoTextNote={submitTextNote}
          profile={profile}
          channel={chatMessages[0]?.channel || ""}
        />
      </SendMessageContext>
    </div>
  );
}
