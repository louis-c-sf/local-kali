import React, { useState, useEffect, ChangeEvent } from "react";
import styles from "./Form.module.css";
import { CustomStoreFormType } from "../../EditStore";
import { useTranslation, Trans } from "react-i18next";
import { Dropdown, DropdownProps } from "semantic-ui-react";
import { TextareaCounted } from "component/shared/form/TextareaCounted/TextareaCounted";
import { CustomStoreFormikType } from "./useEditStoreForm";
import { ToggleInput } from "component/shared/input/ToggleInput";
import { MessagePreview } from "container/Settings/Messages/components/MessagePreview";
import { useFeaturesGuard } from "component/Settings/hooks/useFeaturesGuard";
import useRouteConfig from "config/useRouteConfig";
import { NavLink } from "react-router-dom";
import { useLanguageChoices } from "../../../../../components/useLanguageChoices";
import { normalizeLanguageDependentFields } from "./normalizeLanguageDependentFields";
import { Field } from "features/Ecommerce/components/EditStoreContainer/Field";
import { Fieldset } from "features/Ecommerce/components/EditStoreContainer/Fieldset";

export function Form(props: {
  form: CustomStoreFormikType;
  hasProducts: boolean;
  storeId: string;
}) {
  const form = props.form;
  const { t } = useTranslation();
  const featuresGuard = useFeaturesGuard();
  const { routeTo } = useRouteConfig();

  const languageChoices = useLanguageChoices();
  const [previewLang, setPreviewLang] = useState<string | null>();

  useEffect(() => {
    updateLanguageDependentField(
      form.initialValues.languages,
      form.initialValues
    );
  }, [JSON.stringify(form.initialValues)]);

  function updateLanguageDependentField(
    languages: string[],
    formValues: CustomStoreFormType
  ) {
    form.setValues(normalizeLanguageDependentFields(formValues, languages));

    if (languages.length > 0 && !languages.includes(previewLang!)) {
      setPreviewLang(languages[0]);
    }

    if (languages.length === 0) {
      setPreviewLang(null);
    }
  }

  function setLanguages(ev: any, data: DropdownProps) {
    updateLanguageDependentField(data.value as string[], form.values);
  }

  function updateMessage(idx: number) {
    return (value: string) => {
      form.setFieldValue(`sharingMessageTemplates.${idx}.message`, value);
    };
  }

  function updateName(event: ChangeEvent<HTMLInputElement>) {
    form.setFieldValue(`name`, event.target.value);
  }

  const previewTemplate = form.values.sharingMessageTemplates.find(
    (tpl) => tpl.language === previewLang
  );

  return (
    <div className={`ui form ${styles.root}`}>
      <Field
        key={"name"}
        label={t("settings.commerce.store.field.name.label")}
        hint={t("settings.commerce.store.field.name.hint")}
        error={form.errors.name}
      >
        <input
          type="text"
          value={form.values.name ?? ""}
          onChange={updateName}
        />
      </Field>

      <Field
        key={"status"}
        label={t("settings.commerce.store.field.status.label")}
        error={form.errors.active}
        checkbox
      >
        <ToggleInput
          on={form.values.active}
          labelOn={t("settings.commerce.store.active")}
          labelOff={t("settings.commerce.store.inactive")}
          onChange={(checked) => form.setFieldValue("active", checked)}
          size={"large"}
        />
      </Field>

      <Field
        key={"enablePayment"}
        label={t("settings.commerce.store.field.enablePayment.label")}
        error={form.errors.enablePayment}
        hint={
          featuresGuard.canUseStripePayments() ? (
            t("settings.commerce.store.field.enablePayment.hint.enabled")
          ) : (
            <Trans
              i18nKey={
                "settings.commerce.store.field.enablePayment.hint.disabled"
              }
            >
              <NavLink to={routeTo("/onboarding/stripe")}>
                Connect Stripe
              </NavLink>{" "}
              to enable this feature
            </Trans>
          )
        }
      >
        <ToggleInput
          on={form.values.enablePayment}
          labelOn={t("settings.commerce.store.active")}
          labelOff={t("settings.commerce.store.active")}
          onChange={(checked) => form.setFieldValue("enablePayment", checked)}
          size={"large"}
        />
      </Field>

      <Field
        key={"languages"}
        label={t("settings.commerce.store.field.languages.label")}
        hint={t("settings.commerce.store.field.languages.hint")}
        error={form.errors.languages as string}
      >
        <Dropdown
          value={form.values.languages}
          options={languageChoices.choices}
          multiple
          selection
          search
          onChange={setLanguages}
          fluid
          disabled={props.hasProducts}
        />
      </Field>

      {form.values.languages.length > 0 && (
        <>
          <Fieldset
            head={t("settings.commerce.store.messageTemplate.head")}
            subhead={t("settings.commerce.store.messageTemplate.subhead")}
          />
          <div className={styles.languagesGrid}>
            <div className={styles.messages}>
              {form.values.languages.map((lang, idx) => {
                const template = form.values.sharingMessageTemplates.find(
                  (tpl) => tpl.language === lang
                );
                if (!template) {
                  return null;
                }
                const messageLanguageIdx =
                  form.values.sharingMessageTemplates.findIndex(
                    (m) => m.language === lang
                  );
                const error = form.errors.sharingMessageTemplates?.[
                  messageLanguageIdx
                ] as {
                  message?: string;
                };
                const languageLabel =
                  languageChoices.choices.find(
                    (ch) =>
                      (ch.value as string).toLowerCase() ===
                      template.language.toLowerCase()
                  )?.text ?? template.language;

                return (
                  <Field
                    key={`template_${idx}`}
                    error={error?.message}
                    fullWidth
                    label={
                      <>
                        {t("settings.commerce.store.field.message.label")}
                        {` (${languageLabel})`}
                      </>
                    }
                  >
                    <TextareaCounted
                      onChange={updateMessage(idx)}
                      onFocus={() => setPreviewLang(lang)}
                      value={template.message}
                      max={1024}
                    />
                  </Field>
                );
              })}
            </div>
            {previewTemplate && (
              <div className={styles.preview}>
                <label className={styles.label}>
                  {t("settings.commerce.store.field.preview.label")}
                </label>
                <Dropdown
                  selection
                  fluid
                  value={previewLang ?? undefined}
                  options={languageChoices.choices.filter((ch) =>
                    form.values.languages.includes(ch.value as string)
                  )}
                  onChange={(event, data) => {
                    setPreviewLang(data.value as string);
                  }}
                />
                <MessagePreview
                  showImage={true}
                  messageBody={previewTemplate.message}
                />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
