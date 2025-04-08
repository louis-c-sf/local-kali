import { FormikHelpers, FormikState } from "formik";
import { Dropdown, Form } from "semantic-ui-react";
import { isEmail } from "../../Contact/Individual/ProfileContentNote";
import React from "react";
import { InviteFormType } from "../AddUserModal";
import { useTranslation } from "react-i18next";

export function EmailsInput(props: {
  form: FormikState<InviteFormType> & FormikHelpers<InviteFormType>;
}) {
  const { form } = props;
  const emailOptions = form.values.emails.map((email, index) => {
    return { value: email, key: index, text: email };
  });
  const { t } = useTranslation();

  return (
    <Form.Input
      label={`${t("settings.user.modal.add.field.email.label")}:`}
      error={form.errors.emails}
    >
      <Dropdown
        upward={false}
        scrolling
        selection
        multiple
        allowAdditions
        fluid
        options={emailOptions}
        value={form.values.emails}
        search
        placeholder={t("settings.user.modal.add.field.email.placeholder")}
        noResultsMessage={t("form.field.dropdown.noResults")}
        icon={false}
        onAddItem={(event, { value }) => {
          const email = (value as string).trim();
          if (!isEmail(email)) {
            return;
          }
          form.setFieldValue("emails", [
            ...new Set([...form.values.emails, value]),
          ]);
          form.setErrors({});
        }}
        onChange={(event, { value }) => {
          form.setFieldValue("emails", [...new Set(value as string[])]);
          form.setErrors({});
        }}
      />
    </Form.Input>
  );
}
