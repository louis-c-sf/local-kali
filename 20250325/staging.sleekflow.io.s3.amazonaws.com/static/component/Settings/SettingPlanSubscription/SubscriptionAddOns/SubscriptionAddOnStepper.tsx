import commonStyles from "./StepperSection.module.css";
import { StepperInput } from "../../../shared/form/StepperInput/StepperInput";
import React from "react";
import { useTranslation } from "react-i18next";

export function SubscriptionAddOnStepper({
  step = 1,
  amount,
  onChange,
  min,
  max,
  disable,
}: {
  min: number;
  max: number;
  step?: number;
  amount: number;
  onChange: (value: number) => void;
  disable: boolean;
}) {
  const { t } = useTranslation();

  return (
    <div
      className={`${commonStyles.stepperNewPlan} ${commonStyles.withButtons}`}
    >
      <div className={commonStyles.stepperNewPlanLabel}>
        {t("settings.plan.addOn.editAddOnPage.newPlan")}
      </div>
      <div className={commonStyles.stepper}>
        <StepperInput
          step={step}
          amount={amount}
          onChange={onChange}
          min={min}
          max={max}
          disabled={false}
          inputDisable={disable}
        />
      </div>
    </div>
  );
}
