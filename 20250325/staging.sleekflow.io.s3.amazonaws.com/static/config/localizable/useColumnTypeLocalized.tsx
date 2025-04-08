import { useTranslation } from "react-i18next";

export default function useColumnTypeLocalized() {
  const { t } = useTranslation();

  return {
    customFieldTypeList: {
      singlelinetext: t("profile.customField.type.singleLine"),
      multilinetext: t("profile.customField.type.multiLine"),
      number: t("profile.customField.type.number"),
      phonenumber: t("profile.customField.type.phoneNumber"),
      email: t("profile.customField.type.email"),
      options: t("profile.customField.type.options"),
      datetime: t("profile.customField.type.dateTime"),
      boolean: t("profile.customField.type.boolean"),
      travisuser: t("profile.customField.type.travisUser"),
      channel: t("profile.customField.type.channel"),
      date: t("profile.customField.type.date"),
    },
  };
}
