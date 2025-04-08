import {
  useSuspenseAccessRuleGuard,
  useAccessRuleGuard,
} from '@/pages/Contacts/shared/accessRuleGuard/useAccessRuleGuard';
import {
  isEnterprisePlan as isEnterprisePlanChecker,
  isFreeOrFreemiumPlan as isFreeOrFreemiumPlanChecker,
  isPremiumPlan as isPremiumPlanChecker,
  isProPlan as isProPlanChecker,
  isLegacyPlan as isLegacyPlanChecker,
} from '@/utils/subscription-plan-checker';

export const useCheckUserRoleAndPlan = (options?: { suspense?: boolean }) => {
  const { suspense = true } = options || {};
  const getAccessRuleGuard = suspense
    ? useSuspenseAccessRuleGuard
    : useAccessRuleGuard;
  const { user, company } = getAccessRuleGuard();

  const currentPlan = company.data?.currentPlan.billRecord?.subscriptionPlan;
  const isAdmin = user.data?.roleType === 'Admin';
  const isTeamAdmin = user.data?.roleType === 'TeamAdmin';
  const isSuperAdmin = !!user.data?.isCompanyOwner;
  const isFreeOrFreemiumPlan =
    currentPlan && isFreeOrFreemiumPlanChecker(currentPlan);
  const isProPlan = currentPlan && isProPlanChecker(currentPlan);
  const isPremiumPlan = currentPlan && isPremiumPlanChecker(currentPlan);
  const isEnterprisePlan = currentPlan && isEnterprisePlanChecker(currentPlan);
  const isLegacyPlan = currentPlan && isLegacyPlanChecker(currentPlan.version);
  return {
    isAdmin,
    isTeamAdmin,
    isSuperAdmin,
    isFreeOrFreemiumPlan,
    isProPlan,
    isPremiumPlan,
    isEnterprisePlan,
    isLegacyPlan,
    user,
    company,
  };
};
