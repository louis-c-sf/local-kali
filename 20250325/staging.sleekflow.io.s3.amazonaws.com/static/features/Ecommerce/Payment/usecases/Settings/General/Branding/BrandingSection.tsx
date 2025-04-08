import React from "react";
import mainStyles from "../GeneralTab.module.css";
import styles from "../Branding/BrandingSection.module.css";
import ColorInput from "../Branding/ColorInput";
import { useFormikContext } from "formik";
import { SleekPaySettingsFormValues } from "../models/SleekPaySettingsFormSchema";
import { Form } from "semantic-ui-react";
import StoreImageFileInput from "../Branding/StoreImageFileInput";
import { useTranslation } from "react-i18next";

export default function BrandingSection() {
  const { t } = useTranslation();
  const { values, setFieldValue } =
    useFormikContext<SleekPaySettingsFormValues>();

  return (
    <div className={mainStyles.sectionContainer}>
      <p className={mainStyles.sectionTitle}>
        {t("settings.paymentLink.general.branding.title")}
      </p>
      <p className={mainStyles.subTitle}>
        {t("settings.paymentLink.general.branding.companyLogo")}
      </p>
      <p className={mainStyles.description}>
        {t("settings.paymentLink.general.branding.requirementMessage", {
          width: "200",
          height: "200",
          formats: "JPG, JPEG, PNG",
        })}
      </p>

      <StoreImageFileInput />

      <Form className={styles.formWrapper}>
        <Form.Field>
          <label>{t("settings.paymentLink.general.branding.brandColor")}</label>
          <ColorInput
            value={values.brandColor}
            onChange={(value) => setFieldValue("brandColor", value)}
          />
        </Form.Field>
        <Form.Field>
          <label>
            {t("settings.paymentLink.general.branding.buttonsColor")}
          </label>
          <ColorInput
            value={values.buttonsColor}
            onChange={(value) => setFieldValue("buttonsColor", value)}
          />
        </Form.Field>
      </Form>
    </div>
  );
}
