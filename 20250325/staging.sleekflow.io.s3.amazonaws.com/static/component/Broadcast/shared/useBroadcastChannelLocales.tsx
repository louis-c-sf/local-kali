import ArrowRight from "../ArrowRight";
import { Trans, useTranslation } from "react-i18next";
import React from "react";
import useRouteConfig from "../../../config/useRouteConfig";

export function useBroadcastChannelLocales(props: { readOnly: boolean }) {
  const { readOnly } = props;
  const { t } = useTranslation();
  const { routeTo } = useRouteConfig();

  const getChannelHeader = (channelName: string) => {
    switch (channelName.toLowerCase()) {
      case "whatsapp360dialog":
      case "twilio_whatsapp":
      case "whatsappcloudapi":
        return {
          header: t("broadcast.edit.header.twilioWhatsapp.title"),
          subHeader: t("broadcast.edit.header.twilioWhatsapp.subHeader"),
          characterLimit: t(
            "broadcast.edit.header.twilioWhatsapp.characterLimit"
          ),
          warning: (
            <div className="content">
              <div className="paragraph">
                {t("broadcast.edit.header.twilioWhatsapp.warning1")}
              </div>
              {!readOnly && (
                <div className="paragraph">
                  <a
                    className="link"
                    target="_blank"
                    rel="noopener noreferrer"
                    href={
                      channelName.toLowerCase() === "twilio_whatsapp"
                        ? routeTo("/settings/templates/create", true)
                        : routeTo("/settings/templates", true)
                    }
                  >
                    {t("broadcast.edit.header.twilioWhatsapp.warning2")}
                    <ArrowRight />
                  </a>
                </div>
              )}
              {channelName === "twilio_whatsapp" && (
                <div className="paragraph">
                  <a
                    target="_blank"
                    className="link"
                    rel="noopener noreferrer"
                    href={routeTo("/settings/opt-in")}
                  >
                    {t("broadcast.edit.header.twilioWhatsapp.warning3")}
                    <ArrowRight />
                  </a>
                </div>
              )}
            </div>
          ),
        };
      case "viber":
        return {
          header: t("broadcast.edit.header.viber.title"),
          subHeader: t("broadcast.edit.header.viber.subHeader"),
          characterLimit: t("broadcast.edit.header.viber.characterLimit"),
        };
      case "telegram":
        return {
          header: t("broadcast.edit.header.telegram.title"),
          subHeader: t("broadcast.edit.header.telegram.subHeader"),
          characterLimit: t("broadcast.edit.header.telegram.characterLimit"),
        };
      case "whatsapp":
        return {
          header: t("broadcast.edit.header.whatsapp.title"),
          subHeader: t("broadcast.edit.header.whatsapp.subHeader"),
        };
      case "line":
        return {
          header: t("broadcast.edit.header.line.title"),
          subHeader: t("broadcast.edit.header.line.subHeader"),
          characterLimit: t("broadcast.edit.header.line.characterLimit"),
        };
      case "sms":
        return {
          header: t("broadcast.edit.header.sms.title"),
          subHeader: t("broadcast.edit.header.sms.subHeader"),
          characterLimit: t("broadcast.edit.header.sms.characterLimit"),
          warning: (
            <div className="content">
              <div className="paragraph">
                {t("broadcast.edit.header.sms.messageWarning1")}
              </div>
              <div className="paragraph">
                {t("broadcast.edit.header.sms.messageWarning2")}
              </div>
              <div className="paragraph">
                <Trans i18nKey="broadcast.edit.header.sms.messageWarning3">
                  Please refer to
                  <a
                    target="_blank"
                    className="link"
                    rel="noopener noreferrer"
                    href="https://www.twilio.com/docs/glossary/what-sms-character-limit"
                  >
                    SMS Character Limit on Twilio
                  </a>
                  for more details
                </Trans>
              </div>
            </div>
          ),
        };
      case "facebook":
        return {
          header: t("broadcast.edit.header.facebook.title"),
          subHeader: t("broadcast.edit.header.facebook.subHeader"),
        };
      case "wechat":
        return {
          header: t("broadcast.edit.header.wechat.title"),
          subHeader: t("broadcast.edit.header.wechat.subHeader"),
          warning: (
            <div className="content">
              <div className="paragraph">
                {t("broadcast.edit.header.wechat.messageWarning1")}
              </div>
              <div className="paragraph">
                <Trans i18nKey="broadcast.edit.header.wechat.messageWarning2">
                  <b>Note:</b> You must include
                  <b>one images and cannot include </b>
                </Trans>
              </div>
            </div>
          ),
        };
      case "instagram":
        return {
          header: t("broadcast.edit.header.instagram.title"),
          subHeader: t("broadcast.edit.header.instagram.subHeader"),
        };
      case "note":
        return {
          header: t("broadcast.edit.header.note.title"),
          subHeader: t("broadcast.edit.header.note.subHeader"),
          warning: (
            <div className="content">
              <div className="paragraph">
                {t("broadcast.edit.header.note.messageWarning1")}
              </div>
              <div className="paragraph">
                {t("broadcast.edit.header.note.messageWarning2")}
              </div>
            </div>
          ),
        };
      default:
        return {
          header: t("broadcast.edit.header.twilioWhatsapp.title"),
          subHeader: t("broadcast.edit.header.twilioWhatsapp.subHeader"),
          characterLimit: t(
            "broadcast.edit.header.twilioWhatsapp.characterLimit"
          ),
          warning: (
            <div className="content">
              <div className="paragraph">
                {t("broadcast.edit.header.twilioWhatsapp.warning1")}
              </div>
              {!readOnly && (
                <div className="paragraph">
                  <a
                    className="link"
                    target="_blank"
                    rel="noopener noreferrer"
                    href={routeTo("/settings/templates/create")}
                  >
                    {t("broadcast.edit.header.twilioWhatsapp.warning2")}
                    <ArrowRight />
                  </a>
                </div>
              )}
              <div className="paragraph">
                <a
                  target="_blank"
                  className="link"
                  rel="noopener noreferrer"
                  href={routeTo("/settings/opt-in")}
                >
                  {t("broadcast.edit.header.twilioWhatsapp.warning3")}
                  <ArrowRight />
                </a>
              </div>
            </div>
          ),
        };
    }
  };

  return { getChannelHeader };
}
