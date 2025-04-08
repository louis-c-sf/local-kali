import { CircularProgress, Link, Typography } from '@mui/material';
import { useEffect, useCallback } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';

import { GlobalBanners, useGlobalBanner } from '@/GlobalBanner';
import { useCompany } from '@/api/company';
import { useSubscribePlanMutation } from '@/api/stripe';
import { ROUTES } from '@/constants/navigation';
import { usePlansAndBillingsRuleGuard } from '@/pages/Settings/hooks/usePlansAndBillingsRuleGuard';
import { useGetMigrationSubscriptionPlanIdQuery } from '@/api/settings';
import { useSessionStorage } from 'react-use';
import {
  PlanActionDict,
  PlanActionInfoSession,
} from '@/pages/Settings/SettingsManagePlan/types';
import {
  fromApiBillRecordsToActiveBillRecord,
  transformPlanDetails,
} from '@/utils/billing';
import {
  SUBSCRIPTION_NAME,
  SUBSCRIPTION_PERIODS,
  SubscriptionPeriod,
  SubscriptionPlanName,
} from '@/constants/subscription-plans';
import { isLegacyPlan } from '@/utils/subscription-plan-checker';
import { useGetIsFeatureFlagsEnabledQuery } from '@/api/common';
import { TIERS } from './useGetPlanKeyAndTier';
import useDailyAlertDismissChecker from './useDailyAlertDismissChecker';
import { MigrationStatusDict } from '@/api/types';

//TODO: feature flag need to be removed when merge to main branch
const isProductEnv = import.meta.env.VITE_USER_NODE_ENV === 'production';
const BlogLink =
  'https://sleekflow.io/blog/pricing-updates-2025-premium-yearly-852';
const DAILY_DISMISS_STORAGE_KEY =
  'DAILY_DISMISS_V10_MIGRATION_OPT_IN_ALERT_CHECKER';
export const V10_MIGRATION_OPT_IN_ALERT_HIDE_TIME =
  'V10_MIGRATION_OPT_IN_ALERT_HIDE';

