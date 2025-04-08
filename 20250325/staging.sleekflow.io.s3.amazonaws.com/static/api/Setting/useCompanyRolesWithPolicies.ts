import { postWithExceptions } from "api/apiRequest";
import type { PermissionKeyFromServer } from "types/Rbac/permission";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAppSelector } from "AppRootContext";

interface RoleWithPolicies {
  permissions: PermissionKeyFromServer[];
  role_id: string;
  role_name: string;
  permissionSet: Set<PermissionKeyFromServer>;
}

interface Response {
  data: {
    roles_with_policies: Omit<RoleWithPolicies, "permissionSet">[];
  };
}

export const useCompanyRolesWithPolicies = () => {
  const isRbacEnabled = useAppSelector((s) => s.isRbacEnabled);
  const [data, setData] = useState<RoleWithPolicies[] | undefined>();
  const [isLoading, setIsLoading] = useState(!!isRbacEnabled);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(
    async (refetch = false) => {
      if (!isRbacEnabled) {
        return;
      }
      if (!refetch) {
        setIsLoading(true);
      }
      return postWithExceptions<Response>(
        "/v1/tenant-hub/authorized/Rbac/GetCompanyRolesWithPolicies",
        {
          param: {},
          config: {
            baseURL: process.env.REACT_APP_SLEEKFLOW_API_URL,
          },
        }
      )
        .then((response) =>
          setData(
            response.data.roles_with_policies.map((r) => ({
              ...r,
              permissionSet: new Set(r.permissions),
            }))
          )
        )
        .catch((error) => setError(error))
        .finally(() => setIsLoading(false));
    },
    [isRbacEnabled]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return useMemo(
    () => ({
      data,
      isLoading,
      error,
      isError: error !== null,
      refetch: () => fetchData(true),
    }),
    [data, error, fetchData, isLoading]
  );
};
