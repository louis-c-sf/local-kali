import { Box, Stack } from '@mui/material';
import * as Sentry from '@sentry/react';
import { useQueryClient } from '@tanstack/react-query';
import dayjs, { Dayjs } from 'dayjs';
import mixpanel from 'mixpanel-browser';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation } from 'react-router-dom';

import AppVersionUpdateToast from '@/AppVersionUpdateToast';
import { GlobalBanner } from '@/GlobalBanner';
import { LowBandwidthModeToast } from '@/LowBandwidthModeToast';
import { OfflineToast } from '@/OfflineToast';
import { useAuth0EmailVerifiedSyncQuery } from '@/api/auth0Account';
import { useCompany } from '@/api/company';
import { type Company } from '@/api/types';
import AppLoading from '@/components/AppLoading';
import Navbar from '@/components/Navbar';
import PushNotification from '@/components/PushNotification';
import useAIStatusLongPolling from '@/hooks/useAIStatusLongPolling';
import { useAuth } from '@/hooks/useAuth';
import { useMyProfile } from '@/hooks/useMyProfile';
import { usePlanMigrationAlert } from '@/hooks/usePlanMigrationAlert';
import { useV10MigrationOpInAlert } from '@/hooks/useV10MigrationOpInAlert';
import { useV10MigrationPaymentFailedAlert } from '@/hooks/useV10MigrationPaymentFailedAlert';
import { useWhatsappLowBalanceAlerts } from '@/hooks/useWhatsappLowBalanceAlerts';
import { useFlowBuilderRunLimitAlert } from '@/pages/FlowBuilder/hooks/useFlowBuilderRunLimitAlert';
import { useSetupPostHog } from '@/posthog/useSetupPosthog';
import {
  fromApiBillRecordsToActiveBillRecord,
  transformPlanDetails,
} from '@/utils/billing';
import { getAuthType, getDeviceType, getLanguage } from '@/utils/mixpanelLibs';
import { queryKeysToPersist } from '@/utils/queryPersister';
import { useWhatsappNumberLowQualityAlert } from '@/hooks/useWhatsappNumberLowQualityAlert';

export default function AuthenticatedLayout() {
  useRevalidatePersistedQueries();
  useAnalytics();
  useAIStatusLongPolling();
  useFlowBuilderRunLimitAlert();
  useWhatsappLowBalanceAlerts();
  useWhatsappNumberLowQualityAlert();
  useEmailVerifiedSync();
  useKeepMeSignIn();
  usePlanMigrationAlert();
  useV10MigrationPaymentFailedAlert();
  useV10MigrationOpInAlert();

  const navBar = useMemo(() => <Navbar />, []);

  return (
    <>
      <Helmet>
        <meta name="viewport" content="width=device-width, initial-scale=0.1" />
      </Helmet>
      <Stack height="100svh">
        <GlobalBanner />
        <PushNotification />
        {import.meta.env.PROD && <AppVersionUpdateToast />}
        <OfflineToast />
        <LowBandwidthModeToast />
        <Box
          data-testid={'app-authenticated-layout'}
          display="flex"
          flex="1 1 auto"
          overflow="hidden"
        >
          {navBar}
          <Stack component="main" flex={1} minWidth={0}>
            <Suspense fallback={<AppLoading withoutNavbar />}>
              <Outlet />
            </Suspense>
          </Stack>
        </Box>
      </Stack>
    </>
  );
}

const useRevalidatePersistedQueries = () => {
  const queryClient = useQueryClient();
  useEffect(() => {
    queryKeysToPersist.forEach((queryKey) =>
      queryClient.refetchQueries({
        queryKey,
        predicate: (query) => query.state.fetchStatus !== 'fetching',
      }),
    );
  }, [queryClient]);
};

