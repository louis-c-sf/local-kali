import React from "react";
import { FieldArray, useFormikContext } from "formik";
import mainStyles from "../GeneralTab.module.css";
import styles from "../ShippingInfo/ShippingSection.module.css";
import { SleekPaySettingsFormValues } from "../models/SleekPaySettingsFormSchema";
import { ToggleInput } from "component/shared/input/ToggleInput";
import ShippingOptions from "../ShippingInfo/ShippingOptions";
import { useTranslation } from "react-i18next";

export default function ShippingSection() {
  const { t } = useTranslation();
  const { values, setFieldValue } =
    useFormikContext<SleekPaySettingsFormValues>();

  return (
    <div className={mainStyles.sectionContainer}>
      <p className={mainStyles.sectionTitle}>
        {t("settings.paymentLink.general.shipping.title")}
      </p>
      <p className={mainStyles.description}>
        {t("settings.paymentLink.general.shipping.description")}
      </p>
      <div className={styles.shippingForm}>
        <ToggleInput
          on={values.isShippingEnabled}
          labelOn={t("settings.paymentLink.general.shipping.toggle.on")}
          labelOff={t("settings.paymentLink.general.shipping.toggle.off")}
          onChange={(c) => setFieldValue("isShippingEnabled", c)}
        />
        {values.isShippingEnabled && (
          <FieldArray name="shippingOptions">
            {(arrayHelpers) => <ShippingOptions {...arrayHelpers} />}
          </FieldArray>
        )}
      </div>
    </div>
  );
}
