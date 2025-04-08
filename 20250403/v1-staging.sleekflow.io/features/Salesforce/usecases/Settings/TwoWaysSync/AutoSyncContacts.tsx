import React, { useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import AutoSyncSettings, {
  syncModeMap,
  getSyncMode,
} from "core/features/Crm/components/Onboarding/AutoSyncSettings";
import iconStyles from "component/shared/Icon/Icon.module.css";
import onboardingStyles from "../../Onboarding/onboarding.module.css";
import OnboardingContext from "core/features/Crm/reducers/OnboardingContext";
import { useAppSelector } from "AppRootContext";
import { equals } from "ramda";

const providerType = "salesforce-integrator";

export default function AutoSyncContacts() {
  const { t } = useTranslation();
  const { onboardingDispatch } = useContext(OnboardingContext);
  const crmConfig = useAppSelector(
    (s) =>
      s.company?.crmHubProviderConfigs?.find(
        (config) => config.provider_name === providerType
      ),
    equals
  );

  useEffect(() => {
    const syncModeConfig = getSyncMode(crmConfig);
    const syncModeValue = syncModeMap.find(
      (mode) => mode.syncMode === syncModeConfig.syncMode
    );
    if (syncModeValue) {
      const { syncMode, ...restMode } = syncModeValue;
      onboardingDispatch({
        type: "UPDATE_AUTO_SYNC_IS_ENABLE",
        syncMode: {
          ...restMode,
        },
      });
    }
    onboardingDispatch({
      type: "UPDATE_AUTO_SYNC_FIELD",
      field: syncModeConfig.field,
    });
  }, [crmConfig, onboardingDispatch]);

  const handleNextStep = async () => {
    onboardingDispatch({ type: "NEXT_STEP" });
  };

  return (
    <AutoSyncSettings
      submitBtnText={t("settings.crm.button.next")}
      onSubmitSuccess={handleNextStep}
      providerType={providerType}
      crmName="Salesforce"
      crmIcon={
        <i
          className={`${iconStyles.icon} ${onboardingStyles.salesforceLogo}`}
        />
      }
    />
  );
}
