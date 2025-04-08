import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import OnboardingContext from "core/features/Crm/reducers/OnboardingContext";
import MapToSleekflowTable from "core/features/Crm/components/Onboarding/MapToSleekflowTable";
import iconStyles from "component/shared/Icon/Icon.module.css";
import onboardingStyles from "../../Onboarding/onboarding.module.css";

const providerType = "hubspot-integrator";

export default function SyncDataToSleekflow() {
  const { t } = useTranslation();
  const { onboardingDispatch } = useContext(OnboardingContext);

  const handleNextStep = async () => {
    onboardingDispatch({ type: "NEXT_STEP" });
  };
  return (
    <MapToSleekflowTable
      providerType={providerType}
      submitBtnText={t("settings.crm.button.next")}
      onSubmitSuccess={handleNextStep}
      crmName="HubSpot"
      crmIcon={<i className={`${iconStyles.icon} ${onboardingStyles.logo}`} />}
      getOptionText={(option) => `${option.label}(${option.name})`}
    />
  );
}
