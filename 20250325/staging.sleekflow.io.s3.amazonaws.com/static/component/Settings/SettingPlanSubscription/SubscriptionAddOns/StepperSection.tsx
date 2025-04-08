import React from "react";
import styles from "./StepperSection.module.css";
import ArrowBackIcon from "../../../../assets/tsx/icons/ArrowBackIcon";
import { SubscriptionAddOnStepper } from "./SubscriptionAddOnStepper";
import { useTranslation } from "react-i18next";

const StepperSection = ({
  basePlanQuota,
  quota,
  setQuota,
  min,
  max,
  step,
  currentPlanQuota,
  disable,
}: {
  basePlanQuota: number;
  step: number;
  currentPlanQuota: number;
  min: number;
  max: number;
  quota: number;
  setQuota: (value: number) => void;
  disable: boolean;
}) => {
  const { t } = useTranslation();
  return (
    <div className={styles.stepperWrapper}>
      <div className={styles.stepperNewPlan}>
        <div className={styles.stepperNewPlanLabel}>
          {t("settings.plan.addOn.editAddOnPage.currentPlan")}
        </div>
        <div className={styles.currentQuotaDisplayWrapper}>
          {currentPlanQuota}
        </div>
        <div className={styles.basePlanQuotaLabel}>
          {/* DEV NOTE: Add back when edit plan function released */}
          {/*{t("settings.plan.addOn.editAddOnPage.includedInThePlan", {*/}
          {/*  quota: basePlanQuota,*/}
          {/*})}*/}
        </div>
      </div>
      <div className={styles.arrowWrap}>
        <ArrowBackIcon />
      </div>
      <SubscriptionAddOnStepper
        step={step}
        min={min}
        max={max}
        amount={quota}
        onChange={(value) => setQuota(value)}
        disable={disable}
      />
    </div>
  );
};

export default StepperSection;
