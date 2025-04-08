import React from "react";
import styles from "./Body.module.css";
import { CodeBlock, nord } from "react-code-blocks";
import { ErrorMessage, useFormikContext } from "formik";
import { EditCallbackFormikType } from "./EditCallbackModal";
import { buildTemplatePayloadSample } from "../../../../../features/Whatsapp360/API/buildTemplatePayloadSample";
import { TemplateGridItemType } from "../../../../../features/Whatsapp360/components/TemplatesGrid/TemplatesGrid";
import { Input } from "semantic-ui-react";
import { InputOnChangeData } from "semantic-ui-react/dist/commonjs/elements/Input/Input";
import { FieldError } from "../../../../shared/form/FieldError";
import { useTranslation } from "react-i18next";
import { withLoop } from "../../../../../utility/array";

export function Body(props: { content: TemplateGridItemType }) {
  const { t } = useTranslation();
  const buttons = props.content.template.buttons ?? [];
  const form = useFormikContext<EditCallbackFormikType>();
  const payload = buildTemplatePayloadSample(props.content);

  function willUpdateButton(at: number) {
    return (_: any, data: InputOnChangeData) =>
      form.setFieldValue(`webhookUrls.${at}.webhookUrl`, data.value);
  }

  return (
    <div className={styles.root}>
      <div className={styles.code}>
        <CodeBlock
          text={JSON.stringify(payload, undefined, 4)}
          language={"json"}
          showLineNumbers
          theme={nord}
        />
      </div>
      <div className={styles.form}>
        <div className={"ui form"}>
          {form.values.webhookUrls.map(
            withLoop((value, idx, _, loop) => {
              const button = buttons[value.buttonIndex];
              if (!button) {
                return null;
              }

              return (
                <div
                  className={`${styles.entry} ${
                    loop.isLast ? styles.last : ""
                  }`}
                  key={value.buttonIndex}
                >
                  <div className={styles.label}>
                    {t("settings.templates.whatsapp360.callbackEdit.button", {
                      num: idx + 1,
                    })}
                  </div>
                  <div className={styles.row} key={`name_${value.buttonIndex}`}>
                    <Input type={"text"} disabled fluid value={button.text} />
                  </div>
                  <div className={styles.label}>
                    {t(
                      "settings.templates.whatsapp360.callbackEdit.webhookUrl"
                    )}
                  </div>
                  <div
                    className={`${styles.row} ${styles.last}`}
                    key={`value_${value.buttonIndex}`}
                  >
                    <Input
                      type={"text"}
                      fluid
                      value={value.webhookUrl}
                      onChange={willUpdateButton(value.buttonIndex)}
                    />
                    <ErrorMessage
                      name={`webhookUrls.${value.buttonIndex}.webhookUrl`}
                      render={(errorMessage) => (
                        <FieldError text={errorMessage} />
                      )}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
