import React from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "semantic-ui-react";
import styles from "./BroadcastNoteModal.module.css";

export default function BroadcastNoteModal(props: {
  closeModal: () => void;
  confirm: () => void;
}) {
  const { t } = useTranslation();

  return (
    <Modal open={true} size={"tiny"}>
      <Modal.Header className={styles.header}>
        {t("broadcast.edit.note.warning.title")}
      </Modal.Header>
      <Modal.Content className={styles.content}>
        {t("broadcast.edit.note.warning.content")}
      </Modal.Content>
      <Modal.Actions className={styles.actions}>
        <div className="action">
          <div className="primary button ui" onClick={props.confirm}>
            {t("broadcast.edit.note.warning.button.continue")}
          </div>
          <div className="button ui" onClick={props.closeModal}>
            {t("broadcast.edit.note.warning.button.cancel")}
          </div>
        </div>
      </Modal.Actions>
    </Modal>
  );
}
