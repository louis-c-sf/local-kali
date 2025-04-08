import React from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import useRouteConfig from "config/useRouteConfig";
import { TabEnum } from "core/features/Crm/components/Settings/SettingCrm";
import CrmOnboarding from "core/features/Crm/components/Onboarding/CrmOnboarding";

import AutoSyncContacts from "./TwoWaysSync/AutoSyncContacts";
import ImportCondition from "core/features/Crm/components/Settings/ImportCondition";
import SyncingPage from "core/features/Crm/components/Onboarding/SyncingPage";
import { ProviderSyncObjects } from "core/features/Crm/API/Onboarding/contracts";

const stepsCount = 2;
const crmName = "Salesforce";
const providerType = "salesforce-integrator";

export default function TwoWaySync() {
  const { t } = useTranslation();
  const history = useHistory();
  const { routeTo } = useRouteConfig();

  const handleBack = () => {
    history.push({
      pathname: routeTo("/settings/salesforce"),
      state: {
        backToTab: "syncData" as TabEnum,
      },
    });
  };

  const steps = [
    <AutoSyncContacts />,
    <ImportCondition
      crmName={crmName}
      providerSyncObjects={ProviderSyncObjects}
      providerType={providerType}
    />,
    <SyncingPage
      providerType={providerType}
      titleText={t("onboarding.crm.stepSyncing.syncTitle")}
      btnText={t("settings.crm.button.back")}
      onBtnClick={handleBack}
    />,
  ];

  return (
    <CrmOnboarding
      pageTitle={t("nav.menu.settings.settings")}
      steps={steps}
      handleBack={handleBack}
      stepsCount={stepsCount}
      backBtnText={t("settings.crm.button.back")}
    />
  );
}
