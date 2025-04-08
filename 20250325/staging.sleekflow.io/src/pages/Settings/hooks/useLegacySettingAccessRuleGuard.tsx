import { useIsTicketingEnabled } from '@/api/ticketing';
import { PERMISSION_KEY } from '@/constants/permissions';
import { useMyProfile } from '@/hooks/useMyProfile';
import { usePermissionWrapper } from '@/hooks/usePermission';
import useCustomObjectDataAccessControl from '@/pages/CustomObjectData/hooks/useCustomObjectDataAccessControl';

import { useContactSettingsAccessControl } from '../../Contacts/hooks/useContactSettingsAccessControl';
import { useDataPrivacyAccessControl } from '../SettingsDataPrivacy/hooks/useDataPrivacyAccessControl';

export const useSettingAccessRuleGuard = () => {
  const { data: isTicketingEnabled, isLoading: isLoadingIsTicketingEnabled } =
    useIsTicketingEnabled();
  const { data: myProfile } = useMyProfile();
  const isSuperAdmin = (): boolean => !!myProfile?.isCompanyOwner;
  const isAdmin = (): boolean => {
    return myProfile?.roleType === 'Admin';
  };

  const { check, isLoading } = usePermissionWrapper();

  const {
    canAccessCustomObjectFeature,
    canManageCustomObjectSettings,
    isLoading: isCheckingCustomObjectAccess,
  } = useCustomObjectDataAccessControl();

  const contactsSettingsAccessControl = useContactSettingsAccessControl();

  const isInboxSettingsAllowToView = () =>
    check([PERMISSION_KEY.inboxSettingsManage], [isAdmin()])[0];

  const isManageCustomObjectsAllowToView = () => {
    if (!canManageCustomObjectSettings) return false;
    return isCheckingCustomObjectAccess || canAccessCustomObjectFeature;
  };

  const isConversionLoggingAllowToView = check(
    [PERMISSION_KEY.contactsSettingsConversionLoggingAccess],
    [isAdmin() || isSuperAdmin()],
  )[0];

  const isLabelsAllowToManage = contactsSettingsAccessControl.canAccessLabels;
  const isCustomFieldsAllowToManage =
    contactsSettingsAccessControl.canAccessCustomFields;

  const { canAccessDataPrivacySettings: isDataPrivacyAllowToView } =
    useDataPrivacyAccessControl();

  const isDeletedContactAllowToView = () =>
    check([PERMISSION_KEY.contactsSettingsDeletedView], [isAdmin()])[0];
  const isTicketingManagementAllowToView =
    isTicketingEnabled &&
    check([PERMISSION_KEY.ticketingManage], [isAdmin()])[0];

  const canEditCompanySleekFlowLabFeatures = isAdmin();

  const isIntegrationDisconnectAlertAllowToView = () => isAdmin();

  return {
    isAccessControlLoading: isLoading || isLoadingIsTicketingEnabled,
    canEditCompanySleekFlowLabFeatures,
    isInboxSettingsAllowToView,
    isManageCustomObjectsAllowToView,
    isConversionLoggingAllowToView,
    isDataPrivacyAllowToView,
    isLabelsAllowToManage,
    isCustomFieldsAllowToManage,
    isDeletedContactAllowToView,
    isTicketingManagementAllowToView,
    isIntegrationDisconnectAlertAllowToView,
  };
};
