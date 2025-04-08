import { IconNames } from '@/assets/icomoon/icon';
import {
  AvailableSubscribePlanName,
  SubscriptionPeriod,
  SubscriptionPlanName,
} from '@/constants/subscription-plans';

export const FeatureIdDict = {
  all: 'all',
  inbox: 'inbox',
  message: 'message',
  integrations: 'integrations',
  broadcasts: 'broadcasts',
  flowBuilder: 'flowBuilder',
  securityAndAnalytics: 'securityAndAnalytics',
  supportAndService: 'supportAndService',
  whatsAppBusinessAPI: 'whatsAppBusinessAPI',
} as const;
export type FeatureIdDictType = keyof typeof FeatureIdDict;

export type HeaderFeatureListType = {
  id: string;
  description: string | React.ReactNode;
};

export type HeaderType = {
  plan: SubscriptionPlanName;
  planInterval: string;
  isProMonthlyHide?: boolean;
  stripeId?: string;
  iconName: IconNames;
  title: string;
  price: string;
  priceDescription?: string | React.ReactNode;
  button: ActionButtonType | null;
  isShowLegacyUpdatePrompt: boolean;
  isLegacy?: boolean;
  isDisabled: boolean;
  list: HeaderFeatureListType[];
};

export const PlanActionDict = {
  switch: 'switch',
  upgrade: 'upgrade',
  downgrade: 'downgrade',
  contactUs: 'contactUs',
  currentPlan: 'currentPlan',
  update: 'update',
} as const;
export type PlanActionDictType = keyof typeof PlanActionDict;

export type ActionButtonType = {
  label: string;
  value: string;
};

export type PlanActionInfoSession = {
  action: string;
  planTier: SubscriptionPlanName;
  planInterval: SubscriptionPeriod;
};

type PlanDetails = {
  stripeId: string;
  price: number;
};

type PlanData = {
  currency: string;
  monthly: PlanDetails;
  yearly: PlanDetails;
};

export type FormatResultsType = {
  [K in AvailableSubscribePlanName]: PlanData;
};
