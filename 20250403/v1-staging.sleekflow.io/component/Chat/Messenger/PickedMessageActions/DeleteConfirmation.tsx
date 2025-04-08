import { useTranslation } from "react-i18next";
import { Modal } from "semantic-ui-react";
import React from "react";
import { Button } from "../../../shared/Button/Button";
import styles from "../PickedMessageActions.module.css";

export function DeleteConfirmation(props: {
  number: number;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const { t } = useTranslation();
  return (
    <Modal open size={"mini"} centered className={"delete-confirmation"}>
      <Modal.Content className={"white"}>
        <p className={"big-text"}>
          {t("chat.alert.deleteMessagesConfirm", { count: props.number })}
        </p>
        <div className="button-stack">
          <Button
            primary
            disabled={props.loading}
            loading={props.loading}
            className={styles.button}
            onClick={props.onConfirm}
            content={t("form.button.delete")}
          />
          <Button
            onClick={props.onCancel}
            className={styles.button}
            content={t("form.button.cancel")}
          />
        </div>
      </Modal.Content>
    </Modal>
  );
}
