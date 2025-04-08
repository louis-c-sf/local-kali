import React from "react";
import styles from "./MessageTemplate.module.css";
import { Checkbox } from "semantic-ui-react";
import { MessageBox } from "./MessageBox";
import { MsgType } from "../types/WhatsAppQrCodeTypes";

export const MessageTemplate = (props: {
  title: string;
  subTitle: string;
  msgContactName: string;
  msg: MsgType;
  setMsg: (msg: MsgType) => void;
  hasCheckbox?: boolean;
  enableAutoMsg?: boolean;
  switchEnableAutoMsg?: () => void;
  isDisabled: boolean;
}) => {
  const {
    title,
    subTitle,
    msgContactName,
    msg,
    setMsg,
    hasCheckbox = false,
    enableAutoMsg = false,
    switchEnableAutoMsg = () => {},
    isDisabled,
  } = props;
  return (
    <div className={styles.container}>
      {hasCheckbox ? (
        <div className={styles.checkboxWrap}>
          <Checkbox
            className={styles.checkbox}
            label={title}
            checked={enableAutoMsg}
            onClick={isDisabled ? () => false : switchEnableAutoMsg}
            disabled={isDisabled}
          />
          <div className={styles.checkboxSubTitle}>{subTitle}</div>
        </div>
      ) : (
        <>
          <div className={styles.title}>{title}</div>
          <div className={styles.subTitle}>{subTitle}</div>
        </>
      )}
      {hasCheckbox ? (
        enableAutoMsg && (
          <MessageBox
            isLastElement={true}
            msg={msg}
            setMsg={setMsg}
            msgContactName={msgContactName}
            isDisabled={isDisabled}
          />
        )
      ) : (
        <MessageBox
          msg={msg}
          setMsg={setMsg}
          msgContactName={msgContactName}
          isDisabled={isDisabled}
        />
      )}
    </div>
  );
};
