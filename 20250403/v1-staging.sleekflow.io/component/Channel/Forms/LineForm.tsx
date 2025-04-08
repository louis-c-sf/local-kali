import React from "react";
import { CopyField } from "../CopyField";
import { LineFormInputType } from "../ChannelSelection";
import { useTranslation } from "react-i18next";

interface LineFormProps {
  webhookUrl: string;
  errMsgList: {};
  formInput: LineFormInputType;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function LineForm(props: LineFormProps) {
  const { t } = useTranslation();
  return (
    <div className={"channel-setup channel-setup_line"}>
      <CopyField
        text={props.webhookUrl}
        label={t("channels.form.line.field.webhookUrl.label")}
        long={false}
        masked
      />

      <label>
        {t("channels.form.line.field.name.label")}
        {props.errMsgList && props.errMsgList["name"] && (
          <div className="error">{props.errMsgList["name"]}</div>
        )}
      </label>
      <div className="ui input formInput">
        <input
          id="name"
          value={props.formInput["name"]}
          type="text"
          onChange={props.onChange}
        />
      </div>

      <label>
        {t("channels.form.line.field.id.label")}
        {props.errMsgList && props.errMsgList["basicId"] && (
          <div className="error">{props.errMsgList["basicId"]}</div>
        )}
      </label>
      <div className="ui input formInput">
        <input
          id="basicId"
          value={props.formInput["basicId"]}
          type="text"
          onChange={props.onChange}
        />
      </div>

      <label>
        {t("channels.form.line.field.channelId.label")}
        {props.errMsgList && props.errMsgList["channelId"] && (
          <div className="error">{props.errMsgList["channelId"]}</div>
        )}
      </label>
      <div className="ui input formInput">
        <input
          id="channelId"
          value={props.formInput["channelId"]}
          type="text"
          onChange={props.onChange}
        />
      </div>

      <label>
        {t("channels.form.line.field.channelSecret.label")}
        {props.errMsgList && props.errMsgList["channelSecret"] && (
          <div className="error">{props.errMsgList["channelSecret"]}</div>
        )}
      </label>
      <div className="ui input formInput lastInput">
        <input
          id="channelSecret"
          value={props.formInput["channelSecret"]}
          type="text"
          onChange={props.onChange}
        />
      </div>
    </div>
  );
}
