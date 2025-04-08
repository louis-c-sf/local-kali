import { useMemo } from "react";
import { AccessRulesGuard } from "../helpers/AccessRulesGuard";
import { useAppSelector } from "../../../AppRootContext";
import { equals } from "ramda";
import { useAuth0 } from "@auth0/auth0-react";

export function useAccessRulesGuard() {
  const { company, userId, staffList, loggedInUserDetail, currentPlan, usage } =
    useAppSelector(
      (s) => ({
        userId: s.user?.id,
        staffList: s.staffList,
        loggedInUserDetail: s.loggedInUserDetail,
        company: s.company,
        currentPlan: s.currentPlan,
        usage: s.usage,
      }),
      equals
    );

  const { user } = useAuth0();
  return useMemo(() => {
    return new AccessRulesGuard(
      userId,
      loggedInUserDetail,
      staffList,
      company,
      currentPlan,
      usage.booted ? usage : undefined,
      user
    );
  }, [userId, loggedInUserDetail, staffList, company, usage.booted]);
}
