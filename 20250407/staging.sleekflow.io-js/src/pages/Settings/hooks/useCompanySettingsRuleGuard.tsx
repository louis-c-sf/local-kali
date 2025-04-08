import { PERMISSION_KEY } from '@/constants/permissions';
import { usePermissionWrapper } from '@/hooks/usePermission';

import { useCheckUserRoleAndPlan } from './useCheckUserRoleAndPlan';

export const useCompanyDetailsRuleGuard = (options?: {
  suspense?: boolean;
}) => {
  const { suspense = true } = options || {};
  const {
    isAdmin,
    isTeamAdmin,
    isFreeOrFreemiumPlan,
    isPremiumPlan,
    isEnterprisePlan,
  } = useCheckUserRoleAndPlan({
    suspense,
  });
  const { check } = usePermissionWrapper({ suspense });

  const canView2FA = !isFreeOrFreemiumPlan;
  const canViewIpWhitelisting = isPremiumPlan || isEnterprisePlan;

  return {
    // company details
    canViewCompanyDetail: check(
      [PERMISSION_KEY.companySettingsCompanyDetailsView],
      [isAdmin || isTeamAdmin],
    )[0],
    canEditCompanyDetail: check(
      [PERMISSION_KEY.companySettingsCompanyDetailsEdit],
      [isAdmin || isTeamAdmin],
    )[0],

    // 2fa
    canView2FA,
    canRevoke2FA:
      canView2FA &&
      check(
        [PERMISSION_KEY.companySettingsUserSecuritySettingsEdit],
        [isAdmin],
      )[0],
    canView2FARevokeWarning:
      canView2FA &&
      !check(
        [PERMISSION_KEY.companySettingsUserSecuritySettingsEdit],
        [isAdmin],
      )[0],
    canView2FASetting:
      canView2FA &&
      check([PERMISSION_KEY.companySettingsSecuritySettingsView], [isAdmin])[0],
    canEdit2FASetting:
      canView2FA &&
      check([PERMISSION_KEY.companySettingsSecuritySettingsEdit], [isAdmin])[0],

    // ip whitelisting
    canViewIpWhitelisting,
    canViewIpWhitelistingSettings:
      canViewIpWhitelisting &&
      check([PERMISSION_KEY.companySettingsSecuritySettingsView], [isAdmin])[0],
    canEditIpWhitelistingSettings:
      canViewIpWhitelisting &&
      check([PERMISSION_KEY.companySettingsSecuritySettingsEdit], [isAdmin])[0],
  };
};

export const useUserManagementRuleGuard = (options?: {
  suspense?: boolean;
}) => {
  const { suspense } = options || {};
  const { isAdmin, isTeamAdmin } = useCheckUserRoleAndPlan({ suspense });
  const { check } = usePermissionWrapper({ suspense });

  return {
    canViewUserManagement: check(
      [PERMISSION_KEY.companySettingsUserView],
      [isAdmin || isTeamAdmin],
    )[0],
    canInviteUser: check(
      [PERMISSION_KEY.companySettingsUserInvite],
      [isAdmin],
    )[0],
    canEditUser: check([PERMISSION_KEY.companySettingsUserEdit], [isAdmin])[0],
    canDeleteUser: check(
      [PERMISSION_KEY.companySettingsUserDelete],
      [isAdmin],
    )[0],
    canResetPassword: check(
      [PERMISSION_KEY.companySettingsUserSecuritySettingsEdit],
      [isAdmin],
    )[0],
    canViewEditQrCodeMessage: check(
      [PERMISSION_KEY.channelQrCodeManage],
      [isAdmin],
    )[0],
  };
};

export const useTeamManagementRuleGuard = (options?: {
  suspense?: boolean;
}) => {
  const { suspense } = options || {};
  const { isAdmin, isPremiumPlan, isEnterprisePlan } = useCheckUserRoleAndPlan({
    suspense,
  });
  const { check } = usePermissionWrapper({ suspense });

  const canViewTeam = isPremiumPlan || isEnterprisePlan;

  return {
    canViewTeam,
    canViewTeamManagement:
      canViewTeam &&
      check([PERMISSION_KEY.companySettingsTeamView], [isAdmin])[0],
    canEditTeam:
      canViewTeam &&
      check([PERMISSION_KEY.companySettingsTeamEdit], [isAdmin])[0],
  };
};

export const useRoleManagementRuleGuard = (options?: {
  suspense?: boolean;
}) => {
  const { suspense } = options || {};
  const { isSuperAdmin } = useCheckUserRoleAndPlan({ suspense });
  const { check } = usePermissionWrapper({ suspense });

  return {
    canViewRoleManagement: check(
      [PERMISSION_KEY.companySettingsRoleView],
      [isSuperAdmin],
    )[0],
    canCreateRole: check(
      [PERMISSION_KEY.companySettingsRoleCreate],
      [isSuperAdmin],
    )[0],
    canEditRole: check(
      [PERMISSION_KEY.companySettingsRoleEdit],
      [isSuperAdmin],
    )[0],
    canDeleteRole: check(
      [PERMISSION_KEY.companySettingsRoleDelete],
      [isSuperAdmin],
    )[0],
  };
};

export const useAuditLogRuleGuard = (options?: { suspense?: boolean }) => {
  const { suspense } = options || {};
  const { isAdmin } = useCheckUserRoleAndPlan({ suspense });
  const { check } = usePermissionWrapper({ suspense });

  return {
    canViewAuditLog: check(
      [PERMISSION_KEY.companySettingsAuditLogView],
      [isAdmin],
    )[0],
  };
};
