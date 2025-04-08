import { useGetIsFeatureFlagsEnabledQuery } from '@/api/common';
import { useCompany, useSuspenseCompany } from '@/api/company';
import { CompanyTypeDict } from '@/api/types';
import { PERMISSION_KEY } from '@/constants/permissions';
import {
  PLAN_MIGRATION_ALERT_TIERS_LIST,
  PlanMigrationAlertTierKeys,
  useGetPlanKeyAndTier,
} from '@/hooks/useGetPlanKeyAndTier';
import { usePermissionWrapper } from '@/hooks/usePermission';

import { useCheckUserRoleAndPlan } from './useCheckUserRoleAndPlan';

export const usePlansAndBillingsRuleGuard = (options?: {
  suspense?: boolean;
}) => {
  const { suspense = true } = options || {};
  const {
    isAdmin,
    isFreeOrFreemiumPlan,
    isProPlan,
    isLegacyPlan,
    isPremiumPlan,
  } = useCheckUserRoleAndPlan({
    suspense,
  });
  const { check } = usePermissionWrapper({ suspense });
  const getCompany = suspense ? useSuspenseCompany : useCompany;
  const { data: companyData } = getCompany({
    select: (data) => {
      return {
        isResellerClient:
          data.companyType === CompanyTypeDict.resellerClient ||
          data.companyType === CompanyTypeDict.reseller,
        isPaymentFailed: data.isPaymentFailed,
      };
    },
  });
  const { planKey, tier } = useGetPlanKeyAndTier();
  const { data: isFeatureFlagsEnabled } = useGetIsFeatureFlagsEnabledQuery();
  const [canManagePlansAndBillings, canViewSummary] = check(
    [
      PERMISSION_KEY.plansAndBillingsPlanAndSubscriptionManage,
      PERMISSION_KEY.planSummaryAccess,
    ],
    [isAdmin, isAdmin],
  );

  const isDirectClientAndPaid =
    !companyData?.isResellerClient && !isFreeOrFreemiumPlan;

  const canPlanTierDisplayPlanMigrationAlert: (
    planKey: PlanMigrationAlertTierKeys,
  ) => boolean = (planKey: PlanMigrationAlertTierKeys) => {
    if (!planKey || !tier) return false;
    return PLAN_MIGRATION_ALERT_TIERS_LIST[
      planKey as keyof typeof PLAN_MIGRATION_ALERT_TIERS_LIST
    ]?.includes(tier);
  };

  const canProPlanDisplayPlanMigrationAlert = () => {
    if (!isFeatureFlagsEnabled || !planKey) return false;
    return (
      isProPlan &&
      isLegacyPlan &&
      canManagePlansAndBillings &&
      isFeatureFlagsEnabled.isPlanMigrationIncentiveCampaignPeriod &&
      canPlanTierDisplayPlanMigrationAlert(planKey)
    );
  };

  const canPremiumPlanDisplayPlanMigrationAlert = () => {
    if (!isFeatureFlagsEnabled || !planKey) return false;
    return (
      isPremiumPlan &&
      isLegacyPlan &&
      canManagePlansAndBillings &&
      isFeatureFlagsEnabled.isPlanMigrationIncentiveCampaignPeriod &&
      canPlanTierDisplayPlanMigrationAlert(planKey)
    );
  };

  return {
    canManagePlansAndBillings,
    canViewSubscriptions: canManagePlansAndBillings || canViewSummary,
    canViewInvoice:
      isDirectClientAndPaid &&
      canManagePlansAndBillings &&
      !companyData?.isPaymentFailed,
    canViewSupportServices: isDirectClientAndPaid && canManagePlansAndBillings,
    canViewAddons: isDirectClientAndPaid && canManagePlansAndBillings,
    canEditAddons: isDirectClientAndPaid && canManagePlansAndBillings,
    canViewCompanySummary: !companyData?.isResellerClient && canViewSummary,
    canEditPaymentMethod: isDirectClientAndPaid && canManagePlansAndBillings,
    canViewManagePlan:
      !companyData?.isResellerClient && canManagePlansAndBillings,
    canProPlanDisplayPlanMigrationAlert: canProPlanDisplayPlanMigrationAlert(),
    canPremiumPlanDisplayPlanMigrationAlert:
      canPremiumPlanDisplayPlanMigrationAlert(),
  };
};
