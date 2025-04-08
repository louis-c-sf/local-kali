import React from "react";
import styles from "./SendOverlay.module.css";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../../../../AppRootContext";
import { Button } from "../../../shared/Button/Button";
import { useMessengerMode } from "../../hooks/Labels/useMessengerMode";
import { useSelectWhatsappTemplateFlow } from "./useSelectWhatsappTemplateFlow";
import { WhatsApp360DialogConfigsType } from "../../../../types/CompanyType";
import { ProfileType } from "../../../../types/LoginType";
import { OptInType } from "../../../../features/Whatsapp360/models/OptInType";
import { equals } from "ramda";

function checkOptInEnabled(
  twilioOptIn: OptInType,
  profile: ProfileType,
  conversationId: string,
  companyWhatsAppConfig?: WhatsApp360DialogConfigsType[]
) {
  if (twilioOptIn.isOptInOn) {
    return true;
  }
  if (!companyWhatsAppConfig) {
    return false;
  }
  return companyWhatsAppConfig.some(
    (config) =>
      config.optInConfig !== undefined &&
      conversationId === profile.conversationId &&
      profile.whatsApp360DialogUser?.channelId === config.id
  );
}

export function SendOverlay(props: {
  editorNode: HTMLElement | null;
  conversationId: string;
}) {
  const { editorNode, conversationId } = props;
  const loginDispatch = useAppDispatch();
  const { templateMode, template, isTemplateModeRequired } =
    useSelectWhatsappTemplateFlow(conversationId);
  const { messengerMode } = useMessengerMode();
  const { t } = useTranslation();

  const isOptInEnabled = useAppSelector((s) => {
    if (s.selectedChannelFromConversation === "whatsappcloudapi") {
      const channelInstanceId =
        s.profile.whatsappCloudApiUser?.whatsappChannelPhoneNumber;
      const channelConfigMatch = s.company?.whatsappCloudApiConfigs?.find(
        (conf) => {
          return conf.whatsappPhoneNumber === channelInstanceId;
        }
      );

      return (
        s.inbox.whatsAppTemplates.optIn.data.isOptInOn ||
        channelConfigMatch?.isOptInEnable ||
        false
      );
    }
    return checkOptInEnabled(
      s.inbox.whatsAppTemplates.optIn.data,
      s.profile,
      conversationId,
      s.company?.whatsApp360DialogConfigs
    );
  }, equals);

  if (
    !isTemplateModeRequired ||
    templateMode === "type" ||
    (templateMode === "template" && template) ||
    messengerMode === "note"
  ) {
    return null;
  }

  const beginAddTemplate = () => {
    loginDispatch({
      type: "INBOX.WHATSAPP_TEMPLATE.MODE_CHANGED",
      mode: "template",
    });
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.content}>
        <Button
          customSize={"mid"}
          primary
          onClick={editorNode ? beginAddTemplate : undefined}
        >
          {t("chat.selectWhatsappTemplate.overlay.actions.add")}
        </Button>
        {isOptInEnabled && (
          <>
            <div className={styles.or}>{t("or")}</div>
            <div
              className={styles.trigger}
              onClick={() => {
                loginDispatch({
                  type: "INBOX.WHATSAPP_TEMPLATE.MODE_CHANGED",
                  mode: "type",
                });
              }}
            >
              {t("chat.selectWhatsappTemplate.overlay.actions.type")}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
