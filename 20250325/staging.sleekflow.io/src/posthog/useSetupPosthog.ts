import { useEffect } from 'react';

import { useCompany } from '@/api/company';
import { getAppVersion } from '@/components/AccountSettingsMenu/MainPanel';
import { useMyProfile } from '@/hooks/useMyProfile';
import {
  DefaultPosthogGroupProperties,
  DefaultPosthogIdentityProperties,
} from '@/posthog/identity';
import { useTypedPosthog } from '@/posthog/useTypedPosthog';
import {
  fromApiBillRecordsToActiveBillRecord,
  transformPlanDetails,
} from '@/utils/billing';

export function useSetupPostHog() {
  const me = useMyProfile();
  const posthog = useTypedPosthog();
  const appVersion = getAppVersion();

  const company = useCompany({
    select: ({ id, companyName, billRecords, createdAt }) => {
      const activeBillRecord =
        fromApiBillRecordsToActiveBillRecord(billRecords);
      const planName = transformPlanDetails(
        activeBillRecord?.subscriptionPlan?.id,
      ).planName;

      return {
        id,
        companyName,
        subscriptionPlanId: activeBillRecord?.subscriptionPlan?.id,
        subscriptionPlan: planName ? planName : 'Unknown',
        createdAt,
      };
    },
  });

  useEffect(
    function setupIdentifyUser() {
      if (me.data && company.data) {
        const identityProperties = {
          company_id: company.data?.id,
          role_type: me.data?.roleType,
          staff_id: me.data?.staffId,
          user_id: me.data?.userInfo.id,
          email: me.data?.userInfo.email,
          name: me.data?.userInfo.displayName,
          phone_number: me.data?.userInfo.phoneNumber,
          status: me.data?.status,
          sf_app_version: appVersion,
          user_creation_date: me.data?.userInfo.createdAt,
        } satisfies DefaultPosthogIdentityProperties;

        const groupProperties = {
          subscription_plan: company.data?.subscriptionPlan,
          company_id: company.data?.id,
          company_name: company.data?.companyName,
          company_creation_date: company.data?.createdAt,
          subscription_plan_id: company.data?.subscriptionPlanId,
        } satisfies DefaultPosthogGroupProperties;

        posthog.identify(me.data.userInfo.id, identityProperties);
        posthog.group('company', company.data.id, groupProperties);
        posthog.group(
          `subscription_plan_${company.data?.subscriptionPlan}`,
          company.data.id,
          groupProperties,
        );
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [me.data, company?.data],
  );
}
