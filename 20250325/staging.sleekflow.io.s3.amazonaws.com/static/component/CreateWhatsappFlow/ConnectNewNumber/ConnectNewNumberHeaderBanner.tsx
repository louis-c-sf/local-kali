import React from "react";
import { Trans, useTranslation } from "react-i18next";
import flowStyles from "../CreateWhatsappFlow.module.css";

export function ConnectNewNumberHeaderBanner(props: {
  currency: string;
  amount: number;
  period: string;
}) {
  const { t } = useTranslation();
  const { currency, amount, period } = props;
  return (
    <div className={flowStyles.connectionFeeContainer}>
      <div className={flowStyles.title}>
        {t("onboarding.cloudApi.connectFee.fee.header")}
      </div>
      <div className={flowStyles.connectedPrice}>
        <Trans i18nKey={"onboarding.cloudApi.connectFee.fee.price"}>
          <div className={flowStyles.price}>
            {{ currency }}
            {{ price: amount }}
          </div>
          /
          {{
            period:
              "year" === period
                ? t("onboarding.cloudApi.connectFee.fee.period.year")
                : t("onboarding.cloudApi.connectFee.fee.period.month"),
          }}
        </Trans>
      </div>
      <div className={flowStyles.description}>
        {t("onboarding.cloudApi.connectFee.fee.description", {
          currency,
          price: amount,
          period:
            "year" === period
              ? t("onboarding.cloudApi.connectFee.fee.period.yearly")
              : t("onboarding.cloudApi.connectFee.fee.period.monthly"),
        })}
      </div>
    </div>
  );
}
