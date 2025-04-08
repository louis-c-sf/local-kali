import React from "react";
import { FieldArray, useFormikContext } from "formik";
import { useTranslation } from "react-i18next";
import {
  initialValues,
  InteractiveMessageValues,
} from "../InteractiveMessageSchema";
import { Form } from "semantic-ui-react";
import ListSections from "./ListSections";
import WordCountInput from "component/shared/input/WordCountInput/WordCountInput";
import styles from "./ListMessageSettings.module.css";

export default function ListMessageSettings() {
  const { t } = useTranslation();
  const { values, setFieldValue } =
    useFormikContext<InteractiveMessageValues>();

  // Initialize field on mount and remove it on cleanup
  React.useEffect(() => {
    if (!values.listMessage) {
      setFieldValue("listMessage", initialValues.listMessage);
    }

    return () => {
      setFieldValue("listMessage", undefined);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <Form.Field>
        <label>
          {t("form.interactiveMessage.field.listMessage.listTitle.label")}
        </label>
        <WordCountInput
          value={values.listMessage?.title || ""}
          onChange={(value) => setFieldValue("listMessage.title", value)}
        />
        <p className={styles.titleDescription}>
          {t("form.interactiveMessage.field.listMessage.listTitle.description")}
        </p>
      </Form.Field>
      <div className={styles.optionSectionWrapper}>
        <p>{t("form.interactiveMessage.field.listMessage.selectOptions")}</p>
        <FieldArray name="listMessage.sections">
          {(arrayHelpers) => <ListSections {...arrayHelpers} />}
        </FieldArray>
      </div>
    </div>
  );
}
