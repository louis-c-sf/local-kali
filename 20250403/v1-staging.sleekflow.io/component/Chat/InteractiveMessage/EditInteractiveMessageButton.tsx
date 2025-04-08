import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "semantic-ui-react";
import InteractiveMessageForm from "./InteractiveMessageForm";
import { useAppDispatch } from "AppRootContext";
import { InteractiveMessageValues } from "./InteractiveMessageSchema";
import styles from "./InteractiveMessageButton.module.css";
import { CloseIcon } from "component/shared/modal/CloseIcon";

export default function EditInteractiveMessageButton({
  interactiveMessageValues,
}: {
  interactiveMessageValues: InteractiveMessageValues;
}) {
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const dispatch = useAppDispatch();

  function onSubmit(values: InteractiveMessageValues) {
    dispatch({ type: "INBOX.INTERACTIVE_MESSAGE.SET", values });
    setShowModal(false);
  }

  return (
    <>
      <button onClick={() => setShowModal(true)} className={styles.editButton}>
        <i className={styles.editIcon} />
        {t("form.button.edit")}
      </button>
      <Modal
        open={showModal}
        closeIcon={<CloseIcon />}
        closeOnDimmerClick={false}
        onClose={() => setShowModal(false)}
        className={styles.modal}
      >
        <InteractiveMessageForm
          onSubmit={onSubmit}
          values={interactiveMessageValues}
        />
      </Modal>
    </>
  );
}
