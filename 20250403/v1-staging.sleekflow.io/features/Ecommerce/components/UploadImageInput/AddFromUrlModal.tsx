import React, { useState } from "react";
import styles from "./AddFromUrlModal.module.css";
import { Modal, Icon } from "semantic-ui-react";
import { Trans, useTranslation } from "react-i18next";
import { Button } from "component/shared/Button/Button";

export function AddFromUrlModal(props: {
  onCancel: () => void;
  onExecute: (url: string) => void;
}) {
  const { t } = useTranslation();
  const [value, setValue] = useState("");
  const [sendAttempted, setSendAttempted] = useState(false);
  const [error, setError] = useState<string>();
  const [executing, setExecuting] = useState(false);

  function validate() {
    try {
      new URL(value);
      return true;
    } catch (e) {
      return false;
    }
  }

  const showError = Boolean(sendAttempted && error);

  const submit = async () => {
    setSendAttempted(true);
    if (!validate()) {
      setError(t("settings.commerce.addProduct.error.url.format"));
      return;
    }
    setExecuting(true);
    setError(undefined);
    await props.onExecute(value);
    setExecuting(false);
  };

  return (
    <Modal
      open
      size={"tiny"}
      mountNode={document.body}
      onClose={props.onCancel}
    >
      <Modal.Header>
        {t("settings.commerce.addProduct.button.addFromURL")}
        <Icon name={"delete"} className={"lg"} onClick={props.onCancel} />
      </Modal.Header>
      <Modal.Content>
        <div className="ui form">
          <div className={`field ${styles.field}`}>
            <label>
              {t("settings.commerce.addProduct.field.imageURL.label")}
            </label>
            <input
              type="text"
              value={value}
              placeholder={"http://"}
              onChange={(event) => {
                const value = event.target.value;
                setValue(value);
              }}
            />
            {showError && error}
          </div>
        </div>
      </Modal.Content>
      <Modal.Actions>
        <Button
          primary
          onClick={submit}
          loading={executing}
          disabled={executing || showError}
          content={t("form.button.add")}
        />
      </Modal.Actions>
    </Modal>
  );
}
