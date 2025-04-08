import React, { useEffect } from "react";
import styles from "./Create360DialogForm.module.css";
import { Button } from "../../shared/Button/Button";
import { useValidateApiKey } from "../useValidateApiKey";
import StatusAlert from "../../shared/StatusAlert";
import { useTranslation } from "react-i18next";
import { FieldError } from "../../shared/form/FieldError";
import { Create360DialogChannelResponseType } from "../../../api/Channel/submitCreate360DialogChannel";

export function Create360DialogForm(props: {
  onSuccess: (channelCreated: Create360DialogChannelResponseType) => void;
  clientAPIKey?: string;
}) {
  const { t } = useTranslation();
  const { clientAPIKey } = props;
  const {
    loading,
    setApiKey,
    setChannelName,
    values,
    checkError,
    errors,
    submitForm,
    isValid,
  } = useValidateApiKey({
    onSuccess: props.onSuccess,
  });
  useEffect(() => {
    if (clientAPIKey) {
      setApiKey(clientAPIKey);
    }
  }, [clientAPIKey]);
  return (
    <div className={styles.root}>
      <div className="ui form">
        <div className={styles.field}>
          <div className="ui field">
            <label>{t("form.createWhatsapp.form.field.apiCheck.label")}</label>
            <input
              {...(clientAPIKey
                ? {
                    disabled: true,
                    readOnly: true,
                  }
                : {})}
              value={clientAPIKey ? clientAPIKey : values.apiKey}
              onChange={(event) => {
                setApiKey(event.target.value);
              }}
              placeholder={t(
                "form.createWhatsapp.form.field.apiCheck.placeholder"
              )}
            />
          </div>
          <FieldError text={errors.apiKey} />
        </div>

        <div className={styles.field}>
          <div className="ui field">
            <label>{t("form.createWhatsapp.form.field.name.label")}</label>
            <input
              value={values.channelName}
              onChange={(event) => {
                setChannelName(event.target.value);
              }}
              placeholder={t("form.createWhatsapp.form.field.name.placeholder")}
            />
          </div>
          <FieldError text={errors.channelName} />
        </div>

        {checkError !== "" && (
          <div className={styles.alert}>
            <StatusAlert type={"warning"} headerText={checkError}>
              {t("form.createWhatsapp.form.error.apiCheck.text")}
            </StatusAlert>
          </div>
        )}
      </div>
      <div className={styles.actions}>
        <Button
          content={t("form.button.submit")}
          customSize={"mid"}
          centerText
          primary
          disabled={!isValid || loading || checkError !== ""}
          fluid
          onClick={submitForm}
          loading={loading}
        />
      </div>
    </div>
  );
}
