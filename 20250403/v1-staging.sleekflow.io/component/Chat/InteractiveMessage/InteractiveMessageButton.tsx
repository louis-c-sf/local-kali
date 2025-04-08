import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Image, Modal } from "semantic-ui-react";
import { InfoTooltip } from "component/shared/popup/InfoTooltip";
import InteractiveMessageForm from "./InteractiveMessageForm";
import Icon from "assets/images/inbox-interactive-message.svg";
import { useAppDispatch } from "AppRootContext";
import { InteractiveMessageValues } from "./InteractiveMessageSchema";
import styles from "./InteractiveMessageButton.module.css";
import { CloseIcon } from "component/shared/modal/CloseIcon";

export default function InteractiveMessageButton() {
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const dispatch = useAppDispatch();

  function onSubmit(values: InteractiveMessageValues) {
    dispatch({ type: "INBOX.INTERACTIVE_MESSAGE.SET", values });
    setShowModal(false);
  }

  return (
    <>
      <InfoTooltip
        placement="top"
        children={t("chat.actions.interactiveMessage.add")}
        offset={[40, 10]}
        trigger={
          <Button onClick={() => setShowModal(true)}>
            <Image src={Icon} />
          </Button>
        }
      />
      <Modal
        open={showModal}
        closeIcon={<CloseIcon />}
        closeOnDimmerClick={false}
        onClose={() => setShowModal(false)}
        className={styles.modal}
      >
        <InteractiveMessageForm onSubmit={onSubmit} />
      </Modal>
    </>
  );
}
