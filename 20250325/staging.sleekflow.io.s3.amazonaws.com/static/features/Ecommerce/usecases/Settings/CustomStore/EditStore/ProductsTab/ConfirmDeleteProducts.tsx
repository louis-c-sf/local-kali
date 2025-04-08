import { Modal, Icon } from "semantic-ui-react";
import { Trans, useTranslation } from "react-i18next";
import { Button } from "component/shared/Button/Button";
import React from "react";

export function ConfirmDeleteProducts(props: {
  cancel: () => void;
  isRunning: boolean;
  execute: () => Promise<void>;
  count: number;
}) {
  const { t } = useTranslation();
  const count = props.count;

  return (
    <Modal open size={"tiny"} mountNode={document.body} onClose={props.cancel}>
      <Modal.Header>
        {t("settings.commerce.deleteProducts.title")}
        <Icon name={"delete"} className={"lg"} onClick={props.cancel} />
      </Modal.Header>
      <Modal.Content>
        <Trans
          i18nKey={"settings.commerce.deleteProducts.prompt"}
          count={count}
        >
          Are you sure you want to delete the selected items ({{ count }})?
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