export function useV10MigrationOpInAlert() {
  const { t } = useTranslation();
  const { data: companyData } = useCompany({
    enabled: !isProductEnv,
    select: ({
      id,
      v10SubscriptionMigrationStatus,
      billRecords,
      subscriptionCountryTier,
    }) => {
      const activeBillRecord =
        fromApiBillRecordsToActiveBillRecord(billRecords);
      return {
        id,
        v10SubscriptionMigrationStatus,
        activeBillRecord,
        subscriptionCountryTier,
      };
    },
  });
  const {
    id: companyId,
    activeBillRecord,
    v10SubscriptionMigrationStatus,
    subscriptionCountryTier,
  } = companyData ?? {};

  const isLegacy = activeBillRecord
    ? isLegacyPlan(activeBillRecord.subscriptionPlan.version)
    : false;
  const planTier = subscriptionCountryTier;

  const { canViewManagePlan } = usePlansAndBillingsRuleGuard();
  const { planName, billingPeriod } = transformPlanDetails(
    activeBillRecord?.subscriptionPlan.id,
  );

  const [searchParams] = useSearchParams();
  const paymentStatus = searchParams.get('status');
  const hasPaymentSuccessParam =
    paymentStatus === 'success' &&
    searchParams.get('action') === GlobalBanners.V10_OPT_IN_INCENTIVE;

  //hide alert checker
  const hideStorageKey = `${V10_MIGRATION_OPT_IN_ALERT_HIDE_TIME}-${companyId}`;
  //if delay expired time is pass, then show alert
  const delayExpiredTime = localStorage.getItem(hideStorageKey);
  const isTempHide = delayExpiredTime
    ? new Date().getTime() < parseInt(delayExpiredTime)
    : hasPaymentSuccessParam;

  //daily dismiss checker
  const dismissStorageKey = companyId
    ? `${DAILY_DISMISS_STORAGE_KEY}-${companyId}`
    : '';
  const { showAlert: isPassDailyDismiss, handleDismiss } =
    useDailyAlertDismissChecker(dismissStorageKey);
  const generalEnableConditions =
    !isProductEnv && canViewManagePlan && !isTempHide && isPassDailyDismiss;

  const { data: migrationPlanData, isLoading: isSubscriptionPlanIdLoading } =
    useGetMigrationSubscriptionPlanIdQuery({
      enabled: generalEnableConditions && isLegacy,
    });
  const {
    data: isInLegacyPremiumOptInUpgradeIncentivePeriod,
    isLoading: isFeatureInfoLoading,
  } = useGetIsFeatureFlagsEnabledQuery({
    select: (data) => data.isInLegacyPremiumOptInUpgradeIncentivePeriod,
    enabled: generalEnableConditions && isLegacy,
  });
  const newSubscriptionPlanId = migrationPlanData?.subscriptionPlanId;
  const { planName: newPlanName, billingPeriod: newBillingPeriod } =
    transformPlanDetails(newSubscriptionPlanId);

  const addBanner = useGlobalBanner((s) => s.addBanner);
  const removeBanner = useGlobalBanner((s) => s.removeBanner);

  const { mutate } = useSubscribePlanMutation({});
  const [_planActionInfo, setPlanActionInfo] =
    useSessionStorage<PlanActionInfoSession | null>(
      'user-subscription-plan-action-info',
      null,
    );

  const handleUpgradePlan = useCallback(() => {
    if (!newSubscriptionPlanId) {
      return;
    }
    mutate({
      baseSubscriptionPlanId: newSubscriptionPlanId,
      addOns: [],
      successUrl: `${window.location.origin}/${ROUTES.settingsSubscriptions}?status=success&action=${GlobalBanners.V10_OPT_IN_INCENTIVE}`,
      cancelUrl: `${window.location.origin}/${ROUTES.settingsSubscriptions}?status=cancel`,
    });

    setPlanActionInfo({
      action: PlanActionDict.upgrade,
      planTier: newPlanName as SubscriptionPlanName,
      planInterval: newBillingPeriod as SubscriptionPeriod,
    });
  }, [
    newSubscriptionPlanId,
    mutate,
    setPlanActionInfo,
    newPlanName,
    newBillingPeriod,
  ]);

  const bannerId = `${GlobalBanners.V10_OPT_IN_INCENTIVE}-${companyId ?? ''}`;

  useEffect(() => {
    if (!generalEnableConditions || !companyId || isFeatureInfoLoading) {
      return;
    }
    if (!isLegacy) {
      removeBanner(bannerId);
    } else if (
      isLegacy &&
      v10SubscriptionMigrationStatus ===
        MigrationStatusDict.SubscriptionMigrationScheduledSuccess &&
      planTier === TIERS.TIER1 &&
      isInLegacyPremiumOptInUpgradeIncentivePeriod &&
      planName === SUBSCRIPTION_NAME.premium &&
      billingPeriod === SUBSCRIPTION_PERIODS.yearly
    ) {
      addBanner({
        id: bannerId,
        type: 'success',
        message: (
          <Trans
            i18nKey="settings.v10-plan-migration.opt-in-alert.message"
            defaults="Opt in for the new pricing now to unlock 2,000 additional contacts for free and save up to US$ 1,056 annually — limited-time only! Find out <1>more</1>."
          >
            Opt in for the new pricing now to unlock 2,000 additional contacts
            for free and save up to US$ 1,056 annually — limited-time only! Find
            out
            <Link
              component={RouterLink}
              to={BlogLink}
              underline="always"
              target="_blank"
              rel="noopener noreferrer"
              sx={(theme) => ({
                color: theme.palette.componentToken.snackbar.textWarning,
                textDecorationColor:
                  theme.palette.componentToken.snackbar.textWarning,
                ml: '5px !important',
                whiteSpace: 'nowrap',
              })}
            >
              more
            </Link>
            .
          </Trans>
        ),
        action: isSubscriptionPlanIdLoading ? (
          <CircularProgress />
        ) : (
          <Link
            component="button"
            underline="none"
            onClick={handleUpgradePlan}
            sx={{
              cursor: 'pointer',
              '&:hover': {
                textDecoration: 'none',
              },
            }}
            disabled={!newSubscriptionPlanId}
          >
            <Typography variant="button2" color="blue.90">
              {t('settings.v10-plan-migration.opt-in-alert.action', {
                defaultValue: 'Claim offer',
              })}
            </Typography>
          </Link>
        ),
        onDismiss: handleDismiss,
      });
    }
    //remove hide alert checker
    localStorage.removeItem(hideStorageKey);
  }, [
    generalEnableConditions,
    addBanner,
    bannerId,
    handleUpgradePlan,
    t,
    handleDismiss,
    isLegacy,
    isSubscriptionPlanIdLoading,
    removeBanner,
    newSubscriptionPlanId,
    dismissStorageKey,
    hideStorageKey,
    companyId,
    isInLegacyPremiumOptInUpgradeIncentivePeriod,
    planName,
    billingPeriod,
    v10SubscriptionMigrationStatus,
    planTier,
    isFeatureInfoLoading,
  ]);
}
