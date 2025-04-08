import dayjs from 'dayjs';

import type { BillRecord } from '@/api/types';
import {
  PLAN_NAMES_REGEX,
  SUBSCRIPTION_TIER,
  type SubscriptionPeriod,
  type SubscriptionPlanName,
} from '@/constants/subscription-plans';

export function fromApiBillRecordsToActiveBillRecord(
  billRecords: BillRecord[],
) {
  const activeBillRecordsWithoutAddOns = billRecords.filter((record) => {
    return (
      record.subscriptionPlan &&
      [SUBSCRIPTION_TIER.addOn, SUBSCRIPTION_TIER.agent].indexOf(
        record.subscriptionPlan.subscriptionTier,
      ) === -1 &&
      dayjs.utc(record.periodEnd).isAfter(dayjs.utc())
    );
  });

  return activeBillRecordsWithoutAddOns.length > 0
    ? activeBillRecordsWithoutAddOns[0]
    : undefined;
}

export type PlanDetails = {
  planName: SubscriptionPlanName | null;
  billingPeriod: SubscriptionPeriod | null;
};

export function transformPlanDetails(
  planName: string | undefined,
): PlanDetails {
  if (!planName) {
    return {
      planName: 'startup',
      billingPeriod: null,
    };
  }

  let transformedPlanName: SubscriptionPlanName | null = null;
  let planPeriod: SubscriptionPeriod | null = null;

  Object.values(PLAN_NAMES_REGEX).forEach((value) => {
    if (value.regex.test(planName)) {
      transformedPlanName = value.name;
      if ('period' in value) {
        planPeriod = value.period;
      }
    }
  });

  return {
    planName: transformedPlanName,
    billingPeriod: planPeriod,
  } as PlanDetails;
}
