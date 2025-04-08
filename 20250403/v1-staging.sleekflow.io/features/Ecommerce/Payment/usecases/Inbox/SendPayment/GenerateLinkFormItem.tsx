import React, { ChangeEvent } from "react";
import styles from "./GenerateLinkFormItem.module.css";
import { useTranslation } from "react-i18next";
import { assoc } from "ramda";
import { FormikErrors } from "formik";
import { FieldError } from "component/shared/form/FieldError";
import { PaymentLinkType } from "core/models/Ecommerce/Payment/PaymentLinkType";
import { CurrencyInput } from "component/shared/form/CurrencyInput/CurrencyInput";
import { useSupportedRegions } from "core/models/Region/useSupportedRegions";
import { StepperInput } from "component/shared/form/StepperInput/StepperInput";
import { Icon } from "component/shared/Icon/Icon";
import { PaymentLinkFormItemType } from "features/Ecommerce/Payment/usecases/Inbox/SendPayment/contracts/PaymentFormType";
import { useSendPaymentLinkContext } from "features/Ecommerce/Payment/usecases/Inbox/SendPayment/contracts/SendPaymentLinkContext";
import { UploadDropzoneInput } from "component/Form/UploadDropzoneInput";
import { useDropzone } from "react-dropzone";
import useFilePreview from "lib/effects/useFilePreview";

export function GenerateLinkFormItem(props: {
  values: PaymentLinkFormItemType;
  errors: FormikErrors<PaymentLinkFormItemType> | undefined;
  setValues: (v: PaymentLinkFormItemType) => void;
  currency: string;
  setCurrency: (currency: string) => void;
  canRemove: boolean;
  remove: () => void;
  loading: boolean;
}) {
  const { setValues, values, canRemove, remove, loading, errors } = props;
  const { t } = useTranslation();
  const { currenciesSupported } = useSupportedRegions();
  const context = useSendPaymentLinkContext();

  const dropzone = useDropzone({
    accept: "image/png,image/jpg,image/jpeg,image/webp",
    onDropAccepted(files) {
      setValues(assoc("imageFile", files[0], values));
    },
    noDragEventsBubbling: true,
  });

  const updateInputValue =
    (fieldName: string) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValues(assoc(fieldName, e.target.value, values));
    };

  function updateValue<F extends keyof PaymentLinkFormItemType>(fieldName: F) {
    return (value: PaymentLinkFormItemType[F]) =>
      setValues(assoc(fieldName, value, values));
  }

  function getError(field: keyof PaymentLinkType) {
    if (errors && errors[field]) {
      return errors[field];
    }
  }

  const uploadPreview = useFilePreview(values.imageFile ?? undefined);
  const imgSrc = uploadPreview.src ?? values.imageUrl;
  const isImageDeletable =
    values.imageFile !== null || values.imageUrl !== null;

  function deleteImage() {
    setValues({ ...values, imageFile: null, imageUrl: null });
  }

  const hasCurrencyError = getError("currency");

  return (
    <div className={"ui form"}>
      <div
        className={`${styles.root} ${
          context.supportImageUpload ? styles.uploadable : ""
        }`}
      >
        {context.supportImageUpload && (
          <div className={styles.upload}>
            {imgSrc ? (
              <>
                <img src={imgSrc} className={styles.image} />
                {isImageDeletable && (
                  <span className={styles.close} onClick={deleteImage} />
                )}
              </>
            ) : (
              <div
                className={`
                ${styles.uploadInput}
                ${dropzone.isDragActive ? styles.drag : ""}
                `}
                {...dropzone.getRootProps()}
              >
                <span className={styles.uploadIcon} />
                Upload product image (optional)
                <input {...dropzone.getInputProps()} />
              </div>
            )}
          </div>
        )}
        <div className={styles.product}>
          <div className={styles.label}>
            {t("chat.paymentLink.generate.form.field.name.label")}
          </div>
          <textarea
            value={values.name}
            onChange={updateInputValue("name")}
            disabled={loading}
          />
          <Error error={getError("name")} outset />
        </div>
        <div className={styles.description}>
          <div className={styles.label}>
            {t("chat.paymentLink.generate.form.field.description.label")}
          </div>
          <textarea
            value={values.description}
            onChange={updateInputValue("description")}
            disabled={loading}
          />
          <Error error={getError("description")} outset />
        </div>
        <div className={styles.quantity}>
          <div className={styles.label}>
            {t("chat.paymentLink.generate.form.field.quantity.label")}
          </div>
          <StepperInput
            amount={values.quantity}
            onChange={updateValue("quantity")}
            min={1}
            max={999}
            disabled={loading}
          />
          <Error error={getError("quantity")} outset />
        </div>
        <div className={styles.amount}>
          <div className={styles.label}>
            {t("chat.paymentLink.generate.form.field.amount.label")}
          </div>
          <CurrencyInput
            currency={props.currency}
            error={hasCurrencyError}
            value={String(values.amount)}
            onValueChange={updateValue("amount")}
            currencies={currenciesSupported.map((c) => ({
              value: c.currencyCode,
              text: c.currencyCode.toUpperCase(),
            }))}
            disabled={loading}
          />
        </div>
        <div className={styles.footer}>
          <div className={styles.errors}>
            <Error error={getError("amount")} outset />
            <Error error={getError("currency")} outset />
          </div>
          {canRemove && (
            <div className={styles.buttons}>
              <div
                className={`${styles.remove} ${loading ? styles.disabled : ""}`}
                onClick={!loading ? remove : undefined}
              >
                <div className={styles.icon}>
                  <Icon type={"deleteBin"} />
                </div>
                {t("form.button.remove")}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Error(props: { error: string | undefined; outset?: boolean }) {
  const { error } = props;
  if (!error) {
    return null;
  }
  return (
    <div className={`${styles.error}`}>
      <FieldError text={error} />
    </div>
  );
}
