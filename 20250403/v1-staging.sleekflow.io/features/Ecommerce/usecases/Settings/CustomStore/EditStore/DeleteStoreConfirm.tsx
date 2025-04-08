import React from "react";
import { Modal, Icon } from "semantic-ui-react";
import { Trans, useTranslation } from "react-i18next";
import { Button } from "component/shared/Button/Button";

export function DeleteStoreConfirm(props: {
  cancel: () => void;
  isRunning: boolean;
  execute: () => void;
  name: string;
}) {
  const { t } = useTranslation();

  return (
    <Modal open size={"tiny"} mountNode={document.body} onClose={props.cancel}>
      <Modal.Header>
        {t("settings.commerce.deleteStore.title", {
          name: props.name,
        })}
        <Icon name={"delete"} className={"lg"} onClick={props.cancel} />
      </Modal.Header>
      <Modal.Content>
        <Trans i18nKey={"settings.commerce.deleteStore.prompt"}>
          Deleting store will remove all data permanently. This action cannot be
          undone.
        </Trans>
      </Modal.Content>
      <Modal.Actions>
        <Button
          onClick={props.cancel}
          disabled={props.isRunning}
          content={t("form.button.cancel")}
        />
        <Button
          primary
          onClick={props.execute}
          loading={props.isRunning}
          disabled={props.isRunning}
          content={t("form.button.confirm")}
        />
      </Modal.Actions>
    </Modal>
  );
}