function useEmailVerifiedSync() {
  const staffInfo = useMyProfile();
  useAuth0EmailVerifiedSyncQuery({
    enabled:
      (!staffInfo.isLoading &&
        !staffInfo.data?.userInfo.emailConfirmed &&
        staffInfo.data?.auth0User?.[
          'https://app.sleekflow.io/connection_strategy'
        ] === 'auth0') ||
      false,
  });
}
function useKeepMeSignIn() {
  const { user, logout } = useAuth();
  const [timeLimit, setTimeLimit] = useState<Dayjs>();
  const location = useLocation();
  const signinDateTime = user?.['https://app.sleekflow.io/is_keep_me_signin'];
  useEffect(() => {
    const parsedTime = dayjs(signinDateTime);
    if (parsedTime.isValid()) {
      setTimeLimit(parsedTime.add(24, 'hour'));
    }
  }, [signinDateTime]);

  useEffect(() => {
    const now = dayjs();
    const isExceeded = now.isAfter(timeLimit);

    if (isExceeded) {
      // logout({ logEvent: 'web_logout_keep_me_signin_timeout' });
    }
  }, [location.pathname, logout, timeLimit]);
}

function useAnalytics() {
  const location = useLocation();
  const staffInfo = useMyProfile();
  const {
    i18n: { language },
  } = useTranslation();
  useSetupPostHog();
  const company = useCompany({
    select: useCallback(
      ({ id, companyName, billRecords, createdAt }: Company) => {
        const activeBillRecord =
          fromApiBillRecordsToActiveBillRecord(billRecords);
        const planName = transformPlanDetails(
          activeBillRecord?.subscriptionPlan?.id,
        ).planName;

        return {
          id,
          companyName,
          subscriptionPlan: planName ? titleCase(planName) : 'Unknown',
          createdAt,
        };
      },
      [],
    ),
  });

  useEffect(() => {
    if (!staffInfo.data || !company.data) return;

    const { firstName, lastName, displayName } = staffInfo.data.userInfo;

    const username =
      firstName && lastName ? `${firstName} ${lastName}` : displayName;

    // Sentry
    Sentry.setUser({
      id: staffInfo.data.userInfo.id,
      companyId: company.data.id,
      userId: staffInfo.data.userInfo.id,
      username,
      email: staffInfo.data.userInfo.email,
      staffId: staffInfo.data.staffId,
      associatedTeams: JSON.stringify(staffInfo.data.associatedTeams),
      userRole: staffInfo.data.userInfo.userRole,
      createdAt: staffInfo.data.userInfo.createdAt,
      roleType: staffInfo.data.roleType,
      locale: staffInfo.data.locale,
      timeZoneInfo: JSON.stringify(staffInfo.data.timeZoneInfo),
      status: staffInfo.data.status,
    });

    // Mixpanel
    mixpanel.identify(staffInfo.data.userInfo.id);
    mixpanel.register({
      $email: staffInfo.data.userInfo.email,
      Role: staffInfo.data.userInfo.userRole,
      'Subscription Plan': company.data.subscriptionPlan,
      Platform: 'Web v2',
      language: getLanguage(language),
      'Device Type': getDeviceType(),
      'Web App Version': import.meta.env.VITE_WEB_APP_VERSION,
    });
    mixpanel.people.set({
      'Company ID': company.data.id,
      'Company Name': company.data.companyName,
      $email: staffInfo.data.userInfo.email,
      $name: username,
      Username: username,
      'User Role': staffInfo.data.roleType,
      'Subscription Plan': company.data.subscriptionPlan,
      'Authentication Method': getAuthType(
        staffInfo.data.auth0User?.[
          'https://app.sleekflow.io/connection_strategy'
        ],
      ),
      'Company Creation Time': company.data.createdAt,
    });
    mixpanel.track('Session Initialized');

    return () => {
      mixpanel.reset();
    };
  }, [staffInfo.data, company.data, language]);

  // Track page view since Mixpanel doesn't track it automatically on SPA
  useEffect(() => {
    if (!staffInfo.data || !company.data) return;

    const { email, userRole } = staffInfo.data.userInfo;
    // Wait and add user info manually to skip the initial page view tracking that has no user info
    mixpanel.track_pageview({
      $email: email,
      Role: userRole,
      'Subscription Plan': company.data.subscriptionPlan,
      Platform: 'Web v2',
    });
  }, [location.pathname, staffInfo.data, company.data]);
}

function titleCase(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
