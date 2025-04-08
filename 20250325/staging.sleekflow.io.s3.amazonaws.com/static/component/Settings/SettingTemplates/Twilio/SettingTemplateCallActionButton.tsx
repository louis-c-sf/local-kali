import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Dropdown, Form, Image } from "semantic-ui-react";
import { WhatsappTemplateComponentButtonType } from "../../../../types/WhatsappTemplateResponseType";
import DeleteImg from "../../../../assets/images/delete-icon.svg";
import { ButtonContentType, BTN_TEXT_MAX_LENGTH } from "./SettingTemplate";
import { FieldError } from "../../../shared/form/FieldError";
import InputLengthCounter from "component/shared/InputLengthCounter";
import styles from "./SettingTemplateCallActionButton.module.css";
import { URL_VARIABLE_TOKEN } from "../CloudApi/EditTemplate";

export default function SettingTemplateCallActionButton(props: {
  onButtonTextChange: (buttonText: string) => void;
  onValueChange: (type: string, value: string) => void;
  onTypeChange?: (type: string) => void;
  onRemove: () => void;
  button: WhatsappTemplateComponentButtonType;
  error: ButtonContentType | false;
  isReadOnly: boolean;
  enabledSelectActionType?: boolean;
  enabledDynamicUrl?: boolean;
  onButtonTypeChange?: (type: string) => void;
}) {
  const { t } = useTranslation();
  const {
    onValueChange,
    onRemove,
    button,
    onButtonTextChange,
    error,
    isReadOnly,
    enabledSelectActionType = false,
    enabledDynamicUrl = false,
    onButtonTypeChange,
  } = props;
  const selectedType = button.type.toLowerCase();
  const [urlType, setUrlType] = useState<"static" | "dynamic">("static");

  const actionTypeOptions = [
    {
      text: t("settings.template.form.buttons.callToAction.actionType.url"),
      value: "url",
    },
    {
      text: t(
        "settings.template.form.buttons.callToAction.actionType.phoneNumber"
      ),
      value: "phone_number",
    },
  ];
  const buttonValueMapping = {
    url: {
      label: t("settings.template.form.buttons.callToAction.website.label"),
      value: button.url,
      placeholder: t(
        "settings.template.form.buttons.callToAction.website.placeholder"
      ),
    },
    phone_number: {
      label: t("settings.template.form.buttons.callToAction.phoneNumber.label"),
      value: button.phone_number,
      placeholder: t(
        "settings.template.form.buttons.callToAction.phoneNumber.placeholder"
      ),
    },
  };

  const changeUrlType = (type: "static" | "dynamic") => () => {
    onValueChange(selectedType, "");
    setUrlType(type);
  };

  useEffect(() => {
    if (button.type === "URL" && button.url?.includes(URL_VARIABLE_TOKEN)) {
      setUrlType("dynamic");
    }
  }, [button]);

  return (
    <div className={`${styles.callActionWrapper}`}>
      <div className={styles.deleteButton}>
        {!isReadOnly && (
          <div className="image-container">
            <Image onClick={onRemove} src={DeleteImg} />
          </div>
        )}
      </div>
      <Form.Field className={styles.fieldWrapper}>
        <label>
          {t("settings.template.form.buttons.callToAction.actionType.label")}
        </label>
        <Dropdown
          fluid
          scrolling
          selectOnBlur={false}
          options={actionTypeOptions}
          disabled={isReadOnly || !enabledSelectActionType}
          value={selectedType}
          onChange={(_, data) => {
            if (onButtonTypeChange) {
              setUrlType("static");
              onButtonTypeChange(data.value as string);
            }
          }}
        />
        {error && error.type && <FieldError text={error.type} />}
      </Form.Field>
      {selectedType && (
        <>
          <Form.Field>
            <label>
              {t(
                "settings.template.form.buttons.callToAction.buttonText.label"
              )}
            </label>
            <Form.Input
              disabled={isReadOnly}
              value={button.text}
              placeholder={t(
                "settings.template.form.buttons.callToAction.buttonText.placeholder"
              )}
              onChange={(_, data) => {
                const text = data.value;
                if (text.length > BTN_TEXT_MAX_LENGTH) {
                  return;
                }
                onButtonTextChange(data.value);
              }}
            />
            <InputLengthCounter length={button.text.length} />
            {error && error.text && !error.type && (
              <FieldError text={error.text} />
            )}
          </Form.Field>
          <Form.Field>
            <label>{buttonValueMapping[selectedType].label}</label>
            {enabledDynamicUrl && selectedType === "url" && (
              <div>
                <div
                  className={`${styles.dynamicUrlSwitchWrapper} ${
                    isReadOnly ? styles.disabled : ""
                  } `}
                >
                  <div
                    className={`${styles.dynamicUrlSwitch} ${
                      urlType === "static" ? styles.enabled : ""
                    }`}
                    onClick={isReadOnly ? undefined : changeUrlType("static")}
                  >
                    {t(
                      "settings.template.form.buttons.callToAction.website.staticUrl"
                    )}
                  </div>
                  <div
                    className={`${styles.dynamicUrlSwitch} ${
                      urlType === "dynamic" ? styles.enabled : ""
                    }`}
                    onClick={isReadOnly ? undefined : changeUrlType("dynamic")}
                  >
                    {t(
                      "settings.template.form.buttons.callToAction.website.dynamicUrl"
                    )}
                  </div>
                </div>
              </div>
            )}
            {urlType === "dynamic" ? (
              <>
                <div className={styles.inputWrapper}>
                  <Form.Input
                    className={styles.input}
                    disabled={isReadOnly}
                    value={(
                      buttonValueMapping[selectedType].value || ""
                    ).replace(URL_VARIABLE_TOKEN, "")}
                    placeholder={buttonValueMapping[selectedType].placeholder}
                    onChange={(_, data) => {
                      onValueChange(
                        selectedType,
                        `${data.value}${URL_VARIABLE_TOKEN}`
                      );
                    }}
                  />
                  <div className={styles.variable}>
                    {t(
                      "settings.template.form.buttons.callToAction.website.variable"
                    )}
                  </div>
                </div>
                <div className={styles.dynamicUrlReminder}>
                  {t(
                    "settings.template.form.buttons.callToAction.website.reminder"
                  )}
                </div>
              </>
            ) : (
              <Form.Input
                className={styles.input}
                disabled={isReadOnly}
                value={buttonValueMapping[selectedType].value}
                placeholder={buttonValueMapping[selectedType].placeholder}
                onChange={(_, data) => {
                  onValueChange(selectedType, data.value);
                }}
              />
            )}

            {error && (error.phone_number || error.url) && (
              <FieldError text={error.url || error.phone_number} />
            )}
          </Form.Field>
        </>
      )}
    </div>
  );
}
