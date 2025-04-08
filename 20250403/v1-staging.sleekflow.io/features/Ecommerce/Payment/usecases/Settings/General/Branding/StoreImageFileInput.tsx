import React from "react";
import { Icon, Image, Input } from "semantic-ui-react";
import styles from "../Branding/StoreImageFileInput.module.css";
import { useFormikContext } from "formik";
import { SleekPaySettingsFormValues } from "../models/SleekPaySettingsFormSchema";
import { useTranslation } from "react-i18next";

export default function StoreImageFileInput() {
  const { t } = useTranslation();
  const { values, setFieldValue } =
    useFormikContext<SleekPaySettingsFormValues>();

  function loadFile(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target?.files?.length) {
      const uploadedFile = e.target.files[0];
      setFieldValue("companyLogo", uploadedFile);
    }
  }

  const imageUrl = values.companyLogo
    ? URL.createObjectURL(values.companyLogo)
    : values.companyLogoUrl
    ? values.companyLogoUrl
    : "";

  return (
    <label htmlFor="store-image" className={styles.imageLabel}>
      {!imageUrl && (
        <div className={styles.imagePlaceholder}>
          <Icon name="upload" />
        </div>
      )}

      <Input
        id="store-image"
        type="file"
        accept=".jpg, .jpeg, .png"
        onChange={loadFile}
        className={styles.fileInput}
      />

      {imageUrl && (
        <Image
          src={imageUrl}
          className={styles.previewImage}
          onLoad={() => values.companyLogo && URL.revokeObjectURL(imageUrl)}
        />
      )}
      <p>{t("settings.paymentLink.general.branding.uploadNewPhoto")}</p>
    </label>
  );
}
