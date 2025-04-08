import { fetchStripeCheckout } from "./fetchStripeCheckout";
import { useAppDispatch, useAppSelector } from "../../AppRootContext";
import { equals } from "ramda";
import { useEffect, useState } from "react";
import { StripePlanType } from "types/LoginType";
import {
  CORE_FEATURES_ADDONS,
  INTEGRATION_FEATURES_ADDONS,
  SUPPORT_PLANS,
} from "../../component/Settings/SettingPlanSubscription/SettingPlanUtils";
import { isPremiumPlan } from "types/PlanSelectionType";
import { appendBillToAddonStatus } from "features/FreeTrial/helper/appendBillToAddonStatus";

export type PlanInterval = "yearly" | "monthly";

export type StripeSubscriptionTypes = "pro" | "premium";

export type StripeCheckoutMainPlans = Record<
  PlanInterval,
  {
    pro: StripePlanType;
    premium: StripePlanType;
  }
>;

type CoreFeaturesPlans = Record<
  typeof CORE_FEATURES_ADDONS[number],
  StripePlanType
>;

type IntegrationFeaturesPlans = Record<
  typeof INTEGRATION_FEATURES_ADDONS[number],
  StripePlanType
>;

export interface StripeCheckoutCoreFeatures {
  monthly: {
    pro: CoreFeaturesPlans;
    premium: CoreFeaturesPlans;
  };
  yearly: {
    pro: CoreFeaturesPlans;
    premium: CoreFeaturesPlans;
  };
}

export interface SupportFeaturePlans {
  onboardingSupport: StripePlanType;
  prioritySupport: StripePlanType;
  chatbotAutomationSetup: StripePlanType;
}

export interface StripeCheckoutSupportPlans {
  monthly: {
    pro: SupportFeaturePlans;
    premium: SupportFeaturePlans;
  };
  yearly: {
    pro: SupportFeaturePlans;
    premium: SupportFeaturePlans;
  };
}

export interface StripeCheckoutIntegrationFeatures {
  monthly: {
    pro: IntegrationFeaturesPlans;
    premium: IntegrationFeaturesPlans;
  };
  yearly: {
    pro: IntegrationFeaturesPlans;
    premium: IntegrationFeaturesPlans;
  };
}

export interface StripeCheckoutPlans {
  mainSubscriptionPlans?: StripeCheckoutMainPlans;
  addOnPlans?: {
    coreFeatures: StripeCheckoutCoreFeatures;
    integrationFeatures: StripeCheckoutIntegrationFeatures;
  };
  supportPlans?: StripeCheckoutSupportPlans;
}

export interface CurrentUserAddOn {
  isSubscribed: boolean | undefined;
  freeTrialStatus?: string;
  periodEnd?: string;
  quota?: number | string | undefined;
}

export type CurrentUserAddOns = Record<
  | typeof CORE_FEATURES_ADDONS[number]
  | typeof INTEGRATION_FEATURES_ADDONS[number]
  | typeof SUPPORT_PLANS[number],
  CurrentUserAddOn
>;

