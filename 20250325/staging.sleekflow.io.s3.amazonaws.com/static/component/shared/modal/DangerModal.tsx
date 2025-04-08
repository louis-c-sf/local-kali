import React, { ReactNode } from "react";
import styles from "./DangerModal.module.css";
import { Modal, Icon } from "semantic-ui-react";
import { Button } from "../Button/Button";

export function DangerModal(props: {
  title: string;
  body: ReactNode;
  confirm: {
    content: ReactNode;
    handle: () => void;
  };
  cancel: {
    content: ReactNode;
    handle: () => void;
  };
}) {
  return (
    <Modal
      open
      size={"mini"}
      closeIcon={<Icon name={"close"} className={styles.close} />}
      onClose={props.cancel.handle}
      className={styles.modal}
    >
      <Modal.Header className={styles.header}>{props.title}</Modal.Header>
      <Modal.Content className={styles.content}>{props.body}</Modal.Content>
      <Modal.Actions className={styles.actions}>
        <Button
          className={styles.dangerButton}
          onClick={props.confirm.handle}
          content={props.confirm.content}
        />
        <Button onClick={props.cancel.handle} content={props.cancel.content} />
      </Modal.Actions>
    </Modal>
  );
}
