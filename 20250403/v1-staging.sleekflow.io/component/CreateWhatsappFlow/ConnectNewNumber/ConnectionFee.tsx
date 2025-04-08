import React, { useEffect, useState } from "react";
import useStripeCheckout from "api/User/useStripeCheckout";
import { useAppDispatch, useAppSelector } from "AppRootContext";
import { useTranslation } from "react-i18next";
import { isYearlyPlan } from "types/PlanSelectionType";
import styles from "./ConnectionFee.module.css";
import { ConnectNewNumberHeaderBanner } from "./ConnectNewNumberHeaderBanner";
import { WhatsappFlowHeader } from "../WhatsappFlowHeader";
import ConnectPhoneNumberButton from "./ConnectPhoneNumberButton";
import { onClickRedirectToStripe } from "component/Settings/SettingPlanSubscription/SettingPlanUtils";
import { useFlashMessageChannel } from "component/BannerMessage/flashBannerMessage";
import { fetchStripeCheckout } from "api/User/fetchStripeCheckout";

export const ConnectionFee = () => {
  const { t } = useTranslation();
  const { stripeCheckout } = useStripeCheckout();
  const flash = useFlashMessageChannel();
  const isYearPlan = useAppSelector((s) => isYearlyPlan(s.currentPlan));
  const whatsappPhoneNumberPlan = stripeCheckout?.plans.find((s) =>
    isYearPlan
      ? s.id.includes("whatsapp_phone_number_yearly")
      : s.id.includes("whatsapp_phone_number")
  );
  const [buttonLoading, setButtonLoading] = useState(false);
  const loginDispatch = useAppDispatch();
  const currentPlanCurrency = useAppSelector((s) => s.currentPlan.currency);
  const currency = whatsappPhoneNumberPlan?.currency.toUpperCase();
  const amount = whatsappPhoneNumberPlan?.amount;

  function connectPaidPhoneNumber() {
    onClickRedirectToStripe({
      setLoading: setButtonLoading,
      flash,
      planId: whatsappPhoneNumberPlan?.id,
      stripePublicKey: stripeCheckout?.publicKey,
      t,
      data: {
        info: "connectFee",
      },
    });
  }

  useEffect(() => {
    if (!whatsappPhoneNumberPlan?.id && currentPlanCurrency) {
      fetchStripeCheckout(currentPlanCurrency, loginDispatch, 9);
    }
  }, [currentPlanCurrency, whatsappPhoneNumberPlan?.id]);

  return (
    <div className={styles.container}>
      <WhatsappFlowHeader
        icon={"whatsapp"}
        header={t("onboarding.cloudApi.connectFee.header")}
        subheader={t("onboarding.cloudApi.connectFee.subHeader")}
      />
      {whatsappPhoneNumberPlan && (
        <>
          <ConnectNewNumberHeaderBanner
            amount={amount ?? 0}
            currency={currency ?? "USD"}
            period={isYearPlan ? "year" : "month"}
          />
          <ConnectPhoneNumberButton
            className={styles.button}
            onClick={connectPaidPhoneNumber}
            loading={buttonLoading}
            text={t("onboarding.cloudApi.common.button.pay", {
              currency: whatsappPhoneNumberPlan.currency.toUpperCase(),
              price: whatsappPhoneNumberPlan.amount,
            })}
          />
        </>
      )}
    </div>
  );
};
