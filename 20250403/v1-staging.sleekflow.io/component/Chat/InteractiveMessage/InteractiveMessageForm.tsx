import React from "react";
import { useTranslation } from "react-i18next";
import { Dropdown, Form, FormField } from "semantic-ui-react";
import { Formik, FormikHelpers } from "formik";
import {
  ButtonType,
  generateSchema,
  getButtonTypeSettings,
  InteractiveMessageValues,
  MESSAGE_MAX_LENGTH,
} from "./InteractiveMessageSchema";
import InteractiveMessagePreview from "./InteractiveMessagePreview";
import QuickReplySettings from "./QuickReplySettings";
import ListMessageSettings from "./ListMessageSettings/ListMessageSettings";
import { Button } from "component/shared/Button/Button";
import styles from "./InteractiveMessageForm.module.css";
import { useAppDispatch, useAppSelector } from "AppRootContext";
import { equals } from "ramda";

export default function InteractiveMessageForm({
  onSubmit,
  values,
}: {
  onSubmit: (values: InteractiveMessageValues) => void;
  values?: InteractiveMessageValues;
}) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const messageDraft = useAppSelector((s) => {
    return s.inbox.messageDrafts.find(
      (d) => d.conversationId === s.profile.conversationId
    )?.text;
  }, equals);
  const schema = generateSchema(t);
  const { options, descriptions } = getButtonTypeSettings(t);

  function onFormSubmit(
    values: InteractiveMessageValues,
    { setSubmitting }: FormikHelpers<InteractiveMessageValues>
  ) {
    setSubmitting(false);
    onSubmit(values);
  }

  return (
    <Formik
      initialValues={values ?? { buttonType: "quickReplies" }}
      onSubmit={onFormSubmit}
      validationSchema={schema}
      enableReinitialize
    >
      {({ values, setFieldValue, submitForm, errors }) => {
        const hasErrors = Object.keys(errors).length > 0;

        return (
          <>
            <div className={styles.form}>
              <Form className={styles.formWrapper}>
                <Form.Field>
                  <label>
                    {t("form.interactiveMessage.field.buttonType.label")}
                  </label>
                  <Dropdown
                    selection
                    closeOnBlur
                    selectOnBlur={false}
                    options={options}
                    value={values.buttonType}
                    onChange={(_, data) => {
                      setFieldValue("buttonType", data.value as string);
                    }}
                  />
                  <p className={styles.buttonTypeDescription}>
                    {descriptions[values.buttonType]}
                  </p>
                </Form.Field>

                <FormField>
                  <label>{t("chat.search.header.message")}</label>
                  <textarea
                    placeholder={t("chat.form.send.placeholder.message")}
                    className="ui input text-content"
                    value={messageDraft}
                    onInput={(e) => {
                      dispatch({
                        type: "INBOX.MESSENGER.UPDATE_REPLY_TEXT",
                        text: e.currentTarget.value,
                      });
                    }}
                  />
                  <span className={styles.counter}>
                    {messageDraft?.length ?? 0}/{MESSAGE_MAX_LENGTH}
                  </span>
                </FormField>

                {values.buttonType === ButtonType.QUICK_REPLY && (
                  <QuickReplySettings />
                )}
                {values.buttonType === ButtonType.LIST_MESSAGE && (
                  <ListMessageSettings />
                )}
              </Form>
              <InteractiveMessagePreview formValues={values} />
            </div>
            <div className={styles.submitContainer}>
              <Button primary onClick={submitForm} disabled={hasErrors}>
                {t("form.button.submit")}
              </Button>
            </div>
          </>
        );
      }}
    </Formik>
  );
}
