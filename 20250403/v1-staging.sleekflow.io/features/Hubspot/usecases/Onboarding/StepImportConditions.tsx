import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import OnboardingContext from "core/features/Crm/reducers/OnboardingContext";
import ConditionTable from "core/features/Crm/components/Onboarding/ConditionTable";

export default function StepImportConditions() {
  const { t } = useTranslation();
  const { onboardingDispatch } = useContext(OnboardingContext);

  const handleNextStep = async () => {
    onboardingDispatch({ type: "NEXT_STEP" });
  };

  return (
    <ConditionTable
      providerType="hubspot-integrator"
      submitBtnText={t("onboarding.crm.action.syncButton")}
      onSubmitSuccess={handleNextStep}
      providerSyncObjects={["User", "Contact"]}
      crmName="HubSpot"
    />
  );
}
