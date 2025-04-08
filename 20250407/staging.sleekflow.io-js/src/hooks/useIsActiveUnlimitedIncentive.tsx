import { useCompany } from '@/api/company';
import { useGetIsFeatureFlagsEnabledQuery } from '@/api/common';
import { V10_FLOW_ENROLMENTS_UNLIMITED_ADDONS_PLAN_ID } from '@/constants/subscription-plans';
import dayjs from 'dayjs';

export const useIsActiveUnlimitedIncentive = () => {
  const { data: isEntitleToFlowEnrollmentIncentive } = useCompany({
    select: (data) => data.isEntitleToFlowEnrollmentIncentive,
  });
  const { data: isInFlowEnrollmentIncentivePeriod } =
    useGetIsFeatureFlagsEnabledQuery({
      select: (data) => data.isInFlowEnrollmentIncentivePeriod,
    });
  const { data: billings } = useCompany({
    select: ({ billRecords }) => {
      const unlimitedIncentivePlan = billRecords.find(
        (record) =>
          record.subscriptionPlanId ===
          V10_FLOW_ENROLMENTS_UNLIMITED_ADDONS_PLAN_ID,
      );

      return {
        unlimitedIncentivePlan,
      };
    },
  });
  const isEligibleForIncentive =
    isInFlowEnrollmentIncentivePeriod && isEntitleToFlowEnrollmentIncentive;
  const isIncentiveActive =
    billings?.unlimitedIncentivePlan &&
    dayjs().isBefore(dayjs(billings?.unlimitedIncentivePlan?.periodEnd));

  return {
    isEligibleForIncentive,
    isIncentiveActive,
    incentivePeriodEnd: billings?.unlimitedIncentivePlan?.periodEnd,
  };
};
