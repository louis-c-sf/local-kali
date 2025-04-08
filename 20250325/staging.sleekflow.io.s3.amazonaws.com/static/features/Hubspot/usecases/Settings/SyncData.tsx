import React from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import useRouteConfig from "config/useRouteConfig";
import SyncDataToHubspot from "./SyncDataSteps/SyncDataToHubspot";
import SyncDataToSleekflow from "./SyncDataSteps/SyncDataToSleekflow";
import SyncingPage from "core/features/Crm/components/Onboarding/SyncingPage";
import { TabEnum } from "core/features/Crm/components/Settings/SettingCrm";
import CrmOnboarding from "core/features/Crm/components/Onboarding/CrmOnboarding";

const stepsCount = 2;

function SyncData() {
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
    <SyncDataToSleekflow />,
    <SyncDataToHubspot />,
    <SyncingPage
      providerType="hubspot-integrator"
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

export default SyncData;
