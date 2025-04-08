import { RoleType } from '@/api/types';
import { PermissionKey } from '@/constants/permissions';
import { AccessDeniedError } from '@/errors/AccessDeniedError';
import { usePermissionWrapper } from '@/hooks/usePermission';
import { useSuspenseAccessRuleGuard } from '@/pages/Contacts/shared/accessRuleGuard/useAccessRuleGuard';
import { useMemo } from 'react';

export function useRequireRBAC(
  keys: PermissionKey[],
  oldPermissionRoles: RoleType[] = [RoleType.ADMIN],
) {
  const { check, isLoading: isPermissionLoading } = usePermissionWrapper();
  const { user } = useSuspenseAccessRuleGuard();

  const hasLegacyPermission = useMemo(
    () => oldPermissionRoles.includes(user.data?.roleType),
    [oldPermissionRoles, user.data?.roleType],
  );

  const hasPermissions = useMemo(
    () =>
      check(
        keys,
        keys.map(() => hasLegacyPermission),
      ).every(Boolean),
    [check, hasLegacyPermission, keys],
  );

  if (!hasPermissions && !isPermissionLoading) {
    throw new AccessDeniedError();
  }

  return;
}
