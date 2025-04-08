import { useMemo } from 'react';

import { PermissionKey } from '@/constants/permissions';
import { AccessDeniedError } from '@/errors/AccessDeniedError';
import { usePermissionWrapper } from '@/hooks/usePermission';

export interface PermissionGuardProps {
  keys: PermissionKey | PermissionKey[];
  oldAccessControls?: boolean | boolean[];
  children?: React.ReactNode | ((isLoading: boolean) => React.ReactNode);
  throwOnError?: boolean;
}

export function PermissionGuard({
  keys,
  oldAccessControls,
  children,
  throwOnError = false,
}: PermissionGuardProps) {
  const { isLoading, check } = usePermissionWrapper();

  const hasPermissions = useMemo(() => {
    return check(
      Array.isArray(keys) ? keys : [keys],
      oldAccessControls === undefined || Array.isArray(oldAccessControls)
        ? oldAccessControls
        : [oldAccessControls],
    ).every(Boolean);
  }, [check, keys, oldAccessControls]);

  if (!isLoading && !hasPermissions) {
    if (throwOnError) {
      throw new AccessDeniedError();
    }
    return null;
  }

  return typeof children === 'function' ? children(isLoading) : children;
}
