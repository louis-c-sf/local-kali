import React from "react";
import styles from "./MessageBox.module.css";
import { MsgType } from "../types/WhatsAppQrCodeTypes";

export const MessageBox = (props: {
  msg: MsgType;
  msgContactName: string;
  setMsg: (msg: MsgType) => void;
  isLastElement?: boolean;
  isDisabled: boolean;
}) => {
  const {
    msg,
    msgContactName,
    setMsg,
    isLastElement = false,
    isDisabled,
  } = props;

  return (
    <div
      className={`${styles.msgContainer} ${isLastElement &&
        styles.lastMsgContainer}`}
    >
      <textarea
        value={msg.top}
        onChange={(e) => setMsg({ ...msg, top: e.target.value })}
        disabled={isDisabled}
      />
      <div className={styles.contactName}>{msgContactName}</div>
      <textarea
        value={msg.bottom}
        onChange={(e) => setMsg({ ...msg, bottom: e.target.value })}
        disabled={isDisabled}
      />
    </div>
  );
};
