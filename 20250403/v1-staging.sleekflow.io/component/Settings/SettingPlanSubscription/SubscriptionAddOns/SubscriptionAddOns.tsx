import React, { useEffect, useState } from "react";
import { PostLogin } from "../../../Header";
import Helmet from "react-helmet";
import { Trans, useTranslation } from "react-i18next";
import styles from "./SubscriptionAddOns.module.css";
import StepperSection from "./StepperSection";
import PriceBreakdown from "./PriceBreakdown";
import { Button } from "../../../shared/Button/Button";
import { Link } from "react-router-dom";
import useStripeCheckout from "../../../../api/User/useStripeCheckout";
import {
  formatQuotaValues,
  onClickRedirectToStripe,
} from "../SettingPlanUtils";
import { useFlashMessageChannel } from "../../../BannerMessage/flashBannerMessage";
import { StripePlanType } from "../../../../types/LoginType";
import { useAppSelector } from "AppRootContext";
import { isPremiumPlan } from "types/PlanSelectionType";
import { AdditionalStaffMonthlyPrice } from "features/FreeTrial/modules/FreeTriaMonthlyPriceDict";
import { FreeTrialHubDict } from "features/FreeTrial/modules/types";
import ArrowBackIcon from "assets/tsx/icons/ArrowBackIcon";

const SubscriptionAddOns = ({
  addOnPlan,
  currentPlanAdditionalQuota,
  currency,
  basePlanQuota,
  pricePerLabel,
  stepperStep,
  currentPlanQuota,
  planId,
  title,
  currentQuotaLabel,
  metaTitle,
  isFreeTrial = false,
}: {
  currentQuotaLabel: string;
  currentPlanAdditionalQuota: number;
  pricePerLabel: string;
  title: string;
  planId: string;
  addOnPlan: StripePlanType | undefined;
  currency: string;
  basePlanQuota: number;
  stepperStep: number;
  currentPlanQuota: number;
  metaTitle: string;
  isFreeTrial?: boolean;
}) => {
  const flash = useFlashMessageChannel();
  const currentPlan = useAppSelector((s) => s.currentPlan);
  const { t } = useTranslation();
  const { stripeCheckout } = useStripeCheckout();
  const stripePublicKey = stripeCheckout?.publicKey;
  const [quota, setQuota] = useState(0);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const confirmButtonDisabled = quota === currentPlanQuota || confirmLoading;
  const planQuantity = (quota - currentPlanQuota) / stepperStep;
  const isCurrentPlanPremium = isPremiumPlan(currentPlan);
  const currentPlanString = isCurrentPlanPremium ? "premium" : "pro";
  const upperCurrency = currentPlan.currency.toUpperCase();
  const monthlyPrice =
    AdditionalStaffMonthlyPrice[upperCurrency][currentPlanString];
  const addOnPrice = isFreeTrial ? monthlyPrice : addOnPlan?.displayAmount;
  const totalPrice = addOnPrice && planQuantity * addOnPrice;
  const freeTrialRequestParam = isFreeTrial
    ? {
        data: {
          info: "freeTrial",
          freeTrialType: FreeTrialHubDict.additionalStaff,
          quantity: planQuantity,
        },
      }
    : {};

  useEffect(() => {
    if (
      basePlanQuota &&
      (currentPlanAdditionalQuota || currentPlanAdditionalQuota === 0)
    ) {
      setQuota(currentPlanQuota);
    }
  }, [basePlanQuota, currentPlanAdditionalQuota]);

  return (
    <div className={"post-login"}>
      <PostLogin selectedItem={""} />
      <Helmet title={t("nav.common.title", { page: metaTitle })} />
      <div className={`main`}>
        <div className={styles.containerWrapper}>
          <Link className={styles.backButton} to={"/settings/plansubscription"}>
            <ArrowBackIcon />
            <span>{t("settings.plan.addOn.editAddOnPage.back")}</span>
          </Link>
          <div className={styles.modalWrapper}>
            <div className={styles.addOnPageHeader}>{title}</div>
            <div className={styles.contentWrapper}>
              <div className={styles.currentQuotaLabel}>
                {currentQuotaLabel}
              </div>
              <StepperSection
                basePlanQuota={basePlanQuota}
                step={stepperStep}
                currentPlanQuota={currentPlanQuota}
                min={currentPlanQuota}
                max={isFreeTrial ? currentPlanQuota + 5 : Infinity}
                quota={quota}
                setQuota={setQuota}
                disable={planId.includes("contact")}
              />
              <PriceBreakdown
                pricePerLabel={pricePerLabel}
                currency={currency || "USD"}
                totalPrice={totalPrice || 0}
                planPrice={formatQuotaValues(addOnPlan?.displayAmount || "0")}
              />
              {isFreeTrial && (
                <div className={styles.hint}>
                  <Trans
                    i18nKey="settings.plan.addOn.freeTrial.hint"
                    values={{
                      symbol: currency || "USD",
                      total: totalPrice || 0,
                    }}
                  >
                    Upon completing your 3-month free trial, you’ll be charged{" "}
                    {currency || "USD"} {totalPrice || 0}/month automatically
                    for every additional account.
                  </Trans>
                </div>
              )}
              <div className={styles.ctaWrapper}>
                <Button
                  loading={confirmLoading}
                  onClick={() =>
                    onClickRedirectToStripe({
                      t,
                      setLoading: setConfirmLoading,
                      flash,
                      planId,
                      stripePublicKey,
                      quantity: planQuantity,
                      isFreeTrial,
                      ...freeTrialRequestParam,
                    })
                  }
                  disabled={confirmButtonDisabled}
                  customSize={"mid"}
                  primary
                  className={styles.ctaButton}
                >
                  {t("settings.plan.addOn.editAddOnPage.confirm")}
                </Button>
                <Link
                  className={styles.ctaButtonLink}
                  to={"/settings/plansubscription"}
                >
                  <Button className={styles.ctaButton} customSize={"mid"} blue>
                    {t("settings.plan.addOn.editAddOnPage.cancel")}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionAddOns;
