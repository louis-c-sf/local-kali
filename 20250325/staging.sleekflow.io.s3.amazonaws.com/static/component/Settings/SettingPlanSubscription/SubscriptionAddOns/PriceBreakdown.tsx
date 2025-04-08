import React from "react";
import styles from "./PriceBreakdown.module.css";
import { Trans, useTranslation } from "react-i18next";
import { formatQuotaValues } from "../SettingPlanUtils";

const PriceBreakdown = ({
  currency,
  planPrice,
  totalPrice,
  pricePerLabel,
}: {
  pricePerLabel: string;
  currency: string;
  planPrice: number | string;
  totalPrice: number;
}) => {
  const { t } = useTranslation();
  return (
    <div className={styles.priceBreakdownWrapper}>
      <div className={styles.planPriceWrapper}>
        <div className={styles.planLabel}>{pricePerLabel}</div>
        <div className={styles.pricePerLabel}>
          <Trans
            i18nKey={"settings.plan.priceLabel"}
            values={{ price: planPrice, currency }}
          >
            <span>month</span>
          </Trans>
        </div>
      </div>
      <div className={styles.priceTotalWrapper}>
        <div className={styles.planLabel}>
          {t("settings.plan.addOn.editAddOnPage.total")}
        </div>
        <div className={styles.pricePerLabel}>
          {`${currency} ${totalPrice > 0 ? formatQuotaValues(totalPrice) : 0}`}
        </div>
      </div>
    </div>
  );
};

export default PriceBreakdown;
