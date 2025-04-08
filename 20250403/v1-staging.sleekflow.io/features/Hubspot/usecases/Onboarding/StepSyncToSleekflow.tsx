import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import OnboardingContext from "core/features/Crm/reducers/OnboardingContext";
import MapToSleekflowTable from "core/features/Crm/components/Onboarding/MapToSleekflowTable";
import iconStyles from "component/shared/Icon/Icon.module.css";
import onboardingStyles from "./onboarding.module.css";

export default function StepSyncToSleekflow() {
  const { t } = useTranslation();
  const { onboardingDispatch } = useContext(OnboardingContext);

  const handleNextStep = async () => {
    onboardingDispatch({ type: "NEXT_STEP" });
  };

  return (
    <MapToSleekflowTable
      providerType="hubspot-integrator"
      submitBtnText={t("onboarding.crm.action.nextButton")}
      onSubmitSuccess={handleNextStep}
      crmName="HubSpot"
      crmIcon={<i className={`${iconStyles.icon} ${onboardingStyles.logo}`} />}
      getOptionText={(option) => `${option.label}(${option.name})`}
    />
  );
}
