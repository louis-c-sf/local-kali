import { RoleType } from '@/api/types';
import { useSuspenseMyProfile } from '@/hooks/useMyProfile';
import { usePermissionWrapper } from '@/hooks/usePermission';
import { PERMISSION_KEY } from '@/constants/permissions';

export const useIntegrationsRoleBasedAccessControl = () => {
  const userProfile = useSuspenseMyProfile();
  const { check } = usePermissionWrapper({ suspense: true });

  return {
    loading: userProfile.isLoading,
    canViewIntegrationsSettings: check(
      [PERMISSION_KEY.integrationsView],
      [userProfile.data?.roleType === RoleType.ADMIN],
    )[0],
  };
};
