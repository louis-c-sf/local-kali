import { useMyProfile } from '../../../../hooks/useMyProfile';
import { RoleType } from '../../../../api/types';
import { useSuspenseAccessRuleGuard } from '../../../Contacts/shared/accessRuleGuard/useAccessRuleGuard';
import { useSuspenseCompany } from '../../../../api/company';
import { usePermissionWrapper } from '../../../../hooks/usePermission';
import { PERMISSION_KEY } from '../../../../constants/permissions';

const COMPANIES_TEST_PRIVACY =
  import.meta.env.VITE_COMPANIES_TEST_PRIVACY ?? '';

export function useDataPrivacyAccessControl() {
  const { data: myProfile } = useMyProfile();
  const roleMatch = myProfile?.roleType === RoleType.ADMIN;

  const accessRulesGuard = useSuspenseAccessRuleGuard();
  const addOnStatus = accessRulesGuard.company.data?.addOnPlanStatus;
  const companyId = useSuspenseCompany({
    select: (data) => data.id,
  });
  const envMatch =
    COMPANIES_TEST_PRIVACY.includes(companyId.data) &&
    import.meta.env.VITE_USER_NODE_ENV !== 'production';
  const featureMatch = addOnStatus?.isPiiMaskingEnabled || envMatch;

  const isAllowViewLegacy = roleMatch && featureMatch;

  const { check } = usePermissionWrapper({ suspense: true });

  return {
    canAccessDataPrivacySettings:
      featureMatch &&
      check([PERMISSION_KEY.privacySettingsDataAccess], [isAllowViewLegacy])[0],
    canEditMask:
      featureMatch &&
      check([PERMISSION_KEY.privacySettingsDataEdit], [isAllowViewLegacy])[0],
    canCreateMask:
      featureMatch &&
      check([PERMISSION_KEY.privacySettingsDataCreate], [isAllowViewLegacy])[0],
    canDeleteMask:
      featureMatch &&
      check([PERMISSION_KEY.privacySettingsDataDelete], [isAllowViewLegacy])[0],
  };
}
