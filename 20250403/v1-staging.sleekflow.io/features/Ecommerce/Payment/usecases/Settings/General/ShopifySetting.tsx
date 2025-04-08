import React from "react";
import mainStyles from "./GeneralTab.module.css";
import { useTranslation } from "react-i18next";
import { ToggleInput } from "component/shared/input/ToggleInput";
import { useFormikContext } from "formik";
import { SleekPaySettingsFormValues } from "./models/SleekPaySettingsFormSchema";

export default function ShopifySetting() {
  const { t } = useTranslation();
  const { values, setFieldValue } =
    useFormikContext<SleekPaySettingsFormValues>();

  return (
    <div className={mainStyles.sectionContainer}>
      <p className={mainStyles.sectionTitle}>
        {t("settings.paymentLink.general.discountEnabled.title")}
      </p>
      <p className={mainStyles.description}>
        {t("settings.paymentLink.general.discountEnabled.description")}
      </p>
      <ToggleInput
        on={values.isShopifyDiscountEnable}
        labelOn={t("settings.paymentLink.general.discountEnabled.toggle.on")}
        labelOff={t("settings.paymentLink.general.discountEnabled.toggle.off")}
        onChange={(c) => setFieldValue("isShopifyDiscountEnable", c)}
      />
    </div>
  );
}
