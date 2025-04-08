import React from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import useRouteConfig from "config/useRouteConfig";
import CrmOnboarding from "core/features/Crm/components/Onboarding/CrmOnboarding";
import StepSyncToSleekflow from "./StepSyncToSleekflow";
import StepSyncToHubspot from "./StepSyncToHubspot";
import StepMapUsers from "./StepMapUsers";
import StepImportConditions from "./StepImportConditions";
import SyncingPage from "core/features/Crm/components/Onboarding/SyncingPage";
import ConnectPage from "core/features/Crm/components/Onboarding/ConnectPage";
import StepAutoSyncSetting from "./StepAutoSyncSetting";

const crmName = "HubSpot";

function HubspotOnboarding() {
  const { t } = useTranslation();
  const history = useHistory();
  const { routeTo } = useRouteConfig();

  const handleBack = () => {
    history.push(routeTo("/channels"));
  };

  const steps = [
    <ConnectPage
      providerType="hubspot-integrator"
      crmName={crmName}
      docLink="https://docs.sleekflow.io/app-integrations/hubspot-crm"
    />,
    <StepSyncToSleekflow />,
    <StepSyncToHubspot />,
    <StepMapUsers />,
    <StepAutoSyncSetting />,
    <StepImportConditions />,
    <SyncingPage
      providerType="hubspot-integrator"
      btnText={t("onboarding.crm.action.goToChannel")}
      titleText={t("onboarding.crm.stepSyncing.syncTitle")}
      onBtnClick={handleBack}
    />,
  ];

  return (
    <CrmOnboarding
      pageTitle={t("onboarding.crm.pageTitle", { crm: crmName })}
      steps={steps}
      stepsCount={6}
      handleBack={handleBack}
    />
  );
}

export default HubspotOnboarding;
