import React from "react";
import insertTextAtCursor from "insert-text-at-cursor";
import produce from "immer";
import { useTranslation } from "react-i18next";
import EmojiButton from "../../../../EmojiButton";
import {
  DirectMessageTextLimit,
  FacebookInitiateDmActionType,
  InstagramDirectMessageTextLimit,
  InstagramInitiateDmActionType,
} from "../../CreateRule/FbIg/PostCommentTypes";
import { AutomationActionType } from "../../../../../types/AutomationActionType";
import styles from "./SendDirectMessage.module.css";

const INITIAL_DM_LIMIT_INSTAGRAM = 1000;
const INITIAL_DM_LIMIT_DEFAULT = 2000;

const TextMessage = (props: {
  index: number;
  action: FacebookInitiateDmActionType | InstagramInitiateDmActionType;
  setAction: (action: AutomationActionType) => void;
}) => {
  const { action, setAction } = props;
  const { t } = useTranslation();
  const textareaId = `automation-send-directly-message-text${props.index}`;

  const isExceedingLimit = (value: string) => {
    if (action.automatedTriggerType === "InstagramInitiateDm") {
      return value.length > InstagramDirectMessageTextLimit;
    } else {
      return value.length > DirectMessageTextLimit;
    }
  };
  const textLimitNumber =
    action.automatedTriggerType === "InstagramInitiateDm"
      ? INITIAL_DM_LIMIT_INSTAGRAM
      : INITIAL_DM_LIMIT_DEFAULT;

  return (
    <>
      <div className={styles.subTitle}>
        {t("automation.action.initiateDm.subTitle", {
          number: textLimitNumber,
        })}
      </div>
      <textarea
        id={textareaId}
        className={"ui input text-content"}
        value={action.fbIgAutoReply.messageContent ?? ""}
        onChange={(ev) => {
          if (isExceedingLimit(ev.target.value)) {
            return;
          }
          setAction(
            produce(action, (actionDraft) => {
              actionDraft.fbIgAutoReply.messageContent = ev.target.value;
            })
          );
        }}
        data-gramm_editor="false"
      />
      <div className={"blank text-controls"}>
        <EmojiButton
          handleEmojiInput={(emoji) => {
            let textarea = document.getElementById(
              textareaId
            ) as HTMLTextAreaElement;
            if (textarea) {
              insertTextAtCursor(textarea, emoji);
            }
          }}
        />
      </div>
    </>
  );
};
export default TextMessage;
