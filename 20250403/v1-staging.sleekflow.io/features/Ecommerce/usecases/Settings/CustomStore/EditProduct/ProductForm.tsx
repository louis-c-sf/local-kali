import React, { useState, useEffect } from "react";
import styles from "./ProductForm.module.css";
import { ProductFormikType } from "./useProductForm";
import { useTranslation } from "react-i18next";
import { TabMenu } from "component/shared/nav/TabMenu";
import { useLanguageChoices } from "features/Ecommerce/components/useLanguageChoices";
import { MenuItemProps } from "semantic-ui-react/src/collections/Menu/MenuItem";
import { DropdownItemProps } from "semantic-ui-react";
import { FieldError } from "component/shared/form/FieldError";
import { CurrencyInput } from "component/shared/form/CurrencyInput";
import { toFloat } from "utility/string";
import { UploadImageInput } from "features/Ecommerce/components/UploadImageInput/UploadImageInput";
import { useDisableControls } from "core/components/DisableControls/DisableControls";
import { Icon } from "component/shared/Icon/Icon";
import { TextareaCounted } from "component/shared/form/TextareaCounted/TextareaCounted";
import { ProductType } from "core/models/Ecommerce/Catalog/ProductType";
import { useUploadCommerceHubBlob } from "features/Ecommerce/components/useUploadCommerceHubBlob";

