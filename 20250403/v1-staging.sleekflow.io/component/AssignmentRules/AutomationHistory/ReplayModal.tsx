import React from "react";
import { useTranslation } from "react-i18next";
import { Button, Image, Modal } from "semantic-ui-react";
import styles from "./ReplayModal.module.css";
import ReplayBlueIcon from "./assets/replay-blue.svg";

interface ReplayModalPropsType {
  isOpen: boolean;
  isPending: boolean;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export default ReplayModal;

function ReplayModal(props: ReplayModalPropsType) {
  const { isOpen, isPending, onConfirm, onCancel } = props;
  const { t } = useTranslation();

  return (
    <Modal open={isOpen} className={styles.modal}>
      <Modal.Content>
        <Image src={ReplayBlueIcon} />
        <div className={styles.title}>
          {t("automation.history.modal.title")}
        </div>
        <div className={styles.description}>
          {t("automation.history.modal.description")}
        </div>
      </Modal.Content>
      <Modal.Actions>
        <Button
          primary
          onClick={onConfirm}
          loading={isPending}
          disabled={isPending}
        >
          {t("automation.history.modal.buttons.replay")}
        </Button>
        <Button onClick={onCancel} disabled={isPending}>
          {t("automation.history.modal.buttons.cancel")}
        </Button>
      </Modal.Actions>
    </Modal>
  );
}
