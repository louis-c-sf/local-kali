import React from "react";
import mainStyles from "../GeneralTab.module.css";
import styles from "../AccountOverview/AccountOverview.module.css";
import { formatCurrency } from "utility/string";
import { Trans, useTranslation } from "react-i18next";
import { htmlEscape } from "../../../../../../../lib/utility/htmlEscape";

export default function AccountOverview({
  volume,
  currency,
  loginUrl,
}: {
  volume?: number;
  currency?: string;
  loginUrl?: string;
}) {
  const { t } = useTranslation();

  return (
    <div className={mainStyles.sectionContainer}>
      <p className={mainStyles.sectionTitle}>
        {t("settings.paymentLink.general.overview.title")}
      </p>
      <div className={styles.weeklyBalance}>
        <p className={styles.label}>
          {t("settings.paymentLink.general.overview.weeklyBalance")}
        </p>
        <p className={styles.balance}>
          {typeof volume === "number" && currency
            ? `${currency} ${formatCurrency(volume)}`
            : "-"}
        </p>
      </div>
      {loginUrl && (
        <p className={mainStyles.description}>
          <Trans i18nKey="settings.paymentLink.general.overview.editPayment">
            To edit payout account, please
            <a
              href={htmlEscape(loginUrl)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Login to Stripe
            </a>
          </Trans>
        </p>
      )}
    </div>
  );
}
