import React, { ChangeEvent, useState, KeyboardEvent } from "react";
import demoStyles from "./InboxDemo.module.css";
import { Image } from "semantic-ui-react";
import mobileImg from "../assets/mobile.png";
import TypingImg from "../../../../assets/images/typing.gif";
import sendBtnImg from "../assets/send-button.svg";
import { InboxDemoConversationType } from "./inboxDemoReducer";

export default function MobileInterface(props: {
  loading: boolean;
  firstConversation: InboxDemoConversationType;
  enableKeyIn?: boolean;
  handleSendMsg?: (value: string) => void;
}) {
  const {
    loading,
    firstConversation,
    enableKeyIn = false,
    handleSendMsg,
  } = props;
  const [message, setMessage] = useState("");

  function handleMessageChange(e: ChangeEvent<HTMLInputElement>) {
    setMessage(e.target.value);
  }

  function handleKeyEnter(e: KeyboardEvent) {
    if (message && handleSendMsg && e.key === "Enter") {
      handleSendMsg(message);
    }
  }

  function handleClickSend() {
    if (message && handleSendMsg) {
      handleSendMsg(message);
    }
  }

  return (
    <div className={demoStyles.mobileWrapper}>
      {enableKeyIn ? (
        <span
          className={demoStyles.pointerHand}
          role="img"
          aria-label="pointer"
        >
          👉
        </span>
      ) : null}
      {loading ? (
        <div className={demoStyles.loadingWrapper}>
          <Image src={TypingImg} className={demoStyles.loading} />
        </div>
      ) : (
        <div className={demoStyles.chats}>
          {firstConversation.chatHistory.reverse().map((chat) => (
            <div
              className={`${demoStyles.record} ${
                !chat.isFromUser ? demoStyles.notFromUser : ""
              }`}
              key={chat.id}
            >
              {chat.messageContent}
            </div>
          ))}
        </div>
      )}
      {enableKeyIn ? (
        <input
          className={demoStyles.input}
          onKeyDown={handleKeyEnter}
          disabled={loading}
          value={message}
          onChange={handleMessageChange}
        />
      ) : null}
      <Image src={mobileImg} className={demoStyles.mobileImg} />
      {enableKeyIn ? (
        <Image
          src={sendBtnImg}
          className={demoStyles.sendBtn}
          onClick={handleClickSend}
        />
      ) : null}
    </div>
  );
}
