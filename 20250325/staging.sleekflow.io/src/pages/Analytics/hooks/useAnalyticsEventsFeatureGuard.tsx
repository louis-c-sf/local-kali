import {
  FEATURE_FLAG_NAMES,
  useSuspenseIsCompanyFeatureFlagEnabled,
} from '@/api/featureFlag';
// import { useSuspenseAccessRuleGuard } from '@/pages/Contacts/shared/accessRuleGuard/useAccessRuleGuard';
// import { isProPlan } from '@/utils/subscription-plan-checker';
import { useGetAllUserEventsQuery } from '@/api/userEventTypes';
import { usePermissionWrapper } from '@/hooks/usePermission';
import { PERMISSION_KEY } from '@/constants/permissions';
import { RbacDefaultRole, RoleType } from '@/api/types';
import { useSuspenseMyProfile } from '@/hooks/useMyProfile';

export function useAnalyticsEventsFeatureGuard() {
  // const { company } = useSuspenseAccessRuleGuard();

  const { check } = usePermissionWrapper({ suspense: true });
  const { data: myStaff } = useSuspenseMyProfile();

  const isAdmin =
    myStaff?.roleType === RoleType.ADMIN ||
    myStaff?.rbacRoles?.includes(RoleType.ADMIN as never);

  const isSuperAdmin =
    myStaff?.rbacRoles?.includes(RbacDefaultRole.SUPER_ADMIN as never) ||
    myStaff?.roleType === (RbacDefaultRole.SUPER_ADMIN as never);

  const [hasPermissionRbac] = check(
    [PERMISSION_KEY.analyticsEventsView],
    [isAdmin || isSuperAdmin],
  );

  const hasRolePermission = hasPermissionRbac || isSuperAdmin;

  const { data: eventsData, isLoading: eventsLoading } =
    useGetAllUserEventsQuery({
      limit: 2,
    });

  // const currentPlan = company.data?.currentPlan.billRecord?.subscriptionPlan;

  // const isFreePlan = Boolean(currentPlan && isProPlan(currentPlan));
  // const isExactlyProPlan = Boolean(currentPlan && isProPlan(currentPlan));
  // const isPremiumPlanOrHigher = !(isFreePlan || isExactlyProPlan);

  const { isLoading: loadingFlagLimited, data: eventsFlagLimited } =
    useSuspenseIsCompanyFeatureFlagEnabled(
      FEATURE_FLAG_NAMES.ANALYTICS_EVENTS_LIMITED,
    );

  const { isLoading: loadingFlagFull, data: eventsFlagFull } =
    useSuspenseIsCompanyFeatureFlagEnabled(
      FEATURE_FLAG_NAMES.ANALYTICS_EVENTS_FULL,
    );

  const flagsReady = !loadingFlagLimited && !loadingFlagFull && !eventsLoading;
  // initially, the flags are defined by the plan
  let isAccessOff = true; //isFreePlan;
  let isAccessLimited = false; //isExactlyProPlan;
  let isAccessFull = false; //isPremiumPlanOrHigher;

  // we can override the flags individually
  if (flagsReady) {
    isAccessOff = !(eventsFlagLimited || eventsFlagFull);
    isAccessLimited = eventsFlagLimited && !eventsFlagFull;
    isAccessFull = eventsFlagFull;
  }

  const isAnyLevelDashboardAvailable = isAccessOff || hasRolePermission;

  return {
    dashboardEnabled: isAnyLevelDashboardAvailable,
    flowActionEnabled: isAccessFull,
    settingsEnabled: isAccessFull,
    isDashBoardDemoMode: isAccessLimited,
    isFreemiumMode: isAccessOff,
    isRequireEventsSetup:
      !eventsLoading && (eventsData?.pages[0]?.count ?? 0) < 2,
    loading: eventsLoading || !flagsReady,
  };
}
