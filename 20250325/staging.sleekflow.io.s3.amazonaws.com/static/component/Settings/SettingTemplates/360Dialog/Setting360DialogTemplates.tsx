import React from "react";
import { Trans, useTranslation } from "react-i18next";
import RedirectIcon from "../../../../assets/tsx/icons/RedirectIcon";
import { Button } from "../../../shared/Button/Button";
import styles from "./Setting360DialogTemplates.module.css";
import redirectIconStyles from "../../../shared/RedirectIcon.module.css";
import { TemplatesFiltered } from "./TemplatesFiltered/TemplatesFiltered";

export default function Setting360DialogTemplates(props: {
  isCloudAPI: boolean;
  channelId: number;
  wabaId?: string;
  facebookId?: string;
}) {
  const { t } = useTranslation();
  const { isCloudAPI, wabaId, facebookId } = props;
  return (
    <>
      <div className={styles.container}>
        <div className={styles.header}>
          {t("settings.templates.360Dialog.header")}
        </div>
        <div className={styles.content}>
          {isCloudAPI
            ? t("settings.templates.cloudAPI.content")
            : t("settings.templates.360Dialog.content")}
        </div>
        <a
          className={styles.button}
          rel="noopener noreferrer"
          target="_blank"
          href={
            isCloudAPI
              ? `https://business.facebook.com/wa/manage/message-templates/?business_id=${facebookId}&waba_id=${wabaId}`
              : "https://hub.360dialog.com/auth/login"
          }
        >
          <Button customSize="mid" primary>
            {isCloudAPI
              ? t("settings.templates.cloudAPI.button.redirectHub")
              : t("settings.templates.360Dialog.button.redirectHub")}{" "}
            <RedirectIcon
              className={`${styles.redirectIcon} ${redirectIconStyles.redirectIcon}`}
            />
          </Button>
        </a>
        <div className={styles.reminder}>
          <GuideLink isCloudAPI={isCloudAPI} />
        </div>
      </div>
      {!props.isCloudAPI && (
        <div className={styles.container}>
          <div className={styles.templates}>
            <TemplatesFiltered channelId={props.channelId} />
          </div>
        </div>
      )}
    </>
  );
}

function GuideLink(props: { isCloudAPI: boolean }) {
  const { t } = useTranslation();
  const prefix = props.isCloudAPI
    ? t("settings.templates.cloudAPI.note")
    : t("settings.templates.360Dialog.note");
  return (
    <>
      {prefix}
      <a
        target="_blank"
        className={`${styles.link} ${redirectIconStyles.headerClickArea}`}
        rel="noopener noreferrer"
        href={
          props.isCloudAPI
            ? "https://docs.sleekflow.io/messaging-channels/whatsapp-bsp/manage-templates"
            : "https://docs.sleekflow.io/messaging-channels/360dialog-whatsapp/manage-templates"
        }
      >
        {t("settings.templates.checkGuide")}
        <RedirectIcon
          className={`${styles.redirectIcon} ${redirectIconStyles.redirectIcon}`}
        />
      </a>
    </>
  );
}
