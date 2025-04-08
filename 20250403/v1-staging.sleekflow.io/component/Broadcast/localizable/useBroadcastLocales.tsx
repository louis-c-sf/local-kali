import { useTranslation } from "react-i18next";

export function useBroadcastLocales() {
  const { t } = useTranslation();
  const validateFormMessage = {
    missingChannel: t("broadcast.edit.field.channel.error.missingChannel"),
    minChannel: t("broadcast.edit.field.channel.error.minChannel"),
    missingRecipients: t("broadcast.edit.field.lists.error.missingRecipients"),
    missingContent: t("broadcast.edit.field.content.error.missingContent"),
    missingVariable: t("broadcast.edit.field.content.error.missingVariable"),
    exceedWordLimit: t("broadcast.edit.field.content.error.exceedWordLimit"),
    missingFile: t("broadcast.edit.field.content.error.missingFile"),
    missingTitle: t("broadcast.edit.field.title.error.missingTitle"),
    missingFacebookOTNOption: t(
      "broadcast.edit.field.content.error.missingFacebookOTNOption"
    ),
  };
  return {
    validateFormMessage,
    scheduleOptions: [
      {
        id: 1,
        value: "immediately",
        text: t("broadcast.send.option.immediately"),
      },
      {
        id: 2,
        value: "scheduled",
        text: t("broadcast.send.option.date"),
      },
    ],
  };
}
