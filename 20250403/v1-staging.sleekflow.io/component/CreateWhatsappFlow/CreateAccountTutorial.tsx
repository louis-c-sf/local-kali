import { Modal } from "semantic-ui-react";
import styles from "./Create360DialogAccount.module.css";
import { CloseIcon } from "../shared/modal/CloseIcon";
import React from "react";

export function CreateAccountTutorial(props: { onClose: () => void }) {
  return (
    <Modal
      open
      dimmer
      className={styles.videoModal}
      closeOnDocumentClick
      closeIcon={<CloseIcon onClick={props.onClose} />}
      onClose={props.onClose}
    >
      <iframe
        width="600"
        height="260"
        src="https://www.youtube.com/embed/_WxbHVdC8L4"
        title="Express Signup Tutorial - 360dialog"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </Modal>
  );
}
