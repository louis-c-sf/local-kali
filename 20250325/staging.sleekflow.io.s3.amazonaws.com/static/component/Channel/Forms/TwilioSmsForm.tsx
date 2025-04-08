import React from "react";
import PhoneNumber from "../../PhoneNumber";
import { object, string } from "yup";
import { CopyField } from "../CopyField";
import { SmsFormInputType } from "../ChannelSelection";
import { useTranslation } from "react-i18next";

export interface TwilioFormProps {
  errMsgList: {};
  formInput: SmsFormInputType;
  onChange: (id: string, value: string) => void;
}

export function TwilioSmsForm(props: TwilioFormProps) {
  const { t } = useTranslation();
  return (
    <div className={"channel-setup channel-setup_twilio-sms"}>
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
        {t("channels.form.twilio.field.phone.label")}
        {props?.errMsgList["phoneNumber"] && (
          <div className="error">{props.errMsgList["phoneNumber"]}</div>
        )}
      </label>
      <div className="ui input formInput lastInput">
        <PhoneNumber
          onChange={(_0, phone) => props.onChange("phoneNumber", phone)}
          fieldName={""}
        />
      </div>
      <CopyField
        text={"https://sleekflow-prod-api.azurewebsites.net/sms/twilio/webhook"}
        label={t("channels.form.twilio.field.webhook.label")}
        long={false}
        masked
      />
    </div>
  );
}

export const twilioSmsTransformer = object().shape({
  phoneNumber: string().transform(
    (number: string) => `+${number.replace(/\D+/, "")}`
  ),
});
