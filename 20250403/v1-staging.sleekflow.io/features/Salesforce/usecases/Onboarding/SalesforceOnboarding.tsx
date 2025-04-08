import React from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import useRouteConfig from "config/useRouteConfig";
import StepSyncToSleekflow from "./StepSyncToSleekflow";
import StepSyncToSalesforce from "./StepSyncToSalesforce";
import StepMapUsers from "./StepMapUsers";
import StepImportConditions from "./StepImportConditions";
import SyncingPage from "core/features/Crm/components/Onboarding/SyncingPage";
import CrmOnboarding from "core/features/Crm/components/Onboarding/CrmOnboarding";
import ConnectPage from "core/features/Crm/components/Onboarding/ConnectPage";
import StepAutoSyncSetting from "./StepAutoSyncSetting";

const crmName = "Salesforce";

function SalesforceOnboarding() {
  const { t } = useTranslation();
  const history = useHistory();
  const { routeTo } = useRouteConfig();

  const handleBack = () => {
    history.push(routeTo("/channels"));
  };

  const steps = [
    <ConnectPage
      providerType="salesforce-integrator"
      crmName={crmName}
      docLink="https://docs.sleekflow.io/app-integrations/salesforce-crm"
    />,
    <StepSyncToSleekflow />,
    <StepSyncToSalesforce />,
    <StepMapUsers />,
    <StepAutoSyncSetting />,
    <StepImportConditions />,
    <SyncingPage
      providerType="salesforce-integrator"
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

export default SalesforceOnboarding;
