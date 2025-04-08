import FeatureTable from "./FeatureTable";
import React from "react";
import { useTranslation } from "react-i18next";
import { StripeCheckoutMainPlans } from "api/User/useSettingsStipeCheckout";
import { TFunction } from "i18next";
import { formatNumber } from "utility/string";

interface FeatureData {
  pro: number;
  premium: number;
}

export const getCoreFeaturesTableData = (
  t: TFunction,
  featureQuotas: {
    staffLogin: FeatureData;
    customerContacts: FeatureData;
    broadCastMessages: FeatureData;
    automationRules: FeatureData;
    messagingChannels: FeatureData;
  }
) => ({
  tableHeader: t("settings.plan.coreFeatures"),
  features: {
    staffLogin: {
      title: t("settings.plan.subscriptions.coreFeatures.staffLogin"),
      startup: formatNumber(3),
      pro: formatNumber(featureQuotas.staffLogin.pro),
      premium: formatNumber(featureQuotas.staffLogin.premium),
    },
    customerContacts: {
      title: t("settings.plan.subscriptions.coreFeatures.customerContacts"),
      startup: formatNumber(100),
      pro: formatNumber(featureQuotas.customerContacts.pro),
      premium: formatNumber(featureQuotas.customerContacts.premium),
    },
    broadCastMessages: {
      title: t("settings.plan.subscriptions.coreFeatures.broadcastMessages"),
      startup: formatNumber(100),
      pro: formatNumber(featureQuotas.broadCastMessages.pro),
      premium: t("settings.plan.subscriptions.unlimited"),
    },
    automationRules: {
      title: t("settings.plan.subscriptions.coreFeatures.automationRules"),
      startup: formatNumber(5),
      pro: formatNumber(featureQuotas.automationRules.pro),
      premium: t("settings.plan.subscriptions.unlimited"),
    },
    messagingChannels: {
      title: t("settings.plan.subscriptions.coreFeatures.messagingChannels"),
      startup: "3*",
      pro: formatNumber(featureQuotas.messagingChannels.pro),
      premium: formatNumber(featureQuotas.messagingChannels.premium),
    },
  },
});

const CoreFeatures = ({
  features,
  planInterval,
}: {
  planInterval: "yearly" | "monthly";
  features: StripeCheckoutMainPlans | undefined;
}) => {
  const { t } = useTranslation();

  if (!features) {
    return null;
  }

  const coreFeatures = getCoreFeaturesTableData(t, {
    staffLogin: {
      pro: features[planInterval].pro.includedAgents,
      premium: features[planInterval].premium.includedAgents,
    },
    customerContacts: {
      pro: features[planInterval].pro.maximumContact,
      premium: features[planInterval].premium.maximumContact,
    },
    broadCastMessages: {
      // API shows yearly total automation rules so show monthly for both
      pro: features.monthly.pro.maximumMessageSent,
      premium: features.monthly.pro.maximumMessageSent,
    },
    automationRules: {
      pro: features[planInterval].pro.maximumAutomation,
      premium: features[planInterval].premium.maximumAutomation,
    },
    messagingChannels: {
      pro: features[planInterval].pro.maximumNumberOfChannel,
      premium: features[planInterval].premium.maximumNumberOfChannel,
    },
  });

  return (
    <FeatureTable
      header={coreFeatures.tableHeader}
      features={coreFeatures.features}
    />
  );
};

export default CoreFeatures;
