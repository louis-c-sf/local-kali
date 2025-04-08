import type { SubscriptionPlan } from '@/api/types';
import {
  NEWEST_PLAN_VERSION,
  SUBSCRIPTION_TIER,
} from '@/constants/subscription-plans';

export function isFreeOrFreemiumPlan(plan: SubscriptionPlan) {
  return plan.subscriptionTier === SUBSCRIPTION_TIER.free;
}

export function isProPlan(plan: SubscriptionPlan) {
  return plan.subscriptionTier === SUBSCRIPTION_TIER.pro;
}

export function isEnterprisePlan(plan: SubscriptionPlan) {
  return plan.subscriptionTier === SUBSCRIPTION_TIER.enterprise;
}

export function isPremiumPlan(plan: SubscriptionPlan) {
  return plan.subscriptionTier === SUBSCRIPTION_TIER.premium;
}

export function isYearlyPlan(plan: SubscriptionPlan) {
  return /yearly/i.test(plan.id);
}

export function isMonthlyPlan(plan: SubscriptionPlan) {
  return /monthly/i.test(plan.id);
}

export function isLegacyPlan(version: number) {
  return version < NEWEST_PLAN_VERSION;
}
