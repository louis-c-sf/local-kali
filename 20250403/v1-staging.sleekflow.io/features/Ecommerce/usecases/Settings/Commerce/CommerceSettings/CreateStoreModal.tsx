import React, { useEffect, useState } from "react";
import styles from "./CreateStoreModal.module.css";
import { Modal, Icon, Dropdown } from "semantic-ui-react";
import { Icon as CoreIcon } from "component/shared/Icon/Icon";
import { useTranslation } from "react-i18next";
import * as yup from "yup";
import { FieldError } from "component/shared/form/FieldError";
import { Button } from "component/shared/Button/Button";
import { useLanguageChoices } from "../../../../components/useLanguageChoices";
import { useFormikDecorated } from "core/components/Form/useFormikDecorated";
import { MAX_LANGUAGES } from "features/Ecommerce/usecases/Settings/CustomStore/EditStore/FormTab/useEditStoreForm";
import { fetchCurrencies } from "api/CommerceHub/fetchCurrencies";

export type CreateCatalogFormType = {
  name: string;
  languages: string[];
  currencies: string[];
};

export function CreateStoreModal(props: {
  onConfirm: (values: CreateCatalogFormType) => void;
  cancel: () => void;
  loading: boolean;
}) {
  const { t } = useTranslation();
  const [currenciesSupported, setCurrenciesSupported] = useState<string[]>();

  const form = useFormikDecorated<CreateCatalogFormType>({
    isInitialValid: false,
    initialValues: {
      name: "",
      languages: [],
      currencies: [],
    },
    onSubmit: props.onConfirm,
    validationSchema: yup.object({
      name: yup.string().trim().required().max(128),
      languages: yup
        .array()
        .required()
        .max(MAX_LANGUAGES, t("settings.commerce.error.language.max")),
      currencies: yup.array().required(),
    }),
  });

  const languageChoices = useLanguageChoices();
  useEffect(() => {
    fetchCurrencies()
      .then((value) => {
        setCurrenciesSupported(
          value.data.currencies.map((c) => c.currency_iso_code)
        );
      })
      .catch(console.error);
  }, []);

  const currenciesSupportedList = currenciesSupported ?? [];

  return (
    <Modal open={true} className={styles.modal}>
      <Modal.Header className={styles.header}>
        {t("settings.commerce.createStore.title")}
        <Icon name={"delete"} className={"lg"} onClick={props.cancel} />
      </Modal.Header>
      <Modal.Content>
        <div className={"form ui"}>
          <div className={"field"}>
            <label>{t("settings.commerce.createStore.field.name.label")}</label>
            <input
              type={"text"}
              value={form.values.name}
              onChange={(e) => {
                form.setFieldValue("name", e.target.value);
              }}
              placeholder={t(
                "settings.commerce.createStore.field.name.placeholder"
              )}
            />
            <div className={styles.hint}>
              {t("settings.commerce.createStore.field.name.hint")}
            </div>
            {form.errors.name && <FieldError text={form.errors.name} />}
          </div>
          <div className={"field"}>
            <label>
              {t("settings.commerce.createStore.field.languages.label")}
            </label>
            <Dropdown
              fluid
              type={"text"}
              multiple
              selection
              search={(options, value) =>
                languageChoices.choices.filter(
                  languageChoices.match(value, options)
                )
              }
              onChange={(_, data) => {
                form.setFieldValue("languages", data.value as string[]);
              }}
              value={form.values.languages}
              placeholder={t(
                "settings.commerce.createStore.field.languages.placeholder"
              )}
              options={languageChoices.choices}
            />
            <div className={styles.hint}>
              {t("settings.commerce.createStore.field.languages.hint")}
            </div>
            {form.errors.languages && (
              <FieldError text={form.errors.languages} />
            )}
          </div>
          <div className={"field last"}>
            <label>
              {t("settings.commerce.createStore.field.currencies.label")}
            </label>
            <Dropdown
              fluid
              type={"text"}
              multiple
              selection
              loading={currenciesSupported === undefined}
              search={(options, value) =>
                currenciesSupportedList
                  .filter((cur) => cur.includes(value))
                  .map((curr) => ({
                    text: curr,
                    value: curr,
                  }))
              }
              onChange={(_, data) => {
                form.setFieldValue("currencies", data.value as string[]);
              }}
              value={form.values.currencies}
              placeholder={t(
                "settings.commerce.createStore.field.currencies.placeholder"
              )}
              options={currenciesSupportedList.map((curr) => ({
                value: curr,
                text: curr.toUpperCase(),
              }))}
            />
            <div className={styles.hint}>
              {t("settings.commerce.createStore.field.currencies.hint")}
            </div>
            {form.errors.currencies && (
              <FieldError text={form.errors.currencies} />
            )}
          </div>
        </div>
      </Modal.Content>
      <Modal.Actions className={styles.actions}>
        <a
          className={styles.link}
          href={"https://docs.sleekflow.io/using-the-platform/commerce"}
          target={"_blank"}
          rel={"noopener noreferrer"}
        >
          {t("settings.commerce.createStore.learnMore")}
          <CoreIcon type={"extLinkBlue"} />
        </a>
        <Button
          onClick={form.submitForm}
          disabled={form.isSubmitDisabled}
          content={t("form.button.create")}
          primary
          loading={form.isSubmitting}
        />
      </Modal.Actions>
    </Modal>
  );
}
