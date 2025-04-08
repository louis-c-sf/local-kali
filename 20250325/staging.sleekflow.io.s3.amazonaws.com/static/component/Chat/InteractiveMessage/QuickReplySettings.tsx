import React from "react";
import { useTranslation } from "react-i18next";
import { FieldArray, useFormikContext } from "formik";
import {
  initialValues,
  InteractiveMessageValues,
} from "./InteractiveMessageSchema";
import { Button, Form, Icon } from "semantic-ui-react";
import WordCountInput from "component/shared/input/WordCountInput/WordCountInput";
import styles from "./InteractiveMessageForm.module.css";

export default function QuickReplySettings() {
  const { t } = useTranslation();
  const { values, setFieldValue } =
    useFormikContext<InteractiveMessageValues>();

  // Initialize field on mount and remove it on cleanup
  React.useEffect(() => {
    if (!values.quickReplies) {
      setFieldValue("quickReplies", initialValues.quickReplies);
    }

    return () => {
      setFieldValue("quickReplies", undefined);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canAddMoreButtons = (values?.quickReplies?.length || 0) < 3;

  return (
    <div>
      <FieldArray name="quickReplies">
        {({ push, remove }) => {
          return (
            <div className={styles.wrapper}>
              {values.quickReplies?.map((reply, i) => (
                <Form.Field
                  key={`quickReply_${i}`}
                  className={styles.quickReplyField}
                >
                  <WordCountInput
                    value={reply}
                    placeholder={t(
                      "form.interactiveMessage.field.quickReplies.buttonText"
                    )}
                    onChange={(value) =>
                      setFieldValue(`quickReplies.${i}`, value)
                    }
                  />
                  <button
                    className={styles.closeButton}
                    onClick={() => remove(i)}
                  >
                    <Icon name="close" className="lg" />
                  </button>
                </Form.Field>
              ))}
              <Button
                className={styles.addButton}
                disabled={!canAddMoreButtons}
                onClick={() => push("")}
              >
                + {t("form.interactiveMessage.field.quickReplies.addButton")}
              </Button>
            </div>
          );
        }}
      </FieldArray>
    </div>
  );
}
