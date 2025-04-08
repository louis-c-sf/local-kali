import { object, string } from "yup";
import { useValidateContact } from "../../../Contact/validation/useValidateContact";
import { useTranslation } from "react-i18next";

export function useTwilioValidator() {
  const { validatePhone } = useValidateContact();
  const { t } = useTranslation();
  return {
    twilioSmsValidator: object().shape({
      name: string()
        .ensure()
        .trim()
        .required(t("channels.form.twilio.sms.field.name.error.required")),
      accountSID: string()
        .ensure()
        .trim()
        .required(t("channels.form.twilio.sms.field.sid.error.required")),
      accountSecret: string()
        .ensure()
        .trim()
        .required(t("channels.form.twilio.sms.field.secret.error.required")),
      phoneNumber: string()
        .ensure()
        .trim()
        .required(t("channels.form.twilio.sms.field.phone.error.required"))
        .concat(validatePhone()),
    }),

    twilioWhatsAppValidator: object().shape({
      name: string()
        .ensure()
        .trim()
        .required(
          t("channels.form.twilio.whatsapp.field.phone.error.required")
        ),
      accountSID: string()
        .ensure()
        .trim()
        .required(t("channels.form.twilio.whatsapp.field.sid.error.required")),
      accountSecret: string()
        .ensure()
        .trim()
        .required(
          t("channels.form.twilio.whatsapp.field.secret.error.required")
        ),
      messagingServiceSid: string()
        .ensure()
        .trim()
        .required(
          t(
            "channels.form.twilio.whatsapp.field.messagingServiceSid.error.required"
          )
        ),
      phoneNumber: string()
        .ensure()
        .trim()
        .required(t("channels.form.twilio.whatsapp.field.phone.error.required"))
        .concat(validatePhone()),
    }),
  };
}
