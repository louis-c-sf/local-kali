import React, { ReactNode } from "react";
import { Button, Modal, StrictModalProps } from "semantic-ui-react";
import styles from "./ModalForm.module.css";

export function ModalForm(props: {
  opened: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  children: ReactNode;
  title: string;
  subTitle?: string;
  confirmText: string;
  cancelText: string;
  isLoading: boolean;
  actions?: () => React.ReactNode;
  centeredContent?: boolean;
  horizontalActions?: boolean;
  disableSubmit?: boolean;
  minimal?: boolean;
  size?: StrictModalProps["size"];
  darkHeader?: boolean;
  className?: string;
}) {
  const {
    onCancel,
    confirmText,
    opened,
    cancelText,
    onConfirm,
    title,
    children,
    isLoading,
    subTitle,
    actions,
    centeredContent = false,
    horizontalActions = false,
    disableSubmit = false,
    minimal = true,
    darkHeader = false,
    size = "small",
    className,
  } = props;

  return (
    <Modal
      open={opened}
      closeOnDimmerClick={false}
      className={`
        create-form
        ${minimal ? "minimal" : ""}
        ${centeredContent ? `upgrade-modal ${styles.centered}` : ""}
        ${className || ""}
        `}
      size={size}
      onClose={onCancel}
      closeIcon
    >
      <Modal.Content className={styles.content}>
        {darkHeader && <Modal.Header>{title}</Modal.Header>}
        {!darkHeader && <h3 className={styles.title}>{title}</h3>}
        {subTitle && <div className={"sub-header"}>{subTitle}</div>}
        {children}
      </Modal.Content>
      <Modal.Actions
        className={`
        ${styles.actions}
        ${horizontalActions ? styles.horizontal : ""}
      `}
      >
        {actions ? (
          actions()
        ) : (
          <>
            <Button
              primary
              onClick={isLoading ? undefined : onConfirm}
              loading={isLoading}
              content={confirmText}
              className={styles.button}
              disabled={isLoading || disableSubmit}
            />
            <Button
              onClick={isLoading ? undefined : onCancel}
              content={cancelText}
              className={styles.button}
            />
          </>
        )}
      </Modal.Actions>
    </Modal>
  );
}
