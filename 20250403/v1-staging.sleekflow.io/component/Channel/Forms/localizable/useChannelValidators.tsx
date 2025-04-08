import { object, string } from "yup";
import { useTranslation } from "react-i18next";

export function useChannelValidators() {
  const { t } = useTranslation();
  return {
    lineValidator: object().shape({
      name: string()
        .ensure()
        .trim()
        .required(t("channels.form.line.field.name.error.required")),
      basicId: string()
        .ensure()
        .trim()
        .required(t("channels.form.line.field.id.error.required")),
      channelId: string()
        .ensure()
        .trim()
        .required(t("channels.form.line.field.channelId.error.required")),
      channelSecret: string()
        .ensure()
        .trim()
        .required(t("channels.form.line.field.channelSecret.error.required")),
    }),
    wechatValidator: object().shape({
      name: string()
        .ensure()
        .trim()
        .required(t("channels.form.wechat.field.name.error.required")),
      appId: string()
        .ensure()
        .trim()
        .required(t("channels.form.wechat.field.appId.error.required")),
      appSecret: string()
        .ensure()
        .trim()
        .required(t("channels.form.wechat.field.appSecret.error.required")),
    }),
    whatsappChatApiValidator: object().shape({
      name: string()
        .ensure()
        .trim()
        .required(t("channels.form.whatsapp.field.name.error.required"))
        .max(20, t("channels.form.whatsapp.field.name.error.length")),
    }),
  };
}
