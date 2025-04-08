import WordCountInput from "component/shared/input/WordCountInput/WordCountInput";
import produce from "immer";
import React from "react";
import { useTranslation } from "react-i18next";
import { Form } from "semantic-ui-react";
import {
  AutomationActionType,
  SendMessageAutomationActionType,
} from "types/AutomationActionType";
import ListMessageSections from "./ListMessageSections";
import styles from "./SendInteractiveMessageForm.module.css";

export default function ListMessageField({
  action,
  setAction,
}: {
  action: SendMessageAutomationActionType;
  setAction: (action: AutomationActionType) => void;
}) {
  const { t } = useTranslation();

  function setListTitle(value: string) {
    setAction(
      produce(action, (draft) => {
        if (
          draft.sendInteractiveMessageState?.listMessage?.title !== undefined
        ) {
          draft.sendInteractiveMessageState.listMessage.title = value;
        }
      })
    );
  }

  return (
    <div>
      <Form.Field>
        <label>
          {t("form.interactiveMessage.field.listMessage.listTitle.label")}
        </label>
        <WordCountInput
          value={action.sendInteractiveMessageState?.listMessage?.title || ""}
          onChange={(value) => setListTitle(value)}
        />
        <p className={styles.titleDescription}>
          {t("form.interactiveMessage.field.listMessage.listTitle.description")}
        </p>
      </Form.Field>
      <div className={styles.optionSectionWrapper}>
        <p>{t("form.interactiveMessage.field.listMessage.selectOptions")}</p>
        <ListMessageSections action={action} setAction={setAction} />
      </div>
    </div>
  );
}
