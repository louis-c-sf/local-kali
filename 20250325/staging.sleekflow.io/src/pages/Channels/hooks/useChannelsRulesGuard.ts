import { RoleType } from '@/api/types';
import { SUBSCRIPTION_TIER } from '@/constants/subscription-plans';
import { useSuspenseAccessRuleGuard } from '@/pages/Contacts/shared/accessRuleGuard/useAccessRuleGuard';

export const useChannelsRulesGuard = () => {
  const accessRulesGuard = useSuspenseAccessRuleGuard();
  return handleRulesGuard(accessRulesGuard);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function handleRulesGuard(accessRulesGuard: { user: any; company: any }) {
  const isStaffRoleUser =
    accessRulesGuard.user.data?.roleType === RoleType.STAFF;
  const isTeamAdminRoleUser =
    accessRulesGuard.user.data?.roleType === RoleType.TEAMADMIN;
  const canAccessChannels = !isStaffRoleUser && !isTeamAdminRoleUser;

  const currentPlan =
    accessRulesGuard.company.data?.currentPlan.billRecord?.subscriptionPlan;
  const isFreePlanUser = Boolean(
    currentPlan && currentPlan.subscriptionTier === SUBSCRIPTION_TIER.free,
  );

  return {
    canAccessChannels,
    isFreePlanUser,
  };
}
