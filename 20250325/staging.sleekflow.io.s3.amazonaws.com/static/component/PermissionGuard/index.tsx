import { usePermission } from "component/shared/usePermission";
import type { PermissionKey } from "types/Rbac/permission";

import { useMemo } from "react";

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
}: PermissionGuardProps) {
  const { isLoading, check } = usePermission();

  const hasPermissions = useMemo(() => {
    return check(
      Array.isArray(keys) ? keys : [keys],
      Array.isArray(oldAccessControls) || oldAccessControls === undefined
        ? oldAccessControls
        : [oldAccessControls]
    ).every(Boolean);
  }, [check, keys, oldAccessControls]);

  if (!isLoading && !hasPermissions) {
    return null;
  }

  return typeof children === "function" ? children(isLoading) : children;
}
