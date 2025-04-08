import { postWithExceptions } from "api/apiRequest";
import { useAppSelector } from "AppRootContext";
import { useCompanyPolicies } from "component/Settings/SettingInbox/Inbox/CompanyPoliciesContext";
import { useCallback, useMemo, useState } from "react";

export const useBulkUpdatePermission = () => {
  const {
    data: rolesWithPolicies,
    refetch,
    resetToggledRoles,
  } = useCompanyPolicies();
  const isRbacEnabled = useAppSelector((s) => s.isRbacEnabled);
  const companyId = useAppSelector((s) => s.company?.id ?? "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const rolesWithPoliciesSet = useMemo(
    () =>
      rolesWithPolicies?.reduce(
        (acc, r) => ({
          ...acc,
          [r.role_id]: r.permissionSet,
        }),
        {} as Record<string, Set<string>>
      ) || {},
    [rolesWithPolicies]
  );

  const bulkUpdateCompanyPolicies = useCallback(
    async (toggledRoles: Set<string>) => {
      if (!isRbacEnabled) {
        return;
      }
      setIsLoading(true);

      const modificationsMap = Array.from(toggledRoles).reduce(
        (acc, key) => {
          const [policy, roleId] = key.split("|");
          if (!acc[policy]) {
            acc[policy] = {
              permission: policy,
              role_ids_to_add: [],
              role_ids_to_remove: [],
            };
          }
          if (rolesWithPoliciesSet[roleId].has(policy)) {
            acc[policy].role_ids_to_remove.push(roleId);
          } else {
            acc[policy].role_ids_to_add.push(roleId);
          }

          return acc;
        },
        {} as Record<
          string,
          {
            permission: string;
            role_ids_to_add: string[];
            role_ids_to_remove: string[];
          }
        >
      );

      return postWithExceptions<{ data: { success: boolean } }>(
        "/v1/tenant-hub/authorized/Rbac/BulkUpdatePermission",
        {
          param: {
            company_id: companyId,
            modifications: Object.values(modificationsMap),
          },
          config: {
            baseURL: process.env.REACT_APP_SLEEKFLOW_API_URL,
          },
        }
      )
        .then((response) => {
          if (!response.data.success) {
            throw new Error("Failed to save company roles and policies");
          }
          return true;
        })
        .catch((error) => setError(error))
        .finally(async () => {
          setIsLoading(false);
          await refetch();
          resetToggledRoles();
        });
    },
    [companyId, isRbacEnabled, refetch, resetToggledRoles, rolesWithPoliciesSet]
  );

  return {
    isLoading,
    error,
    isError: error !== null,
    bulkUpdateCompanyPolicies,
  };
};
