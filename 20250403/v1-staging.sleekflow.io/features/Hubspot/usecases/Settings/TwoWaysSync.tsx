import React from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import useRouteConfig from "config/useRouteConfig";
import { TabEnum } from "core/features/Crm/components/Settings/SettingCrm";
import CrmOnboarding from "core/features/Crm/components/Onboarding/CrmOnboarding";

import AutoSyncContacts from "./TwoWaysSync/AutoSyncContacts";
import ImportCondition from "core/features/Crm/components/Settings/ImportCondition";
import SyncingPage from "core/features/Crm/components/Onboarding/SyncingPage";

const stepsCount = 2;
const crmName = "Hubspot";
const providerType = "hubspot-integrator";

export default function TwoWaysSync() {
  const { t } = useTranslation();
  const history = useHistory();
  const { routeTo } = useRouteConfig();

  const handleBack = () => {
    history.push({
      pathname: routeTo("/settings/hubspot"),
      state: {
        backToTab: "syncData" as TabEnum,
      },
    });
  };

  const steps = [
    <AutoSyncContacts />,
    <ImportCondition
      crmName={crmName}
      providerSyncObjects={["User", "Contact"]}
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
