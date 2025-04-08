import React from "react";
import { Button, Modal } from "semantic-ui-react";

function ModalConfirm(props: {
  opened: boolean;
  onCancel?: () => void;
  onConfirm: () => void;
  children: any;
  title: string;
  confirmText: string;
  cancelText?: string;
  className?: string;
  closeIcon?: boolean;
  loading?: boolean;
}) {
  const {
    onCancel,
    confirmText,
    opened,
    cancelText,
    onConfirm,
    title,
    children,
  } = props;
  const { className, closeIcon = false, loading = false } = props;

  return (
    <Modal
      open={opened}
      closeOnDimmerClick={false}
      dimmer={"inverted"}
      className={`modal-confirm ${className ?? ""}`}
      size={"small"}
      onClose={onCancel}
      closeIcon={closeIcon || undefined}
    >
      <Modal.Header>{title}</Modal.Header>
      <Modal.Content>{children}</Modal.Content>
      <Modal.Actions>
        <Button
          primary
          onClick={onConfirm}
          disabled={loading}
          loading={loading}
        >
          {confirmText}
        </Button>
        {onCancel && cancelText && (
          <Button onClick={onCancel} disabled={loading}>
            {cancelText}
          </Button>
        )}
      </Modal.Actions>
    </Modal>
  );
}

export default ModalConfirm;
