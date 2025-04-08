import React from "react";
import PhoneNumber from "../../PhoneNumber";
import { object, string } from "yup";
import { CopyField } from "../CopyField";
import { TwilioWhatsappFormInputType } from "../ChannelSelection";
import { useTranslation } from "react-i18next";
import { useFlashMessageChannel } from "../../BannerMessage/flashBannerMessage";

interface TwilioWhatsAppFormProps {
  errMsgList: {};
  formInput: TwilioWhatsappFormInputType;
  onChange: (id: string, value: string) => void;
}

export function TwilioWhatsAppForm(props: TwilioWhatsAppFormProps) {
  const { t } = useTranslation();
  const flash = useFlashMessageChannel();

  function showBannerMessage() {
    flash(t("form.field.copy.copied"));
  }

  return (
    <div className={"channel-setup channel-setup_twilio-whatsapp"}>
      <label>
        {t("channels.form.twilio.field.name.label")}
        {props.errMsgList && props.errMsgList["name"] && (
          <div className="error">{props.errMsgList["name"]}</div>
        )}
      </label>
      <div className="ui input formInput">
        <input
          id="name"
          value={props.formInput["name"]}
          type="text"
          placeholder={t("channels.form.twilio.field.name.placeholder")}
          onChange={(e) => props.onChange(e.target.id, e.target.value)}
        />
      </div>
      <label>
        {t("channels.form.twilio.field.accountSID.label")}
        {props.errMsgList && props.errMsgList["accountSID"] && (
          <div className="error">{props.errMsgList["accountSID"]}</div>
        )}
      </label>
      <div className="ui input formInput">
        <input
          id="accountSID"
          value={props.formInput["accountSID"]}
          type="text"
          placeholder={t("channels.form.twilio.field.accountSID.placeholder")}
          onChange={(e) => props.onChange(e.target.id, e.target.value)}
        />
      </div>

      <label>
        {t("channels.form.twilio.field.accountSecret.label")}
        {props?.errMsgList["accountSecret"] && (
          <div className="error">{props.errMsgList["accountSecret"]}</div>
        )}
      </label>
      <div className="ui input formInput">
        <input
          id="accountSecret"
          value={props.formInput["accountSecret"]}
          placeholder={t(
            "channels.form.twilio.field.accountSecret.placeholder"
          )}
          type="text"
          onChange={(e) => props.onChange(e.target.id, e.target.value)}
        />
      </div>
      <label>
        {t("channels.form.twilio.field.messagingServiceSid.label")}
        {props?.errMsgList["messagingServiceSid"] && (
          <div className="error">{props.errMsgList["messagingServiceSid"]}</div>
        )}
      </label>
      <div className="ui input formInput">
        <input
          id="messagingServiceSid"
          value={props.formInput["messagingServiceSid"]}
          placeholder={t(
            "channels.form.twilio.field.messagingServiceSid.placeholder"
          )}
          type="text"
          onChange={(e) => props.onChange(e.target.id, e.target.value)}
        />
      </div>
      <label>
        {t("channels.form.twilio.field.phone.label")}
        {props?.errMsgList["phoneNumber"] && (
          <div className="error">{props.errMsgList["phoneNumber"]}</div>
        )}
      </label>
      <div className="ui input formInput lastInput">
        <PhoneNumber
          placeholder={t("channels.form.twilio.field.phone.placeholder")}
          onChange={(_0, phone, code) => props.onChange("phoneNumber", phone)}
          fieldName={""}
        />
      </div>
      <CopyField
        text={"https://api.sleekflow.io/whatsapp/twilio/webhook"}
        label={t("channels.form.twilio.field.webhook.label")}
        long={false}
        onCopy={showBannerMessage}
        masked
      />
      <CopyField
        text={"https://backup-api.sleekflow.io/whatsapp/twilio/webhook"}
        label={t("channels.form.twilio.field.fallbackURL.label")}
        long={false}
        onCopy={showBannerMessage}
        masked
      />
      <CopyField
        text={"https://api.sleekflow.io/twilio/webhook/status"}
        label={t("channels.form.twilio.field.statusCallbackURL.label")}
        long={false}
        onCopy={showBannerMessage}
        masked
      />
    </div>
  );
}

export const twilioWhatsAppTransformer = object().shape({
  phoneNumber: string().transform((number: string) => {
    return `whatsapp:+${number.replace(/\D+/, "")}`;
  }),
});
