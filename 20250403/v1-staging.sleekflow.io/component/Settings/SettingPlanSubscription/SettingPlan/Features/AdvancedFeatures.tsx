import React from "react";
import FeatureTable from "./FeatureTable";
import { useTranslation } from "react-i18next";
import { TFunction } from "i18next";

const getAdvancedFeaturesTableData = (t: TFunction) => ({
  tableHeader: t("settings.plan.advancedFeatures"),
  features: {
    zapierIntegration: {
      title: t(
        "settings.plan.subscriptions.advancedFeatures.zapierIntegration"
      ),
      startup: false,
      pro: true,
      premium: true,
      tooltip: t(
        "settings.plan.subscriptions.advancedFeatures.zapierIntegrationTooltip"
      ),
    },
    advancedUserSettings: {
      title: t(
        "settings.plan.subscriptions.advancedFeatures.advancedUserSettings"
      ),
      startup: false,
      pro: false,
      premium: true,
      tooltip: t(
        "settings.plan.subscriptions.advancedFeatures.advancedUserSettingsTooltip"
      ),
    },
    analyticsDashboard: {
      title: t(
        "settings.plan.subscriptions.advancedFeatures.analyticsDashboard"
      ),
      startup: false,
      pro: false,
      premium: true,
    },
    apiIntegration: {
      title: t("settings.plan.subscriptions.advancedFeatures.apiIntegration"),
      startup: false,
      pro: false,
      premium: true,
      tooltip: t(
        "settings.plan.subscriptions.advancedFeatures.apiIntegrationTooltip"
      ),
    },
    onboardingSupport: {
      title: t(
        "settings.plan.subscriptions.advancedFeatures.onboardingSupport"
      ),
      startup: false,
      pro: true,
      premium: true,
      yearlyOnly: true,
    },
  },
});

const AdvancedFeatures = ({
  planInterval,
}: {
  planInterval: "yearly" | "monthly";
}) => {
  const { t } = useTranslation();
  const advancedFeatures = getAdvancedFeaturesTableData(t);
  return (
    <FeatureTable
      planInterval={planInterval}
      header={advancedFeatures.tableHeader}
      features={advancedFeatures.features}
    />
  );
};

export default AdvancedFeatures;
