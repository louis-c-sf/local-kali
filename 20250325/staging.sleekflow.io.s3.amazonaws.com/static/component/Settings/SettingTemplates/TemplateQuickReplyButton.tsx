import React from "react";
import { useTranslation } from "react-i18next";
import { Form, Image } from "semantic-ui-react";
import DeleteImg from "../../../assets/images/delete-icon.svg";
import { FieldError } from "../../shared/form/FieldError";
import InputLengthCounter from "component/shared/InputLengthCounter";
import { BTN_TEXT_MAX_LENGTH } from "./Twilio/SettingTemplate";

export default function TemplateQuickReplyButton(props: {
  onClick?: (text: string) => void;
  buttonText: string;
  error?: string;
  onRemove?: () => void;
  isReadOnly: boolean;
}) {
  const { onClick, buttonText, onRemove, error, isReadOnly } = props;

  const { t } = useTranslation();
  return (
    <div className="button-container quick-reply">
      <div className="form-input">
        <Form.Field>
          <Form.Input
            disabled={isReadOnly}
            value={buttonText}
            placeholder={t(
              "settings.template.form.buttons.quickReply.button.placeholder"
            )}
            onChange={(_, data) => {
              if (data.value.length <= BTN_TEXT_MAX_LENGTH && onClick) {
                onClick(data.value);
              }
            }}
          />
          <InputLengthCounter length={buttonText.length} />
        </Form.Field>
        {!isReadOnly && onRemove && (
          <div className="image-container">
            <Image onClick={onRemove} src={DeleteImg} />
          </div>
        )}
      </div>
      {error && <FieldError text={error} />}
    </div>
  );
}
