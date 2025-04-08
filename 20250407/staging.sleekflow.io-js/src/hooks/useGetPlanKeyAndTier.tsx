import { useCompany } from '@/api/company';
import { fromApiBillRecordsToActiveBillRecord } from '@/utils/billing';
import {
  isMonthlyPlan,
  isPremiumPlan,
  isProPlan,
} from '@/utils/subscription-plan-checker';

export const PLAN_KEYS = {
  PRO_MONTHLY: 'pro-monthly',
  PRO_YEARLY: 'pro-yearly',
  PREMIUM_MONTHLY: 'premium-monthly',
  PREMIUM_YEARLY: 'premium-yearly',
} as const;

export const TIERS = {
  TIER1: 'Tier1',
  TIER2: 'Tier2',
  TIER4: 'Tier4',
  TIER5: 'Tier5',
} as const;

type TierKeys = (typeof TIERS)[keyof typeof TIERS];
export type PlanMigrationAlertTierKeys =
  (typeof PLAN_KEYS)[keyof typeof PLAN_KEYS];

export const PLAN_MIGRATION_ALERT_TIERS_LIST: Record<
  PlanMigrationAlertTierKeys,
  TierKeys[]
> = {
  [PLAN_KEYS.PRO_MONTHLY]: [TIERS.TIER1, TIERS.TIER2, TIERS.TIER4, TIERS.TIER5],
  [PLAN_KEYS.PRO_YEARLY]: [TIERS.TIER1, TIERS.TIER2, TIERS.TIER4, TIERS.TIER5],
  [PLAN_KEYS.PREMIUM_MONTHLY]: [TIERS.TIER1],
  [PLAN_KEYS.PREMIUM_YEARLY]: [TIERS.TIER1],
};

export const useGetPlanKeyAndTier = () => {
  const { data: companyData } = useCompany({
    select: ({ subscriptionCountryTier, billRecords }) => {
      const activeBillRecord =
        fromApiBillRecordsToActiveBillRecord(billRecords);
      return {
        tier: subscriptionCountryTier,
        currentPlan: activeBillRecord?.subscriptionPlan,
      };
    },
  });
  if (!companyData || !companyData.currentPlan) return {};
  const currentPlan = companyData.currentPlan;
  let planType = '';

  if (isProPlan(currentPlan)) {
    planType = 'pro';
  } else if (isPremiumPlan(currentPlan)) {
    planType = 'premium';
  }

  const billingCycle = isMonthlyPlan(currentPlan) ? 'monthly' : 'yearly';
  const planKey = `${planType}-${billingCycle}`;
  return {
    planKey: planKey as PlanMigrationAlertTierKeys,
    tier: companyData.tier as TierKeys,
  };
};