export function ProductForm(props: {
  containerClass: string;
  form: ProductFormikType;
  languages: string[];
  prototypeData: ProductType | null;
  storeId: string;
}) {
  const { form } = props;
  const { t } = useTranslation();
  const languageChoices = useLanguageChoices();
  const disableControls = useDisableControls();
  const upload = useUploadCommerceHubBlob("Image");
  const [uploading, setUploading] = useState(false);
  const [fileUploaded, setFileUploaded] = useState<File | null>(null);

  const [languageActive, setLanguageActive] = useState<string>();

  const choicesAvailable = props.languages.reduce<DropdownItemProps[]>(
    (acc, next) => {
      const match = languageChoices.choices.find((ch) => ch.value === next);
      if (!match) {
        return acc;
      }
      const hasError =
        next !== languageActive &&
        (getNameLangError(next) || getDescrLangError(next));
      return [
        ...acc,
        {
          ...match,
          content: (
            <>
              {match.text}{" "}
              {hasError && (
                <span className={styles.error}>
                  <Icon type={"errorCircle"} />
                </span>
              )}
            </>
          ),
        },
      ];
    },
    []
  );

  const nameLanguageIdx = getNameLanguageIdx(languageActive);
  const descLanguageIdx = getDescrLanguageIdx(languageActive);
  const nameValue =
    nameLanguageIdx > -1 ? form.values.names[nameLanguageIdx]?.value : "";

  const updateText =
    (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      form.setFieldValue(field, event.target.value);
    };

  const descriptionValue = form.values.descriptions[descLanguageIdx]?.text;

  const nameError = getNameLangError(languageActive);
  const descriptionError = getDescrLangError(languageActive);

  const updateDescription = (value: string) => {
    form.setFieldValue(`descriptions.${descLanguageIdx}.text.value`, value);
  };

  function updatePrice(idx: number) {
    return (val: string) => {
      form.setFieldValue(`prices.${idx}.amount`, toFloat(val) ?? 0);
    };
  }

  const chooseLanguage = (_: any, data: MenuItemProps) => {
    setLanguageActive(
      (choicesAvailable[data.index as number]?.value as string) ?? "en"
    );
  };

  function getNameLangError(lang: string | undefined) {
    if (!lang) {
      return;
    }
    const idx = getNameLanguageIdx(lang);
    return (form.errors.names as any[])?.[idx]?.value;
  }

  function getDescrLangError(lang: string | undefined) {
    if (!lang) {
      return;
    }
    const idx = getDescrLanguageIdx(lang);
    return (form.errors.descriptions as any[])?.[idx]?.text?.value;
  }

  function getNameLanguageIdx(lang: string | undefined) {
    return lang
      ? form.values.names.findIndex((name) => name.language_iso_code === lang)
      : -1;
  }

  function getDescrLanguageIdx(lang: string | undefined) {
    return lang
      ? form.values.descriptions.findIndex(
          (d) => d.text.language_iso_code === lang
        )
      : -1;
  }

  useEffect(() => {
    setLanguageActive(props.languages[0]);
  }, [props.languages.join()]);

  const uploadNewImage = async (file: File) => {
    setUploading(true);
    setFileUploaded(file);
    try {
      const blobName = await upload.upload(file, props.storeId);
      form.setFieldValue("uploadedImageBlobName", blobName);
      form.setFieldValue("uploadedImageUrl", null);
    } catch (e) {
      console.error(e, { file });
    } finally {
      setUploading(false);
    }
  };

  const addFromUrl = async (url: string) => {
    form.setFieldValue("uploadedImageUrl", url);
    form.setFieldValue("uploadedImageBlobName", null);
    form.setFieldValue("deleteImage", false);
    setFileUploaded(null);
  };

  const deleteImage = () => {
    setFileUploaded(null);
    form.setFieldValue("uploadedImageUrl", null);
    form.setFieldValue("uploadedImageBlobName", null);
    form.setFieldValue("deleteImage", true);
  };

  const setUploadError = () => {
    form.setFieldError(
      "uploadedImageUrl",
      t("settings.commerce.addProduct.error.file.format")
    );
  };

  const imagePreviewSrc =
    form.values.uploadedImageUrl ??
    props.prototypeData?.images?.[0]?.image_url ??
    undefined;

  return (
    <div className={`ui form ${styles.form}`}>
      <div className={props.containerClass}>
        <div className={styles.descriptionGrid}>
          <div className={styles.image}>
            <div className={styles.groupLabel}>
              {t("settings.commerce.addProduct.fieldGroup.image")}
            </div>
            <UploadImageInput
              onUpload={uploadNewImage}
              onError={setUploadError}
              error={form.errors.uploadedImageUrl}
              src={!form.values.deleteImage ? imagePreviewSrc : undefined}
              uploaded={fileUploaded}
              onAddFromUrl={addFromUrl}
              uploading={uploading}
              onDelete={deleteImage}
            />
          </div>
          <div className={styles.name}>
            <div className={styles.groupLabel}>
              {t("settings.commerce.addProduct.fieldGroup.description")}
            </div>
            <TabMenu
              items={choicesAvailable}
              activeIndex={props.languages.findIndex(
                (lang) => lang === languageActive
              )}
              onItemClick={chooseLanguage}
              className={`${styles.tabs} ${
                disableControls.disabled ? styles.disabled : ""
              }`}
            />
            <div className="field">
              <label>
                {t("settings.commerce.addProduct.field.name.label")}*
              </label>
              <input
                type={"text"}
                value={nameValue}
                disabled={disableControls.disabled}
                onChange={updateText(`names.${nameLanguageIdx}.value`)}
                placeholder={t(
                  "settings.commerce.addProduct.field.name.placeholder"
                )}
              />
              {nameError && <FieldError text={nameError} />}
            </div>
          </div>
          <div className={styles.description}>
            <div className="field">
              <label>
                {t("settings.commerce.addProduct.field.description.label")}*
              </label>
              <TextareaCounted
                value={descriptionValue?.value ?? ""}
                onChange={updateDescription}
                disabled={disableControls.disabled}
                max={1024}
                placeholder={t(
                  "settings.commerce.addProduct.field.description.placeholder"
                )}
              />
              {descriptionError && <FieldError text={descriptionError} />}
            </div>
          </div>
        </div>
      </div>

      <div className={props.containerClass}>
        <div className={styles.groupLabel}>
          {t("settings.commerce.addProduct.fieldGroup.price")}
        </div>
        <div className={styles.halfGrid}>
          {form.values.prices.map((price, idx) => {
            const label = price.currency_iso_code;
            const error = (form.errors.prices as any[])?.[idx]?.amount;
            return (
              <div className={"field"} key={price.currency_iso_code}>
                <label>{label}</label>
                <CurrencyInput
                  value={price.amount.toFixed(2)}
                  disabled={disableControls.disabled}
                  onChange={updatePrice(idx)}
                />
                {error && <FieldError text={error} />}
              </div>
            );
          })}
        </div>
      </div>

      <div className={props.containerClass}>
        <div className={styles.groupLabel}>
          {t("settings.commerce.addProduct.fieldGroup.addInfo")}
        </div>
        <div className="field">
          <label>{t("settings.commerce.addProduct.field.sku.label")}</label>
          <input
            type={"text"}
            value={form.values.sku}
            disabled={disableControls.disabled}
            onChange={updateText("sku")}
            placeholder={t(
              "settings.commerce.addProduct.field.sku.placeholder"
            )}
          />
          {form.errors.sku && <FieldError text={form.errors.sku} />}
        </div>
        <div className="field">
          <label>{t("settings.commerce.addProduct.field.url.label")}</label>
          <input
            type={"text"}
            value={form.values.url ?? ""}
            disabled={disableControls.disabled}
            onChange={updateText("url")}
            placeholder={t(
              "settings.commerce.addProduct.field.url.placeholder"
            )}
          />
          {form.errors.url && <FieldError text={form.errors.url} />}
        </div>
      </div>
    </div>
  );
}
