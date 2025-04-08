import { SharesFileRef } from "container/Contact/Import/contracts";
import { Trans, useTranslation } from "react-i18next";
import { Button, Modal } from "semantic-ui-react";
import React from "react";

interface ConfirmModalProps extends SharesFileRef {
  confirm: () => any;
  cancel: () => any;
}

export function ConfirmModal(props: ConfirmModalProps) {
  const { t } = useTranslation();
  return (
    <Modal
      open
      closeOnDimmerClick={false}
      dimmer={"inverted"}
      className={"wizard-modal"}
      size={"small"}
    >
      <Modal.Header className={"negative"}>
        {t("profile.list.import.modal.badFileWarn.header")}
      </Modal.Header>
      <Modal.Content>
        <div>
          <Trans
            values={{
              format: props.file?.type?.includes("csv") ? "CSV" : "Excel",
            }}
            i18nKey={"profile.list.import.modal.badFileWarn.text"}
          >
            <p>
              You’re about to import the uploaded CSV file into contacts, but we
              cannot match some of the column headers to your existing columns
              on SleekFlow. You’ll still be able to import the other matching
              data fields.
            </p>
          </Trans>
        </div>
      </Modal.Content>
      <Modal.Actions>
        <Button primary onClick={props.confirm}>
          {t("form.button.continue")}
        </Button>
        <Button onClick={props.cancel}>{t("form.button.cancel")}</Button>
      </Modal.Actions>
    </Modal>
  );
}
