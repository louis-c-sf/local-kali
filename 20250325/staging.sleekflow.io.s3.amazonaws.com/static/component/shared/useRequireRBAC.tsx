import useRouteConfig from "config/useRouteConfig";
import { useEffect, useMemo } from "react";
import { useHistory } from "react-router";
import { PermissionKey } from "types/Rbac/permission";
import { usePermission } from "./usePermission";

export function useRequireRBAC(
  keys: PermissionKey[],
  oldPermissionRoles?: boolean[]
) {
  const history = useHistory();
  const { routeTo } = useRouteConfig();
  const { check, isLoading: isPermissionLoading } = usePermission();

  const hasPermissions = useMemo(
    () =>
      check(Array.isArray(keys) ? keys : [keys], oldPermissionRoles).every(
        Boolean
      ),
    [check, keys, oldPermissionRoles]
  );

  useEffect(() => {
    if (!hasPermissions && !isPermissionLoading) {
      history.push(routeTo("/access-denied"));
    }
  }, [hasPermissions, history, isPermissionLoading, routeTo]);
}
