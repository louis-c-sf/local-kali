import { FeatureFlagName, useFeatureFlagEnabledMap } from '@/api/featureFlag';
import { RbacDefaultRole } from '@/api/types';
import { PermissionKey } from '@/constants/permissions';
import { useMyProfile } from '@/hooks/useMyProfile';
import { usePermissionWrapper, CheckWrapper } from '@/hooks/usePermission';
import { useAISettingsRoleBasedAccessControl } from '@/pages/AiSettings/hooks/useAISettingsRoleBasedAccessControl';
import { useAnalyticsRoleBasedAccessControl } from '@/pages/Analytics/hooks/useAnalyticsRoleBasedAccessControl';
import { useBroadcastRoleBasedAccessControl } from '@/pages/Broadcasts/hooks/useBroadcastRoleBasedAccessControl';
import { useChannelsRulesGuard } from '@/pages/Channels/hooks/useChannelsRulesGuard';
import useCustomObjectDataAccessControl from '@/pages/CustomObjectData/hooks/useCustomObjectDataAccessControl';
import { useFlowBuilderRoleBasedAccessControl } from '@/pages/FlowBuilder/hooks/useFlowBuilderRoleBasedAccessControl';
import { useIntegrationsRoleBasedAccessControl } from '@/pages/Integrations/hooks/useIntegrationsRoleBasedAccessControl';
import { useUserManagementRuleGuard } from '@/pages/Settings/hooks/useCompanySettingsRuleGuard';

import { useCommerceHubAccessControl } from '../../pages/Commerce/hooks/useCommerceHubAccessControl';
import { useContactsAccessControl } from '../../pages/Contacts/hooks/useContactsAccessControl';

export type OldAccessControlContext = ReturnType<
  typeof useBroadcastRoleBasedAccessControl
> &
  ReturnType<typeof useFlowBuilderRoleBasedAccessControl> &
  ReturnType<typeof useAISettingsRoleBasedAccessControl> &
  ReturnType<typeof useIntegrationsRoleBasedAccessControl> &
  ReturnType<typeof useAnalyticsRoleBasedAccessControl> &
  ReturnType<typeof useCustomObjectDataAccessControl> &
  ReturnType<typeof useChannelsRulesGuard> &
  ReturnType<typeof useContactsAccessControl> &
  ReturnType<typeof useCommerceHubAccessControl> &
  ReturnType<typeof useUserManagementRuleGuard>;

export interface CustomConditionContext {
  defaultRole: RbacDefaultRole;
  oldAccessControl: OldAccessControlContext;
  isEnabledRbac: boolean;
  checkPermission: CheckWrapper;
  companyEnabledFeatureFlagMap?: Record<FeatureFlagName, boolean>;
}

export function useModuleVisibleControl(): ({
  permissionKey,
  oldAccessControlKey,
  customCondition,
}: {
  permissionKey?: PermissionKey;
  oldAccessControlKey?: keyof OldAccessControlContext;
  customCondition?: (context: CustomConditionContext) => boolean;
}) => boolean {
  const { data: myProfile } = useMyProfile();
  const defaultRole = (myProfile?.rbacRoles?.find((role) => role.is_default)
    ?.role_name || myProfile?.roleType) as RbacDefaultRole | undefined;
  const { check: checkPermission, isEnabledRbac } = usePermissionWrapper();

  const broadcastPermission = useBroadcastRoleBasedAccessControl();
  const flowBuilderPermission = useFlowBuilderRoleBasedAccessControl();
  const aiSettingsPermission = useAISettingsRoleBasedAccessControl();
  const integrationsPermission = useIntegrationsRoleBasedAccessControl();
  const analyticsPermission = useAnalyticsRoleBasedAccessControl();
  const customObjectDataPermission = useCustomObjectDataAccessControl();
  const channelsPermission = useChannelsRulesGuard();
  const contactsAccessControl = useContactsAccessControl();
  const userManagementPermission = useUserManagementRuleGuard();
  const commerceAccessControl = useCommerceHubAccessControl();

  const oldAccessControl = {
    ...broadcastPermission,
    ...flowBuilderPermission,
    ...aiSettingsPermission,
    ...integrationsPermission,
    ...analyticsPermission,
    ...customObjectDataPermission,
    ...channelsPermission,
    ...contactsAccessControl,
    ...userManagementPermission,
    ...commerceAccessControl,
  } as const;
  const companyEnabledFeatureFlagMap = useFeatureFlagEnabledMap();

  return ({ permissionKey, oldAccessControlKey, customCondition }) => {
    if (customCondition) {
      return (
        defaultRole &&
        customCondition({
          defaultRole,
          oldAccessControl,
          isEnabledRbac,
          checkPermission,
          companyEnabledFeatureFlagMap,
        })
      );
    }
    return validateAccessControlRequest(
      permissionKey,
      oldAccessControlKey,
      oldAccessControl,
      isEnabledRbac,
      checkPermission,
    );
  };
}

export function validateAccessControlRequest(
  permissionKey: PermissionKey | undefined,
  oldAccessControlKey: keyof OldAccessControlContext | undefined,
  oldAccessControl: OldAccessControlContext,
  isEnabledRbac: boolean,
  checkPermission: CheckWrapper,
) {
  const noNeedAccessControl = !oldAccessControlKey && !permissionKey;
  if (noNeedAccessControl) {
    return true;
  }
  if (isEnabledRbac && permissionKey) {
    return checkPermission([permissionKey])[0];
  }
  if (!oldAccessControlKey) {
    return true;
  }
  return (
    oldAccessControl[oldAccessControlKey] === undefined ||
    oldAccessControl[oldAccessControlKey]
  );
}
