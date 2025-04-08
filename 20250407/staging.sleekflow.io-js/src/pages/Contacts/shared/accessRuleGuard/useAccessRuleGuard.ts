import { useMemo } from 'react';

import {
  useCompany,
  useSuspenseCompanyUsageQuery,
  useSuspenseCompany,
} from '@/api/company';
import { useMyProfile, useSuspenseMyProfile } from '@/hooks/useMyProfile';
import {
  transformPlanDetails,
  fromApiBillRecordsToActiveBillRecord,
} from '@/utils/billing';
import { isFreeOrFreemiumPlan } from '@/utils/subscription-plan-checker';

/* testing creating a global access rule guard
 * current thoughts are to split it into 2 hooks and combine into a super hook.
 * - useCompanyAccessRuleGuard hook are things that are limited to whole company (subscription plan, add ons, channels etc.)
 * - useUserAccessRuleGuard hook are specific to the person (role type, permissions, phone number masking etc.)
 * - where possible, don't use boolean types if the option has multiple possible values.
 *   - eg. for user role instead of returning things like isStaff, isAdmin, return the actual role
 *     to make it more extensible and minimise the number of things need to expose.
 * */

export const useCompanyAccessRuleGuard = () => {
  const { data: companyUsage } = useSuspenseCompanyUsageQuery();
  const company = useCompany({
    enabled: !!companyUsage,
    select: (data) => {
      const activeBillRecord = fromApiBillRecordsToActiveBillRecord(
        data.billRecords,
      );

      return {
        currentPlan: {
          billRecord: activeBillRecord,
          transformedPlanDetails: transformPlanDetails(
            activeBillRecord?.subscriptionPlan.id,
          ),
        },
        maximumAgents: data.maximumAgents,
        currentAgents: data.currentAgents,
        maximumWhatsappInstance: data.maximumWhatsappInstance,
        currentNumberOfCloudAPIChannels: data.whatsappCloudApiConfigs.length,
        maximumAutomations: data.maximumAutomations,
        maximumNumberOfChannel: companyUsage?.maximumNumberOfChannel ?? 0,
        remainingWhatappChannelQuota:
          data.maximumWhatsappInstance - data.whatsappCloudApiConfigs.length,
        remainingAgentQuota: data.maximumAgents - data.currentAgents,
        addOnPlanStatus: data.addonStatus,
        maximumContacts: companyUsage?.maximumContacts,
        totalContacts: companyUsage?.totalContacts,
        currentNumberOfChannel: companyUsage?.currentNumberOfChannels ?? 0,
        isExpressImportEnabled: data.isExpressImportEnabled,
      };
    },
  });

  const currentPlan = company.data?.currentPlan.billRecord?.subscriptionPlan;

  const canUsePayments = useMemo(() => {
    if (!currentPlan) {
      return false;
    }
    if (isFreeOrFreemiumPlan(currentPlan)) {
      return false;
    }
    return true;
  }, [JSON.stringify(currentPlan)]);

  return { ...company, canUsePayments };
};

export const useSuspenseCompanyAccessRuleGuard = () => {
  const { data: companyUsage } = useSuspenseCompanyUsageQuery();
  const company = useSuspenseCompany({
    select: (data) => {
      const activeBillRecord = fromApiBillRecordsToActiveBillRecord(
        data.billRecords,
      );

      return {
        currentPlan: {
          billRecord: activeBillRecord,
          transformedPlanDetails: transformPlanDetails(
            activeBillRecord?.subscriptionPlan.id,
          ),
        },
        maximumAgents: data.maximumAgents,
        currentAgents: data.currentAgents,
        maximumWhatsappInstance: data.maximumWhatsappInstance,
        currentNumberOfCloudAPIChannels: data.whatsappCloudApiConfigs.length,
        maximumAutomations: data.maximumAutomations,
        maximumNumberOfChannel: companyUsage?.maximumNumberOfChannel ?? 0,
        remainingWhatappChannelQuota:
          data.maximumWhatsappInstance - data.whatsappCloudApiConfigs.length,
        remainingAgentQuota: data.maximumAgents - data.currentAgents,
        addOnPlanStatus: data.addonStatus,
        maximumContacts: companyUsage?.maximumContacts,
        totalContacts: companyUsage?.totalContacts,
        currentNumberOfChannel: companyUsage?.currentNumberOfChannels ?? 0,
        isExpressImportEnabled: data.isExpressImportEnabled,
      };
    },
  });

  const currentPlan = company.data?.currentPlan.billRecord?.subscriptionPlan;

  const canUsePayments = useMemo(() => {
    if (!currentPlan) {
      return false;
    }
    if (isFreeOrFreemiumPlan(currentPlan)) {
      return false;
    }
    return true;
  }, [JSON.stringify(currentPlan)]);

  return { ...company, canUsePayments };
};

const useAccessRuleGuard = () => {
  const companyAccessRuleGuard = useCompanyAccessRuleGuard();
  const userAccessRuleGuard = useMyProfile();

  return {
    user: userAccessRuleGuard,
    company: companyAccessRuleGuard,
  };
};

const useSuspenseAccessRuleGuard = () => {
  const companyAccessRuleGuard = useSuspenseCompanyAccessRuleGuard();
  const userAccessRuleGuard = useSuspenseMyProfile();

  return {
    user: userAccessRuleGuard,
    company: companyAccessRuleGuard,
  };
};

export { useAccessRuleGuard, useSuspenseAccessRuleGuard };
