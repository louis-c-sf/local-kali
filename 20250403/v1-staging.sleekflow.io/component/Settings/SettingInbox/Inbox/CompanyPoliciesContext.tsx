import { useCompanyRolesWithPolicies } from "api/Setting/useCompanyRolesWithPolicies";
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { PermissionKeyFromServer } from "types/Rbac/permission";

interface CompanyPoliciesContextProps
  extends ReturnType<typeof useCompanyRolesWithPolicies> {
  isDirty: boolean;
  toggledRoles: Set<string>;
  toggleRole: (roleId: string, policy: PermissionKeyFromServer) => void;
  resetToggledRoles: () => void;
}

const CompanyPoliciesContext = createContext<
  CompanyPoliciesContextProps | undefined
>(undefined);

export const CompanyPoliciesProvider: React.FC = ({ children }) => {
  const rolesWithPolicies = useCompanyRolesWithPolicies();
  const [toggledRoles, setToggledRoles] = useState(() => new Set<string>());

  const toggleRole = useCallback(
    (roleId: string, policy: PermissionKeyFromServer) => {
      setToggledRoles((prev) => {
        const key = `${policy}|${roleId}`;
        prev.has(key) ? prev.delete(key) : prev.add(key);
        return new Set(prev);
      });
    },
    []
  );

  const resetToggledRoles = useCallback(() => {
    setToggledRoles(new Set());
  }, []);

  const isDirty = toggledRoles.size > 0;

  const context = useMemo(
    () => ({
      ...rolesWithPolicies,
      toggledRoles,
      toggleRole,
      resetToggledRoles,
      isDirty,
    }),
    [rolesWithPolicies, toggledRoles, toggleRole, resetToggledRoles, isDirty]
  );

  return (
    <CompanyPoliciesContext.Provider value={context}>
      {children}
    </CompanyPoliciesContext.Provider>
  );
};

export const useCompanyPolicies = () => {
  const context = useContext(CompanyPoliciesContext);
  if (context === undefined) {
    throw new Error(
      "useCompanyPolicies must be used within a CompanyPoliciesProvider"
    );
  }
  return context;
};
