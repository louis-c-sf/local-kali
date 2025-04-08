import { postWithExceptions } from "api/apiRequest";
import { useAppSelector } from "AppRootContext";
import { equals } from "ramda";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ApiSuccessResponseTemplate } from "types/ApiTypes";
import { PermissionKeyFromServer } from "types/Rbac/permission";

interface CompanyRBACContextProps {
  permissions?: PermissionKeyFromServer[];
  isLoading: boolean;
  refetch: () => void;
}

export const USER_PERMISSION_STORAGE_KEY = "user.permission.map";
const cached = localStorage.getItem(USER_PERMISSION_STORAGE_KEY);

const CompanyRBACContext = createContext<CompanyRBACContextProps>({
  permissions: cached ? JSON.parse(cached) : undefined,
  isLoading: false,
  refetch: () => {},
});

interface CompanyRBACProviderProps {
  children: ReactNode;
}

export const CompanyRBACProvider = ({ children }: CompanyRBACProviderProps) => {
  const companyId = useAppSelector((s) => s.company?.id ?? "");
  const isRbacEnabled = useAppSelector((s) => s.isRbacEnabled);
  const myProfile = useAppSelector((s) => s.loggedInUserDetail, equals);

  const rbacRoles = useMemo(
    () =>
      (
        myProfile?.rbacRoles?.map((role) => role.role_name) || [
          myProfile?.roleType,
        ]
      ).filter((r): r is string => !!r),
    [myProfile?.rbacRoles, myProfile?.roleType]
  );

  const [data, setData] = useState<PermissionKeyFromServer[] | undefined>(
    () => {
      const cache = localStorage.getItem(USER_PERMISSION_STORAGE_KEY);
      return cache ? JSON.parse(cache) : undefined;
    }
  );
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = useCallback(() => {
    if (companyId && isRbacEnabled && rbacRoles.length > 0 && !isLoading) {
      setIsLoading(true);
      Promise.all(
        rbacRoles.map(async (roleName) => {
          const result = await postWithExceptions<
            ApiSuccessResponseTemplate<{
              permissions: PermissionKeyFromServer[];
            }>
          >("/v1/tenant-hub/authorized/Rbac/GetCompanyPolicies", {
            param: {
              role: roleName,
              company_id: companyId,
            },
          });

          if (!("permissions" in result.data)) {
            throw new Error("Invalid response");
          }

          return result.data.permissions;
        })
      )
        .then((results) => {
          const merged = [...new Set(results.flat())];
          setData(merged);
          localStorage.setItem(
            USER_PERMISSION_STORAGE_KEY,
            JSON.stringify(merged)
          );
        })
        .finally(() => {
          setIsLoading(false);
          fetched.current = true;
        });
    }
  }, [companyId, isLoading, isRbacEnabled, rbacRoles]);

  const fetched = useRef(false);
  useEffect(() => {
    if (!fetched.current) {
      fetchData();
    }
  }, [fetchData]);

  const value = useMemo(
    () => ({
      permissions: isRbacEnabled ? data : [],
      refetch: fetchData,
      isLoading,
    }),
    [data, fetchData, isLoading, isRbacEnabled]
  );

  return (
    <CompanyRBACContext.Provider value={value}>
      {children}
    </CompanyRBACContext.Provider>
  );
};

export const useGetPermissionListByRoleNameQueries = () => {
  return useContext(CompanyRBACContext);
};
