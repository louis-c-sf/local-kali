import { usePermissionWrapper } from '../../../hooks/usePermission';
import { PERMISSION_KEY } from '@/constants/permissions';
import { RoleType } from '../../../api/types';
import { useSuspenseMyProfile } from '../../../hooks/useMyProfile';

export const useCommerceHubAccessControl = () => {
  const { check } = usePermissionWrapper({ suspense: true });
  const myStaffQuery = useSuspenseMyProfile();
  const myStaff = myStaffQuery.data;

  const hasAdminOverride = myStaff?.roleType === RoleType.ADMIN;

  return {
    canViewCommerceHub: check(
      [PERMISSION_KEY.commerceView],
      [hasAdminOverride],
    )[0],
    canManageCommerceSettings: check(
      [PERMISSION_KEY.commerceSettingsAccess],
      [hasAdminOverride],
    )[0],
  };
};
