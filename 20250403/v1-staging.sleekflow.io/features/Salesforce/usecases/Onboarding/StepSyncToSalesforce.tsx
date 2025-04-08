import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import OnboardingContext from "core/features/Crm/reducers/OnboardingContext";
import MapToCrmTable from "core/features/Crm/components/Onboarding/MapToCrmTable";
import iconStyles from "component/shared/Icon/Icon.module.css";
import onboardingStyles from "./onboarding.module.css";
import { formSalesforceDisplayName } from "features/Salesforce/models/helper";

export default function StepSyncToSalesforce() {
  const { t } = useTranslation();
  const { onboardingDispatch } = useContext(OnboardingContext);

  const handleNextStep = async () => {
    onboardingDispatch({ type: "NEXT_STEP" });
  };

  return (
    <MapToCrmTable
      submitBtnText={t("onboarding.crm.action.nextButton")}
      onSubmitSuccess={handleNextStep}
      providerType={"salesforce-integrator"}
      crmName="Salesforce"
      crmIcon={
        <i
          className={`${iconStyles.icon} ${onboardingStyles.salesforceLogo}`}
        />
      }
      getOptionText={(option) => formSalesforceDisplayName(option)}
    />
  );
}
