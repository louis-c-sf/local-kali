import { usePermissionWrapper } from '@/hooks/usePermission';
import { PERMISSION_KEY } from '../../../constants/permissions';
import { RoleType } from '../../../api/types';
import { useSuspenseMyProfile } from '../../../hooks/useMyProfile';

export function useContactSettingsAccessControl() {
  const { check } = usePermissionWrapper({ suspense: true });
  const myProfileQuery = useSuspenseMyProfile();
  const myProfile = myProfileQuery.data;

  const isAdmin = myProfile?.roleType === RoleType.ADMIN;

  return {
    canAccessLabels: check(
      [PERMISSION_KEY.contactsSettingsLabelsView],
      [isAdmin],
    )[0],
    canCreateLabels: check(
      [PERMISSION_KEY.contactsSettingsLabelsCreate],
      [isAdmin],
    )[0],
    canEditLabels: check(
      [PERMISSION_KEY.contactsSettingsLabelsEdit],
      [isAdmin],
    )[0],
    canDeleteLabels: check(
      [PERMISSION_KEY.contactsSettingsLabelsDelete],
      [isAdmin],
    )[0],

    canAccessCustomFields: check(
      [PERMISSION_KEY.contactsSettingsCustomFieldsView],
      [true],
    )[0],
    canCreateCustomFields: check(
      [PERMISSION_KEY.contactsSettingsCustomFieldsCreate],
      [true],
    )[0],
    canEditCustomFields: check(
      [PERMISSION_KEY.contactsSettingsCustomFieldsEdit],
      [true],
    )[0],
    canDeleteCustomFields: check(
      [PERMISSION_KEY.contactsSettingsCustomFieldsDelete],
      [true],
    )[0],
  };
}
