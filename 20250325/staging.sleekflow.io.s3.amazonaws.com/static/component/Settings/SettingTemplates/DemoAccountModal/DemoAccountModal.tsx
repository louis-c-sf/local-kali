import React from "react";
import { useTranslation } from "react-i18next";
import { Button, Modal } from "semantic-ui-react";

export default function DemoAccountModal(props: { closePopUp: () => void }) {
  const { t } = useTranslation();
  return (
    <Modal
      open={true}
      mountNode={document.body}
      size="small"
      className={"modal-confirm no-icon"}
    >
      <Modal.Header>
        {t("settings.template.modal.demoAccount.header")}
      </Modal.Header>
      <Modal.Content>
        {t("settings.template.modal.demoAccount.content")}
      </Modal.Content>
      <Modal.Actions>
        <Button primary onClick={props.closePopUp}>
          {t("settings.template.modal.demoAccount.button.back")}
        </Button>
      </Modal.Actions>
    </Modal>
  );
}
