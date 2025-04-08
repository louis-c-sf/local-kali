import React, { useContext } from "react";
import styles from "./NewBroadcastContentHeader.module.css";
import { useBroadcastLocales } from "../localizable/useBroadcastLocales";
import { useTranslation } from "react-i18next";
import { FieldError } from "../../shared/form/FieldError";
import BroadcastContext from "../BroadcastContext";

export default function NewBroadcastContentHeader(props: {
  isSMSWordExceedLimit: boolean;
  isOfficialChannelSelected: boolean;
  isTemplateSelected: boolean;
  isDisplaySelectTemplateLink: boolean;
  errorMessage?: string;
  characterLimit?: string;
  showTemplateSelection: () => void;
  clearTemplateSelection: () => void;
}) {
  const { validateFormMessage } = useBroadcastLocales();
  const { broadcastDispatch } = useContext(BroadcastContext);
  const {
    characterLimit,
    isSMSWordExceedLimit,
    errorMessage,
    isOfficialChannelSelected,
    isTemplateSelected,
    isDisplaySelectTemplateLink,
  } = props;
  const { t } = useTranslation();

  return (
    <div className="header">
      <div className={styles.header}>
        <span className={styles.message}>
          {t("broadcast.edit.field.content.label")} {characterLimit}
        </span>
        {isOfficialChannelSelected &&
          (isTemplateSelected ? (
            <span
              className={styles.action}
              onClick={props.clearTemplateSelection}
            >
              {t("broadcast.edit.content.clearLink")}
            </span>
          ) : (
            isDisplaySelectTemplateLink && (
              <span
                className={styles.action}
                onClick={() =>
                  broadcastDispatch({ type: "SET_TEMPLATE_SELECTION" })
                }
              >
                {t("broadcast.edit.content.addTemplateLink")}
              </span>
            )
          ))}
      </div>
      <div className={styles.error}>
        {isSMSWordExceedLimit && (
          <FieldError text={validateFormMessage["exceedWordLimit"]} />
        )}
        <FieldError text={errorMessage} />
      </div>
    </div>
  );
}
