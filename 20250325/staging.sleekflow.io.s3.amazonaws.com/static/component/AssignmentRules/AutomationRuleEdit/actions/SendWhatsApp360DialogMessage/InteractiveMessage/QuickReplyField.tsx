import WordCountInput from "component/shared/input/WordCountInput/WordCountInput";
import produce from "immer";
import React from "react";
import { useTranslation } from "react-i18next";
import { Button, Form, Icon } from "semantic-ui-react";
import {
  AutomationActionType,
  SendMessageAutomationActionType,
} from "types/AutomationActionType";
import styles from "./SendInteractiveMessageForm.module.css";

export default function QuickReplyField({
  action,
  setAction,
}: {
  action: SendMessageAutomationActionType;
  setAction: (action: AutomationActionType) => void;
}) {
  const { t } = useTranslation();

  const canAddMoreButtons =
    (action.sendInteractiveMessageState?.quickReplies?.length ?? 0) < 3;

  function removeReply(index: number) {
    setAction(
      produce(action, (draft) => {
        if (draft.sendInteractiveMessageState?.quickReplies) {
          draft.sendInteractiveMessageState.quickReplies.splice(index, 1);
        }
      })
    );
  }

  function appendReply() {
    setAction(
      produce(action, (draft) => {
        if (draft.sendInteractiveMessageState) {
          if (draft.sendInteractiveMessageState.quickReplies) {
            draft.sendInteractiveMessageState.quickReplies.push("");
          }
        }
      })
    );
  }

  function setReply(value: string, index: number) {
    setAction(
      produce(action, (draft) => {
        if (draft.sendInteractiveMessageState?.quickReplies?.length) {
          draft.sendInteractiveMessageState.quickReplies[index] = value;
        }
      })
    );
  }

  return (
    <div className={styles.wrapper}>
      {action.sendInteractiveMessageState?.quickReplies?.map((reply, i) => (
        <Form.Field
          key={`reply_${i}`}
          style={{ display: "flex", alignItems: "center" }}
        >
          <WordCountInput
            value={reply}
            placeholder={t(
              "form.interactiveMessage.field.quickReplies.buttonText"
            )}
            onChange={(value) => setReply(value, i)}
          />
          <span className={styles.closeButton} onClick={() => removeReply(i)}>
            <Icon name="close" className="lg" />
          </span>
        </Form.Field>
      ))}
      <Button
        className={styles.addButton}
        disabled={!canAddMoreButtons}
        onClick={appendReply}
      >
        + {t("form.interactiveMessage.field.quickReplies.addButton")}
      </Button>
    </div>
  );
}
