export const SUBSCRIPTION_TIER = {
  free: 0,
  pro: 1,
  premium: 2,
  enterprise: 3,
  addOn: 4,
  agent: 5,
};

export const SUBSCRIPTION_TIER_FREE = 'free';
export const SUBSCRIPTION_NAME = {
  startup: 'startup',
  pro: 'pro',
  premium: 'premium',
  enterprise: 'enterprise',
} as const;
export type SubscriptionPlanName = keyof typeof SUBSCRIPTION_NAME;
export type AvailableSubscribePlanName =
  | typeof SUBSCRIPTION_NAME.pro
  | typeof SUBSCRIPTION_NAME.premium;

export const SUBSCRIPTION_PERIODS = {
  monthly: 'monthly',
  yearly: 'yearly',
} as const;
export type SubscriptionPeriod = keyof typeof SUBSCRIPTION_PERIODS;

export const PLAN_NAMES_REGEX = {
  freemium: {
    subscriptionTier: SUBSCRIPTION_TIER.free,
    regex:
      /sleekflow_freemium|sleekflow_free|sleekflow_v\d+(_countrytier\d+)?_startup/,
    name: SUBSCRIPTION_NAME.startup,
  },
  proMonthly: {
    subscriptionTier: SUBSCRIPTION_TIER.pro,
    regex: /sleekflow_v\d+(_countrytier\d+)?_pro(?:_monthly)?/,
    name: SUBSCRIPTION_NAME.pro,
    period: SUBSCRIPTION_PERIODS.monthly,
  },
  proYearly: {
    subscriptionTier: SUBSCRIPTION_TIER.pro,
    regex: /sleekflow_v\d+(_countrytier\d+)?_pro_yearly/,
    name: SUBSCRIPTION_NAME.pro,
    period: SUBSCRIPTION_PERIODS.yearly,
  },
  premiumMonthly: {
    subscriptionTier: SUBSCRIPTION_TIER.premium,
    regex: /sleekflow_v\d+(_countrytier\d+)?_premium(?:_monthly)?/,
    name: SUBSCRIPTION_NAME.premium,
    period: SUBSCRIPTION_PERIODS.monthly,
  },
  premium: {
    subscriptionTier: SUBSCRIPTION_TIER.premium,
    regex: /sleekflow_v\d+(_countrytier\d+)?_premium_yearly/,
    name: SUBSCRIPTION_NAME.premium,
    period: SUBSCRIPTION_PERIODS.yearly,
  },
  enterprise: {
    subscriptionTier: SUBSCRIPTION_TIER.enterprise,
    name: SUBSCRIPTION_NAME.enterprise,
    regex: /sleekflow(_v\d+)?_enterprise/,
  },
} as const;

export const LATEST_PLAN_VERSION = 9;

export const ADDON_PLAN_TIERS = [
  SUBSCRIPTION_TIER.addOn,
  SUBSCRIPTION_TIER.agent,
];

export const V9_PREMIUM_PLAN_IDS = [
  /sleekflow_v9_premium_monthly/,
  /sleekflow_v9_premium_yearly/,
];

export const NEWEST_PLAN_VERSION = 10;
export const V10_FLOW_ENROLMENTS_UNLIMITED_ADDONS_PLAN_ID =
  'sleekflow_v10_flow_builder_flow_enrolments_unlimited_incentive_for_addon_purchase';
