import React from "react";
import mainStyles from "../GeneralTab.module.css";
import { useTranslation } from "react-i18next";
import styles from "../PaymentLinkExpiration/PaymentLinkExpirationSection.module.css";
import { useFormikContext } from "formik";
import { SleekPaySettingsFormValues } from "../models/SleekPaySettingsFormSchema";
import NumberFormat from "react-number-format";

export default function PaymentLinkExpirationSection() {
  const { t } = useTranslation();

  const { values, setFieldValue } =
    useFormikContext<SleekPaySettingsFormValues>();

  return (
    <div className={mainStyles.sectionContainer}>
      <p className={mainStyles.sectionTitle}>
        {t("settings.paymentLink.general.expiration.title")}
      </p>
      <p className={mainStyles.description}>
        {t("settings.paymentLink.general.expiration.description")}
      </p>
      <div className={styles.optionsWrapper}>
        <div className={styles.expirationOption}>
          <div className={styles.expireDateWrapper}>
            {t("settings.paymentLink.general.expiration.expireInDays.prefix")}
            <NumberFormat
              className={styles.daysInput}
              value={values.paymentLinkExpirationOption.expireNumberOfDaysAfter}
              onValueChange={(v) =>
                setFieldValue(
                  "paymentLinkExpirationOption.expireNumberOfDaysAfter",
                  v.floatValue
                )
              }
              displayType={"input"}
              thousandSeparator={","}
              decimalSeparator={"."}
              decimalScale={0}
              fixedDecimalScale
            />
            {t("settings.paymentLink.general.expiration.expireInDays.suffix")}
          </div>
        </div>
      </div>
    </div>
  );
}
