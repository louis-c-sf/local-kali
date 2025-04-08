import React, { useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import AutoSyncSettings, {
  syncModeMap,
} from "core/features/Crm/components/Onboarding/AutoSyncSettings";
import iconStyles from "component/shared/Icon/Icon.module.css";
import stepStyles from "core/features/Crm/components/Onboarding/CrmOnboarding.module.css";

import OnboardingContext from "core/features/Crm/reducers/OnboardingContext";

const providerType = "salesforce-integrator";

export default function StepAutoSyncSetting() {
  const { t } = useTranslation();
  const { onboardingDispatch } = useContext(OnboardingContext);

  const handleNextStep = async () => {
    onboardingDispatch({ type: "NEXT_STEP" });
  };

  useEffect(() => {
    const { syncMode, ...restMode } = syncModeMap[3];
    onboardingDispatch({
      type: "UPDATE_AUTO_SYNC_IS_ENABLE",
      syncMode: {
        ...restMode,
      },
    });
  }, [onboardingDispatch]);

  return (
    <AutoSyncSettings
      submitBtnText={t("settings.crm.button.next")}
      onSubmitSuccess={handleNextStep}
      providerType={providerType}
      crmName="Salesforce"
      crmIcon={
        <i className={`${iconStyles.icon} ${stepStyles.salesforceLogo}`} />
      }
    />
  );
}
