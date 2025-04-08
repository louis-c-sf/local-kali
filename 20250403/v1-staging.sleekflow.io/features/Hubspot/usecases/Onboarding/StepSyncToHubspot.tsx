import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import OnboardingContext from "core/features/Crm/reducers/OnboardingContext";
import MapToCrmTable from "core/features/Crm/components/Onboarding/MapToCrmTable";
import iconStyles from "component/shared/Icon/Icon.module.css";
import onboardingStyles from "./onboarding.module.css";
import { formHubspotDisplayName } from "features/Hubspot/modules/helper";

export default function StepSyncToHubspot() {
  const { t } = useTranslation();
  const { onboardingDispatch } = useContext(OnboardingContext);

  const handleNextStep = async () => {
    onboardingDispatch({ type: "NEXT_STEP" });
  };

  return (
    <MapToCrmTable
      submitBtnText={t("onboarding.crm.action.nextButton")}
      onSubmitSuccess={handleNextStep}
      providerType={"hubspot-integrator"}
      crmName="HubSpot"
      crmIcon={<i className={`${iconStyles.icon} ${onboardingStyles.logo}`} />}
      getOptionText={(option) => formHubspotDisplayName(option)}
    />
  );
}
