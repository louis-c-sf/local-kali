import React, { useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import OnboardingContext from "core/features/Crm/reducers/OnboardingContext";
import ConditionTable from "core/features/Crm/components/Onboarding/ConditionTable";
import { useAppSelector } from "AppRootContext";
import { equals } from "ramda";
import { ProviderType } from "../../API/Onboarding/contracts";

export default function ImportCondition(props: {
  crmName: string;
  providerSyncObjects: string[];
  providerType: ProviderType;
}) {
  const { crmName, providerSyncObjects, providerType } = props;
  const { t } = useTranslation();
  const { onboardingDispatch } = useContext(OnboardingContext);
  const crmConfigs = useAppSelector(
    (s) =>
      s.company?.crmHubProviderConfigs?.find(
        (config) => config.provider_name === providerType
      ),
    equals
  );
  const condition =
    crmConfigs?.entity_type_name_to_sync_config_dict.Contact?.filters;

  useEffect(() => {
    if (condition) {
      onboardingDispatch({
        type: "INIT_CONDITION_ROW",
        condition: condition,
      });
    }
  }, [condition, onboardingDispatch]);

  const handleNextStep = async () => {
    onboardingDispatch({ type: "NEXT_STEP" });
  };

  return (
    <ConditionTable
      providerType={providerType}
      submitBtnText={t("onboarding.crm.action.importButton")}
      onSubmitSuccess={handleNextStep}
      providerSyncObjects={providerSyncObjects}
      crmName={crmName}
    />
  );
}
