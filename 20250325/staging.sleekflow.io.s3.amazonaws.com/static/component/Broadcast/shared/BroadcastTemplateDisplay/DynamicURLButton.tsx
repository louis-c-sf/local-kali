import React, { useCallback, useState } from "react";
import {
  isURLButton,
  UPDATED_PART_ENUM,
} from "App/reducers/Chat/whatsappTemplatesReducer";
import {
  getInputId,
  getIsVarsSetValid,
} from "component/Chat/Messenger/SelectWhatsappTemplate/EditTemplateInline";
import { VarInput } from "component/Chat/Messenger/SelectWhatsappTemplate/VarInput";
import { walkWhatsappTemplateParts } from "component/Chat/Messenger/SelectWhatsappTemplate/walkWhatsappTemplateParts";
import extractWhatsAppFragment from "container/Settings/OfficialWhatsApp/extractWhatsAppFragment";
import { OptInContentType } from "features/Whatsapp360/models/OptInType";
import { assoc } from "ramda";
import { useTranslation } from "react-i18next";
import { Dropdown, Form } from "semantic-ui-react";
import styles from "./DynamicURLButton.module.css";
import { SendWhatsAppAutomationTemplateState } from "types/AutomationActionType";
import { SendWhatsappTemplateState } from "types/BroadcastCampaignType";

export function isDynamicUrlButtonExist(
  channelType: string,
  sendWhatsappTemplate:
    | SendWhatsAppAutomationTemplateState
    | SendWhatsappTemplateState
    | undefined
) {
  return (
    channelType === "whatsappcloudapi" &&
    Object.keys(sendWhatsappTemplate?.variables?.button || {}).length > 0 &&
    sendWhatsappTemplate?.templateContent
  );
}
export function DynamicURLButton({
  template,
  disabled,
  button,
  updateVarChanged,
  updateLastVarInputId,
  selectedChannelIndex,
  errors,
}: {
  template: OptInContentType | undefined;
  disabled: boolean;
  button: Record<string, string>;
  updateLastVarInputId: (name: string) => void;
  updateVarChanged: (
    updatedPart: UPDATED_PART_ENUM,
    name: string,
    value: string
  ) => void;
  selectedChannelIndex: number;
  errors?: Record<string, string>;
}) {
  const { t } = useTranslation();
  const [errorMsg, setErrorMsg] = useState({});
  const [varsTouched, setVarsTouched] = useState({});
  const [isFocused, setIsFocused] = useState<string>();
  const loseFocus = useCallback(() => {
    setIsFocused(undefined);
  }, [setIsFocused]);

  const catchFocus = useCallback(
    (name: string) => {
      setIsFocused(name);
      updateLastVarInputId(name);
    },
    [setIsFocused, JSON.stringify(button)]
  );
  const touchVar = useCallback(
    (name: string) => {
      setVarsTouched(assoc(name, true));
    },
    [setVarsTouched]
  );
  const updatedVarChanged = useCallback(
    (updatedPart: UPDATED_PART_ENUM, name: string, value: string) => {
      const variableName = name.replace(`${updatedPart}_`, "");
      updateVarChanged(updatedPart, variableName, value);
      if ([...value.matchAll(/\s{4,}/g)].length > 0) {
        setErrorMsg((msg) => ({
          ...msg,
          [variableName]: t("tooltip.template.extraSpace"),
        }));
      } else {
        setErrorMsg((msg) => ({
          ...msg,
          [variableName]: "",
        }));
      }
      touchVar(name);
    },
    [touchVar]
  );
  if (!template) {
    return null;
  }
  const { buttons } = extractWhatsAppFragment(template);
  const urlButton = buttons?.find(isURLButton);
  const url = walkWhatsappTemplateParts(urlButton?.url ?? "");
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title}>
          {t("broadcast.edit.callToAction.title")}
        </div>
        <div className={styles.subTitle}>
          {t("broadcast.edit.callToAction.subTitle")}
        </div>
        <Dropdown
          className={styles.dropdown}
          selection
          text={t("broadcast.edit.callToAction.dropdown")}
          disabled
        />
      </div>
      <div className={styles.content}>
        <div className={styles.buttonType}>
          <label>{t("broadcast.edit.callToAction.button.label")}</label>
          <Form.Input value={urlButton?.text} disabled />
        </div>
        <Form.Field>
          <label>{t("broadcast.edit.callToAction.dynamicURL.label")}</label>
          <div className={styles.url}>
            {url.map((f) => {
              if (f.type === "string") {
                return f.value;
              }
              const name = `button_${f.name}`;
              return (
                <VarInput
                  disabled={disabled}
                  key={f.name}
                  id={getInputId(name)}
                  updatedPart="button"
                  name={name}
                  value={button[f.name] ?? {}}
                  onBlur={loseFocus}
                  onChange={updatedVarChanged}
                  onFocus={catchFocus}
                  valid={
                    isFocused === f.name
                      ? true
                      : errors
                      ? errors[
                          `campaignChannelMessages[${selectedChannelIndex}].sendWhatsAppTemplate.variables.button[${f.name}]`
                        ] === undefined
                      : getIsVarsSetValid("button", f.name, button, varsTouched)
                  }
                />
              );
            })}
          </div>
        </Form.Field>
        <div className={styles.note}>
          {t("broadcast.edit.callToAction.note")}
        </div>
      </div>
    </div>
  );
}
