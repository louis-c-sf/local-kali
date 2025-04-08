import insertTextAtCursor from "insert-text-at-cursor";
import { assoc } from "ramda";
import React, { useCallback, useState } from "react";
import { UPDATED_PART_ENUM } from "../../../../App/reducers/Chat/whatsappTemplatesReducer";
import RedirectIcon from "../../../../assets/tsx/icons/RedirectIcon";
import { SendWhatsappTemplateState } from "../../../../types/BroadcastCampaignType";
import {
  getInputId,
  getIsVarsSetValid,
} from "../../../Chat/Messenger/SelectWhatsappTemplate/EditTemplateInline";
import { VarInput } from "../../../Chat/Messenger/SelectWhatsappTemplate/VarInput";
import EmojiButton from "../../../EmojiButton";
import { isTemplateVariableExist } from "../../broadcastReducer";
import redirectIconStyles from "../../../shared/RedirectIcon.module.css";
import styles from "./BroadcastTemplateDisplay.module.css";
import extractWhatsAppFragment from "../../../../container/Settings/OfficialWhatsApp/extractWhatsAppFragment";
import { useBroadcastOptInContext } from "./BroadcastOptInContext";
import { useTranslation } from "react-i18next";

export function BroadcastOptInTemplateDisplay(props: {
  sendWhatsappTemplate: SendWhatsappTemplateState;
  selectedChannelIndex: number;
  updateVarChanged: (
    updatedPart: UPDATED_PART_ENUM,
    name: string,
    value: string
  ) => void;
  updateLastVarInputId: (name: string) => void;
  disabled: boolean;
  errors?: Record<string, string>;
}) {
  const {
    sendWhatsappTemplate,
    errors,
    selectedChannelIndex,
    updateLastVarInputId,
    disabled,
  } = props;
  const { t } = useTranslation();
  const { variables, lastVarInputId } = sendWhatsappTemplate;
  const [isFocused, setIsFocused] = useState<string>();
  const [varsTouched, setVarsTouched] = useState({});
  const [errorMsg, setErrorMsg] = useState({});
  const { getIsVarValid } = useBroadcastOptInContext();

  function handleEmojiInput(emoji: string, input?: HTMLInputElement) {
    if (input && emoji) {
      insertTextAtCursor(input, emoji);
    }
  }

  const touchVar = useCallback(
    (name: string) => {
      setVarsTouched(assoc(name, true));
    },
    [setVarsTouched]
  );

  const loseFocus = useCallback(() => {
    setIsFocused(undefined);
  }, [setIsFocused]);

  const catchFocus = useCallback(
    (name: string) => {
      setIsFocused(name);
      updateLastVarInputId(name);
    },
    [
      setIsFocused,
      JSON.stringify([variables.content, variables.header]),
      JSON.stringify(sendWhatsappTemplate),
    ]
  );

  const updatedVarChanged = useCallback(
    (updatedPart: UPDATED_PART_ENUM, name: string, value: string) => {
      const variableName = name.replace(`${updatedPart}_`, "");
      props.updateVarChanged(updatedPart, variableName, value);
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
    [touchVar, JSON.stringify(sendWhatsappTemplate)]
  );
  const whatsapp360Template = sendWhatsappTemplate.templateContent;
  if (!whatsapp360Template) {
    return null;
  }
  const {
    header: headerFragments,
    content: fragments,
    buttons,
    footer,
  } = extractWhatsAppFragment(whatsapp360Template);
  const isAbleToEdit = isTemplateVariableExist(variables) && !disabled;

  return (
    <>
      <div className={styles.body}>
        {whatsapp360Template?.header?.format.toLowerCase() === "text" && (
          <div className={styles.header}>
            {headerFragments.map((f) => {
              if (f.type === "string") {
                return f.value;
              }
              const name = `header_${f.name}`;
              return (
                <VarInput
                  disabled={disabled}
                  key={f.name}
                  name={name}
                  updatedPart={"header"}
                  value={variables.header[f.name] ?? ""}
                  id={getInputId(name)}
                  valid={
                    isFocused === f.name
                      ? true
                      : errors
                      ? errors[
                          `campaignChannelMessages[${selectedChannelIndex}].sendWhatsAppTemplate.variables.header[${f.name}]`
                        ] === undefined
                      : getIsVarsSetValid(
                          "header",
                          f.name,
                          variables.header,
                          varsTouched
                        )
                  }
                  onChange={updatedVarChanged}
                  onFocus={catchFocus}
                  onBlur={loseFocus}
                  errorMessage={errorMsg[f.name]}
                />
              );
            })}
          </div>
        )}
        <div className={styles.content}>
          {fragments.map((f) => {
            if (f.type === "string") {
              return f.value;
            }
            const name = `content_${f.name}`;
            return (
              <VarInput
                disabled={disabled}
                key={f.name}
                name={name}
                updatedPart={"content"}
                value={variables.content[f.name] ?? ""}
                id={getInputId(name)}
                valid={
                  isFocused === f.name
                    ? true
                    : getIsVarValid(
                        f.name,
                        variables.content,
                        varsTouched,
                        selectedChannelIndex,
                        errors
                      )
                }
                onChange={updatedVarChanged}
                onFocus={catchFocus}
                onBlur={loseFocus}
                errorMessage={errorMsg[f.name]}
              />
            );
          })}
        </div>
        {footer && <div className={styles.footer}>{footer.text}</div>}
        {buttons && (
          <div className={styles.buttons}>
            {buttons.map((button, index) => (
              <div
                key={`button_${index}_${button.type}`}
                className={styles.button}
              >
                {button.type.toLowerCase() === "url" ? (
                  <a
                    href={button.url}
                    className={styles.link}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    {button.text}{" "}
                    <RedirectIcon
                      className={redirectIconStyles.redirectIconStyles}
                    />
                  </a>
                ) : (
                  <span>{button.text}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className={styles.emoji}>
        {isAbleToEdit && (
          <EmojiButton
            handleEmojiInput={(emoji) => {
              handleEmojiInput(
                emoji,
                document.getElementById(
                  getInputId(lastVarInputId ?? "")
                ) as HTMLInputElement
              );
            }}
          />
        )}
        <div className={styles.counter}></div>
      </div>
    </>
  );
}
