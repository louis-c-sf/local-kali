import React from "react";
import { useTranslation } from "react-i18next";
import { Button, Divider, Header } from "semantic-ui-react";
import TickIcon from "../../../assets/tsx/icons/TickIcon";
import styles from "./InActivatedHint.module.css";
import settingStyles from "../Setting.module.css";
import { getWhatsAppSupportUrl } from "../../../utility/getWhatsAppSupportUrl";

export const InActivatedHint = () => {
  const { t } = useTranslation();
  const url = getWhatsAppSupportUrl(
    "Hello, I would like to activate WhatsApp QR Code setting"
  );
  const listMapping = [
    { content: t("settings.whatsappQrCode.inActivated.list.quickly") },
    { content: t("settings.whatsappQrCode.inActivated.list.intelligent") },
    { content: t("settings.whatsappQrCode.inActivated.list.automate") },
    { content: t("settings.whatsappQrCode.inActivated.list.consistency") },
  ];
  const handleContact = () => {
    window.open(url, "settingWhatsappQrCode");
  };

  return (
    <div className={settingStyles.content}>
      <div className={settingStyles.container}>
        <div className={settingStyles.header}>
          <Header as="h4" content={t("settings.whatsappQrCode.header")} />
        </div>
        <Divider />
        <div className={styles.centerContainer}>
          <div className={styles.contentInfo}>
            <div className={styles.title}>
              {t("settings.whatsappQrCode.inActivated.title")}
            </div>
            <div className={styles.description}>
              {t("settings.whatsappQrCode.inActivated.description")}
            </div>
            <ul>
              {listMapping.map((row) => (
                <li>
                  <TickIcon />
                  {row.content}
                </li>
              ))}
            </ul>
            <div>
              <Button primary size="medium" onClick={handleContact}>
                {t("settings.whatsappQrCode.inActivated.button.contact")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