export const useSettingsStripeCheckout = (currency: string) => {
  const loginDispatch = useAppDispatch();
  const stripeCheckout = useAppSelector((s) => s.stripeCheckout, equals);
  const [loading, setLoading] = useState(true);

  const {
    isAdditionalContactsEnabled,
    isUnlimitedContactEnabled,
    isEnterpriseContactMaskingEnabled,
    isWhatsappQrCodeEnabled,
    isShopifyIntegrationEnabled,
    isHubspotIntegrationEnabled,
    isPaymentIntegrationEnabled,
    isSalesforceCrmEnabled,
    isSalesforceMarketingCloudEnabled,
    isSalesforceCommerceCloudEnabled,
    isOnboardingSupportActivated,
    isPrioritySupportActivated,
    isChatbotSetupSupportActivated,
    includedStaffInBasePlan,
    maximumStaffInOverall,
    includedContactsInBasePlan,
    maximumContactsOverall,
    isUnlimitedMessagingChannelEnabled,
    billRecords,
    currentPlan,
    isAdditionalStaffEnabled,
    isAdditionalStaffFreeTrialEligible,
    isHubspotIntegrationFreeTrialEligible,
    isSalesforceCrmFreeTrialEligible,
  } = useAppSelector(
    (s) => ({
      isAdditionalContactsEnabled:
        s.company?.addonStatus?.isAdditionalContactsEnabled,
      isUnlimitedContactEnabled:
        s.company?.addonStatus?.isUnlimitedContactEnabled,
      isEnterpriseContactMaskingEnabled:
        s.company?.addonStatus?.isEnterpriseContactMaskingEnabled,
      isWhatsappQrCodeEnabled: s.company?.addonStatus?.isWhatsappQrCodeEnabled,
      isShopifyIntegrationEnabled:
        s.company?.addonStatus?.isShopifyIntegrationEnabled,
      isHubspotIntegrationEnabled:
        s.company?.addonStatus?.isHubspotIntegrationEnabled,
      isPaymentIntegrationEnabled:
        s.company?.addonStatus?.isPaymentIntegrationEnabled,
      isSalesforceCrmEnabled: s.company?.addonStatus?.isSalesforceCrmEnabled,
      isSalesforceMarketingCloudEnabled:
        s.company?.addonStatus?.isSalesforceMarketingCloudEnabled,
      isSalesforceCommerceCloudEnabled:
        s.company?.addonStatus?.isSalesforceCommerceCloudEnabled,
      isOnboardingSupportActivated:
        s.company?.addonStatus?.isOnboardingSupportActivated,
      isPrioritySupportActivated:
        s.company?.addonStatus?.isPrioritySupportActivated,
      isChatbotSetupSupportActivated:
        s.company?.addonStatus?.isChatbotSetupSupportActivated,
      includedStaffInBasePlan: s.currentPlan.includedAgents,
      maximumStaffInOverall: s.company?.maximumAgents,
      includedContactsInBasePlan: s.currentPlan.maximumContact,
      maximumContactsOverall: s.usage.maximumContacts,
      isUnlimitedMessagingChannelEnabled:
        s.company?.addonStatus?.isUnlimitedChannelEnabled,
      billRecords: s.company?.billRecords,
      currentPlan: s.currentPlan,
      isAdditionalStaffEnabled:
        s.company?.addonStatus?.isAdditionalStaffEnabled,
      isAdditionalStaffFreeTrialEligible:
        s.company?.addonStatus?.isAdditionalStaffFreeTrialEligible,
      isHubspotIntegrationFreeTrialEligible:
        s.company?.addonStatus?.isHubspotIntegrationFreeTrialEligible,
      isSalesforceCrmFreeTrialEligible:
        s.company?.addonStatus?.isSalesforceCrmFreeTrialEligible,
    }),
    equals
  );

  const isCurrentPlanPremium = isPremiumPlan(currentPlan);
  const currentPlanString = isCurrentPlanPremium ? "premium" : "pro";

  const freeTrialPlanState = appendBillToAddonStatus(
    isAdditionalStaffEnabled,
    isAdditionalStaffFreeTrialEligible,
    isHubspotIntegrationEnabled,
    isHubspotIntegrationFreeTrialEligible,
    isSalesforceCrmEnabled,
    isSalesforceCrmFreeTrialEligible,
    billRecords,
    currentPlanString
  );
  const returnObj = new Map<"stripePlans", StripeCheckoutPlans>([
    ["stripePlans", {}],
  ]);

  useEffect(() => {
    setLoading(true);
    fetchStripeCheckout(currency, loginDispatch, 9);
    setLoading(false);
  }, [currency]);

  if (stripeCheckout?.plans.length) {
    const plans = stripeCheckout.plans;

    // Add Ons - Core Features
    const proAgentMonthly = plans?.find((p) =>
      p.id.includes("agent_pro_monthly")
    ) as StripePlanType;

    const premiumAgentMonthly = plans?.find(
      (p) =>
        p.id.includes("agent_premium_monthly") ||
        p.id.includes("agent_premium_monthy")
    ) as StripePlanType;

    const additionalContacts = plans?.find(
      (p) =>
        p.id.includes("additional_2000_contact") ||
        p.id.includes("additional_5000_contact")
    ) as StripePlanType;

    const unlimitedContacts = plans?.find((p) =>
      p.id.includes("unlimited_contact")
    ) as StripePlanType;

    const unlimitedMessagingChannels = plans?.find((p) =>
      p.id.includes("unlimited_channels")
    ) as StripePlanType;

    const sensitiveDataMasking = plans?.find((p) =>
      p.id.includes("sensitive_data_masking")
    ) as StripePlanType;

    const whatsappQrCode = plans?.find((p) =>
      p.id.includes("whatsapp_qr_code")
    ) as StripePlanType;

    // Add Ons - Advanced Features
    const shopifyIntegration = plans?.find((p) =>
      p.id.includes("shopify_integration")
    ) as StripePlanType;

    const paymentIntegration = plans?.find((p) =>
      p.id.includes("payment_integration")
    ) as StripePlanType;

    const hubspotIntegration = plans?.find((p) =>
      p.id.includes("hubspot_integration")
    ) as StripePlanType;

    const salesforceCRMIntegration = plans?.find((p) =>
      p.id.includes("salesforce_integration")
    ) as StripePlanType;

    // Support Plans
    const onboardingSupport = plans?.find((p) =>
      p.id.includes("onboarding_support_oneoff")
    ) as StripePlanType;
    const prioritySupport = plans?.find((p) =>
      p.id.includes("priority_support_yearly")
    ) as StripePlanType;
    const chatbotAutomationSetup = plans.find((p) =>
      p.id.includes("support_and_consultation")
    ) as StripePlanType;

    // Main Subscription Plans
    const proMonthly = plans?.find(
      (p) => p.id.includes("pro_monthly") && !p.id.includes("agent_pro_monthly")
    ) as StripePlanType;
    const proYearly = plans?.find(
      (p) => p.id.includes("pro_yearly") && !p.id.includes("agent_pro_yearly")
    ) as StripePlanType;
    const premiumMonthly = plans?.find(
      (p) =>
        p.id.includes("premium_monthly") &&
        !p.id.includes("agent_premium_monthly")
    ) as StripePlanType;

    const premiumYearly = plans?.find(
      (p) =>
        p.id.includes("premium_yearly") &&
        !p.id.includes("agent_premium_yearly")
    ) as StripePlanType;

    returnObj.set("stripePlans", {
      mainSubscriptionPlans: {
        monthly: {
          pro: proMonthly,
          premium: premiumMonthly,
        },
        yearly: {
          pro: proYearly,
          premium: premiumYearly,
        },
      },
      addOnPlans: {
        coreFeatures: {
          monthly: {
            pro: {
              additionalStaffLogin: proAgentMonthly,
              additionalContacts,
              unlimitedMessagingChannels,
              whatsappQrCode,
              sensitiveDataMasking,
            },
            premium: {
              additionalStaffLogin: premiumAgentMonthly,
              additionalContacts,
              unlimitedMessagingChannels,
              sensitiveDataMasking,
              whatsappQrCode,
            },
          },
          yearly: {
            pro: {
              additionalStaffLogin: proAgentMonthly,
              additionalContacts,
              unlimitedMessagingChannels,
              whatsappQrCode,
              sensitiveDataMasking,
            },
            premium: {
              additionalStaffLogin: premiumAgentMonthly,
              additionalContacts,
              unlimitedMessagingChannels,
              sensitiveDataMasking,
              whatsappQrCode,
            },
          },
        },
        integrationFeatures: {
          monthly: {
            pro: {
              paymentIntegration,
              hubspotIntegration,
              salesforceCRMIntegration,
              shopifyIntegration,
            },
            premium: {
              paymentIntegration,
              hubspotIntegration,
              salesforceCRMIntegration,
              shopifyIntegration,
            },
          },
          yearly: {
            pro: {
              paymentIntegration,
              hubspotIntegration,
              salesforceCRMIntegration,
              shopifyIntegration,
            },
            premium: {
              paymentIntegration,
              hubspotIntegration,
              salesforceCRMIntegration,
              shopifyIntegration,
            },
          },
        },
      },
      supportPlans: {
        monthly: {
          pro: {
            onboardingSupport,
            prioritySupport,
            chatbotAutomationSetup,
          },
          premium: {
            onboardingSupport,
            prioritySupport,
            chatbotAutomationSetup,
          },
        },
        yearly: {
          pro: {
            onboardingSupport,
            prioritySupport,
            chatbotAutomationSetup,
          },
          premium: {
            onboardingSupport,
            prioritySupport,
            chatbotAutomationSetup,
          },
        },
      },
    });
  }

  return {
    loading,
    publicKey: stripeCheckout?.publicKey,
    stripePlans: { ...returnObj.get("stripePlans") } || undefined,
    currentUserAddOns: {
      additionalStaffLogin: {
        isSubscribed: freeTrialPlanState.additionalStaff?.isUsedPaidPlan,
        quota: maximumStaffInOverall
          ? maximumStaffInOverall - includedStaffInBasePlan
          : 0,
        freeTrialStatus: freeTrialPlanState.additionalStaff?.freeTrialStatus,
        periodEnd: freeTrialPlanState.additionalStaff?.periodEnd,
      },
      shopifyIntegration: {
        isSubscribed: false,
      },
      additionalContacts: {
        isSubscribed: isAdditionalContactsEnabled,
        quota: maximumContactsOverall - includedContactsInBasePlan,
      },
      unlimitedContacts: {
        isSubscribed: isUnlimitedContactEnabled,
      },
      sensitiveDataMasking: {
        isSubscribed: isEnterpriseContactMaskingEnabled,
      },
      whatsappQrCode: {
        isSubscribed: isWhatsappQrCodeEnabled,
      },
      unlimitedMessagingChannels: {
        isSubscribed: isUnlimitedMessagingChannelEnabled,
      },
      paymentIntegration: {
        isSubscribed: isPaymentIntegrationEnabled,
      },
      hubspotIntegration: {
        isSubscribed: freeTrialPlanState.hubspotCrm.isUsedPaidPlan,
        freeTrialStatus: freeTrialPlanState.hubspotCrm.freeTrialStatus,
        periodEnd: freeTrialPlanState.hubspotCrm.periodEnd,
      },
      salesforceCRMIntegration: {
        isSubscribed: freeTrialPlanState.salesforceCrm.isUsedPaidPlan,
        freeTrialStatus: freeTrialPlanState.salesforceCrm.freeTrialStatus,
        periodEnd: freeTrialPlanState.salesforceCrm.periodEnd,
      },
      onboardingSupport: {
        isSubscribed: isOnboardingSupportActivated,
      },
      prioritySupport: {
        isSubscribed: isPrioritySupportActivated,
      },
      chatbotAutomationSetup: {
        isSubscribed: isChatbotSetupSupportActivated,
      },
    },
  };
};
