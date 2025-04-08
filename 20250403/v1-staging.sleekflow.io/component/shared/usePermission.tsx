import { useCallback } from "react";

import { axiosObservableInstance, useAppSelector } from "AppRootContext";
import { equals } from "ramda";
import { isAdminRole } from "component/Settings/helpers/AccessRulesGuard";
import { PERMISSION_DICT, PermissionKey } from "types/Rbac/permission";
import { useGetPermissionListByRoleNameQueries } from "api/Setting/CompanyRBACContext";

export function usePermission() {
  const { permissions: data, isLoading } =
    useGetPermissionListByRoleNameQueries();

  const isRbacEnabled = useAppSelector((s) => s.isRbacEnabled);
  const loggedInUserDetail = useAppSelector(
    (s) => s.loggedInUserDetail,
    equals
  );
  const isAdmin = loggedInUserDetail ? isAdminRole(loggedInUserDetail) : false;
  const check = useCallback(
    (permissions: PermissionKey[], oldPermission?: boolean[]) => {
      if (!isRbacEnabled) {
        return oldPermission ?? permissions.map(() => true);
      }

      const allowedPermission = permissions.map((key) => PERMISSION_DICT[key]);
      axiosObservableInstance.interceptors.request.use(async (config) => {
        const flattened = allowedPermission.flat();
        if (flattened.length === 0) {
          return config;
        } else {
          config.headers = {
            ...config.headers,
            "X-Sleekflow-Rbac-Key": flattened.join(","),
          };
          return config;
        }
      });
      return allowedPermission.map((currentResource) =>
        currentResource?.every((item) => data?.includes(item))
      );
    },
    [data, isRbacEnabled]
  );

  return {
    isLoading,
    check,
    isAdmin,
  };
}
