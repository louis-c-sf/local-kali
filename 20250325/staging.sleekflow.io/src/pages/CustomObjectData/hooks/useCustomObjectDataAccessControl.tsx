import { useGetCrmHubConfigQuery } from '@/api/crmHub';
import { usePermissionWrapper } from '../../../hooks/usePermission';
import { PERMISSION_KEY } from '../../../constants/permissions';
import { RoleType } from '../../../api/types';
import { CustomObjectData } from '../type';
import { useSuspenseMyProfile } from '../../../hooks/useMyProfile';

export default function useCustomObjectDataAccessControl() {
  const { data: canAccessCustomObject, isLoading } = useGetCrmHubConfigQuery({
    select: (data) =>
      data.feature_accessibility_settings.can_access_custom_object,
  });
  const staffQuery = useSuspenseMyProfile();
  const staff = staffQuery.data;
  const { check } = usePermissionWrapper({ suspense: true });

  function isDeletableLegacy(data: CustomObjectData): boolean {
    if (!staff) {
      return false;
    }
    const isDataHasCreateBy = (data.createdByStaffId ?? '').trim() != '';

    if (isDataHasCreateBy && data.createdByStaffId === String(staff.staffId)) {
      return true;
    }
    const allowedByRole = staff?.roleType === RoleType.ADMIN;

    if (allowedByRole) {
      return true;
    }

    if (staff.roleType === RoleType.TEAMADMIN && isDataHasCreateBy) {
      return !!data.createdByStaffTeamIds?.some((teamId) =>
        staff.associatedTeams?.some((team) => team.id === teamId),
      );
    }
    return false;
  }

  return {
    canAccessCustomObjectFeature: canAccessCustomObject ?? false,
    isLoading,

    canViewCustomObjectData: check(
      [PERMISSION_KEY.customObjectsDataAccess],
      [true],
    )[0],
    canCreateCustomObjectData: check(
      [PERMISSION_KEY.customObjectsDataCreate],
      [true],
    )[0],
    canEditCustomObjectData: check(
      [PERMISSION_KEY.customObjectsDataEdit],
      [true],
    )[0],

    canDeleteAnyCustomObjectData: check(
      [PERMISSION_KEY.customObjectsDataDelete],
      [true],
    )[0],
    canDeleteCustomObjectData(data: CustomObjectData) {
      return check(
        [PERMISSION_KEY.customObjectsDataDelete],
        [isDeletableLegacy(data)],
      )[0];
    },

    canManageCustomObjectSettings: check(
      [PERMISSION_KEY.customObjectsSettingsManage],
      [true],
    )[0],
  };
}
