import React, { ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Modal } from "semantic-ui-react";

interface CustomModalPropsType {
  content: ReactNode;
  headerText: string;
  triggerText: string;
  loading: boolean;

  onConfirm(...args: any[]): void;

  onCancel(...args: any[]): void;
}

interface ModalTriggerProps {
  onClick: Function;
  text: string;
  loading: boolean;
}

const ModalTrigger = (props: ModalTriggerProps) => {
  const { onClick, text, loading } = props;
  return (
    <Button
      className="button2"
      loading={loading}
      content={text}
      onClick={(e) => onClick()}
    />
  );
};

// For modal needs to trigger with button

export function RemoveAccountConfirmModal(props: CustomModalPropsType) {
  const { content, loading, onConfirm, headerText, triggerText } = props;
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  return (
    <Modal
      closeOnDimmerClick={false}
      dimmer={"inverted"}
      className={"modal-confirm"}
      open={open}
      trigger={
        <ModalTrigger
          loading={loading}
          text={triggerText}
          onClick={() => setOpen(true)}
        />
      }
    >
      <Modal.Header content={headerText} />
      <Modal.Content className="content">
        <div className="desc">{content}</div>
      </Modal.Content>
      <Modal.Actions>
        <Button loading={loading} primary onClick={onConfirm}>
          {t("settings.modal.removeUserWarn.button.confirm")}
        </Button>
        <Button onClick={() => setOpen(false)}>
          {t("settings.modal.removeUserWarn.button.cancel")}
        </Button>
      </Modal.Actions>
    </Modal>
  );
}
