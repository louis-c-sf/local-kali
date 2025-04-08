import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import OnboardingContext from "core/features/Crm/reducers/OnboardingContext";
import MapToCrmTable from "core/features/Crm/components/Onboarding/MapToCrmTable";
import postTriggerProviderSyncObjects from "core/features/Crm/API/Onboarding/postTriggerProviderSyncObjects";
import postInitProviderTypesSync from "core/features/Crm/API/Onboarding/postInitProviderTypesSync";
import { useAppSelector } from "AppRootContext";
import { equals } from "ramda";
import iconStyles from "component/shared/Icon/Icon.module.css";
import onboardingStyles from "../../Onboarding/onboarding.module.css";
import { ProviderSyncObjects } from "core/features/Crm/API/Onboarding/contracts";
import { formSalesforceDisplayName } from "features/Salesforce/models/helper";
import { getSyncMode } from "core/features/Crm/components/Onboarding/AutoSyncSettings";
import useFetchCompany from "api/Company/useFetchCompany";

const providerType = "salesforce-integrator";

export default function SyncDataToSalesforce() {
  const { t } = useTranslation();
  const { onboardingDispatch } = useContext(OnboardingContext);
  const { refreshCompany } = useFetchCompany();
  const config = useAppSelector(
    (s) =>
      s.company?.crmHubProviderConfigs?.find(
        (config) => config.provider_name === providerType
      ),
    equals
  );

  const handleNextStep = async () => {
    try {
      const isCompleteConfig = config
        ? Object.keys(config.entity_type_name_to_sync_config_dict).length
        : false;
      if (!isCompleteConfig) {
        const condition =
          config?.entity_type_name_to_sync_config_dict?.Contact?.filters;
        const syncMode = getSyncMode(config);
        await postInitProviderTypesSync(
          providerType,
          condition || [],
          syncMode
        );
        refreshCompany();
      }
      await Promise.all(
        ProviderSyncObjects.map((type) =>
          postTriggerProviderSyncObjects(providerType, type)
        )
      );
      onboardingDispatch({ type: "NEXT_STEP" });
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <MapToCrmTable
      submitBtnText={t("settings.crm.button.sync")}
      onSubmitSuccess={handleNextStep}
      providerType={providerType}
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
