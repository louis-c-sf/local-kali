import { useCallback, useMemo } from 'react';

import { useGetStaffOverview } from '@/api/company';
import { RoleType } from '@/api/types';
import { useSuspenseAccessRuleGuard } from '@/pages/Contacts/shared/accessRuleGuard/useAccessRuleGuard';

const useContactsFeatureFlags = () => {
  const accessRulesGuard = useSuspenseAccessRuleGuard();

  const { data: allStaff = [] } = useGetStaffOverview();

  const staffTeamsMap = useMemo(() => {
    const staffTeamsMap = new Map<number, number[]>();
    allStaff.forEach((s) => {
      staffTeamsMap.set(s.id, s.associatedTeamIds);
    });
    return staffTeamsMap;
  }, [allStaff]);

  const mainPlanName =
    accessRulesGuard.company.data!.currentPlan.transformedPlanDetails
      ?.planName ?? '';

  const canSeeShopifyContacts =
    accessRulesGuard.company.data!.addOnPlanStatus.isShopifyIntegrationEnabled;

  const canSeeTeamContacts = ['premium', 'enterprise'].includes(mainPlanName);

  const totalContacts = accessRulesGuard.company.data?.totalContacts ?? 0;
  const maximumContacts = accessRulesGuard.company.data?.maximumContacts;
  const isWithinContactsLimit =
    maximumContacts === undefined ? false : totalContacts < maximumContacts;

  const staffMatchesMyTeams = (staffId: number) => {
    const staffTeams = staffTeamsMap.get(staffId);
    if (!staffTeams) {
      return false;
    }
    const myTeams = accessRulesGuard?.user?.data?.associatedTeams ?? [];
    return staffTeams.some((staffTeamId) =>
      myTeams.some((myTeam) => parseInt(myTeam.id) === staffTeamId),
    );
  };

  const canEditRemark = useCallback(
    (staffCreatedId: string | null) => {
      const myID = accessRulesGuard?.user?.data?.staffId;
      const role = accessRulesGuard?.user?.data?.roleType;

      if (role === undefined) {
        return false;
      } else if (role === RoleType.ADMIN) {
        return true;
      }
      if (staffCreatedId && parseInt(staffCreatedId) === myID) {
        return true;
      }
      if (staffCreatedId && role === RoleType.TEAMADMIN) {
        return staffMatchesMyTeams(parseInt(staffCreatedId));
      }
      return false;
    },
    [
      accessRulesGuard?.user?.data?.staffId,
      accessRulesGuard?.user?.data?.roleType,
      staffMatchesMyTeams,
    ],
  );

  return {
    canSeeShopifyContacts,
    canSeeTeamContacts,
    isWithinContactsLimit,
    maximumContacts,
    isExpressImportEnabled:
      accessRulesGuard.company.data?.isExpressImportEnabled ?? false,
    canEditRemark,
  };
};

export default useContactsFeatureFlags;
