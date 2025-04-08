import { CircularProgress, Link, Typography } from '@mui/material';
import { useEffect, useCallback } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import { GlobalBanners, useGlobalBanner } from '@/GlobalBanner';
import { useCompany } from '@/api/company';
import { useSubscribePlanMutation } from '@/api/stripe';
import { ROUTES } from '@/constants/navigation';
import { usePlansAndBillingsRuleGuard } from '@/pages/Settings/hooks/usePlansAndBillingsRuleGuard';
import { MigrationStatusDict } from '@/api/types';
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
  SubscriptionPeriod,
  SubscriptionPlanName,
} from '@/constants/subscription-plans';
import { isLegacyPlan } from '@/utils/subscription-plan-checker';
import useDailyAlertDismissChecker from './useDailyAlertDismissChecker';
import { useGetBlogURLByTier } from './useGetBlogURLByTier';
import { TIERS } from './useGetPlanKeyAndTier';

const DAILY_DISMISS_STORAGE_KEY =
  'DAILY_DISMISS_V10_MIGRATION_PAYMENT_FAILED_ALERT_CHECKER';
export const V10_MIGRATION_PAYMENT_FAILED_ALERT_HIDE_TIME =
  'V10_MIGRATION_PAYMENT_FAILED_ALERT_HIDE';
export function useV10MigrationPaymentFailedAlert() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const paymentStatus = searchParams.get('status');
  const { getBlogURLByTier } = useGetBlogURLByTier();
  const { data: companyData } = useCompany({
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
        tier: subscriptionCountryTier,
      };
    },
  });
  const { canViewManagePlan } = usePlansAndBillingsRuleGuard();
  const {
    id: companyId,
    v10SubscriptionMigrationStatus,
    activeBillRecord,
    tier,
  } = companyData ?? {};
  const { planName } = transformPlanDetails(
    activeBillRecord?.subscriptionPlan.id,
  );

  //hide alert checker
  const hideStorageKey = `${V10_MIGRATION_PAYMENT_FAILED_ALERT_HIDE_TIME}-${companyId}`;
  const delayExpiredTime = localStorage.getItem(hideStorageKey);
  const hasPaymentSuccessParam =
    paymentStatus === 'success' &&
    searchParams.get('action') ===
      GlobalBanners.V10_AUTO_MIGRATION_PAYMENT_FAILED;
  //if expired time is pass, then show alert
  const isTempHide = delayExpiredTime
    ? new Date().getTime() < parseInt(delayExpiredTime)
    : hasPaymentSuccessParam;

  //daily dismiss checker
  const dismissStorageKey = companyId
    ? `${DAILY_DISMISS_STORAGE_KEY}-${companyId}`
    : '';
  const { showAlert: isPassDailyDismiss, handleDismiss } =
    useDailyAlertDismissChecker(dismissStorageKey);

  const generalEnableConditions = isPassDailyDismiss && !isTempHide;

  const bannerId = `${GlobalBanners.V10_AUTO_MIGRATION_PAYMENT_FAILED}-${companyId ?? ''}`;
  const isLegacy = companyData?.activeBillRecord
    ? isLegacyPlan(companyData?.activeBillRecord.subscriptionPlan.version)
    : false;
  const { data: migrationPlanData, isLoading: isSubscriptionPlanIdLoading } =
    useGetMigrationSubscriptionPlanIdQuery({
      enabled: canViewManagePlan && isLegacy && generalEnableConditions,
    });
  const newSubscriptionPlanId = migrationPlanData?.subscriptionPlanId;

  const addBanner = useGlobalBanner((s) => s.addBanner);
  const removeBanner = useGlobalBanner((s) => s.removeBanner);

  const { mutate } = useSubscribePlanMutation({});
  const [_planActionInfo, setPlanActionInfo] =
    useSessionStorage<PlanActionInfoSession | null>(
      'user-subscription-plan-action-info',
      null,
    );
  const { planName: newPlanName, billingPeriod: newBillingPeriod } =
    transformPlanDetails(newSubscriptionPlanId);
  const handleUpgradePlan = useCallback(() => {
    if (!newSubscriptionPlanId) {
      return;
    }

    setPlanActionInfo({
      action: PlanActionDict.upgrade,
      planTier: newPlanName as SubscriptionPlanName,
      planInterval: newBillingPeriod as SubscriptionPeriod,
    });
    mutate({
      baseSubscriptionPlanId: newSubscriptionPlanId,
      addOns: [],
      successUrl: `${window.location.origin}/${ROUTES.settingsSubscriptions}?status=success&action=${GlobalBanners.V10_AUTO_MIGRATION_PAYMENT_FAILED}`,
      cancelUrl: `${window.location.origin}/${ROUTES.settingsSubscriptions}?status=cancel`,
    });
  }, [
    newSubscriptionPlanId,
    mutate,
    setPlanActionInfo,
    newPlanName,
    newBillingPeriod,
  ]);

  useEffect(() => {
    if (!generalEnableConditions || !companyId) {
      return;
    }

    if (!isLegacy) {
      removeBanner(bannerId);
    } else if (
      !canViewManagePlan &&
      v10SubscriptionMigrationStatus ===
        MigrationStatusDict.SubscriptionMigrationPaymentFailed
    ) {
      addBanner({
        id: bannerId,
        type: 'warning',
        message: t('settings.v10-plan-migration.no-admin.alert.message', {
          defaultValue:
            'Platform services might be disrupted due to a payment failure. Please contact your workspace admin for support.',
        }),
        onDismiss: handleDismiss,
      });
    } else if (
      canViewManagePlan &&
      v10SubscriptionMigrationStatus ===
        MigrationStatusDict.SubscriptionMigrationPaymentFailed
    ) {
      addBanner({
        id: bannerId,
        type: 'error',
        message:
          (tier === TIERS.TIER2 ||
            tier === TIERS.TIER4 ||
            tier === TIERS.TIER5) &&
          planName === SUBSCRIPTION_NAME.premium ? (
            t('settings.v10-plan-migration.non-tier1-alert.message', {
              defaultValue:
                'Upgrade to the latest version for a smoother experience! Your pricing remains unchanged, migrate now to stay up to date.',
            })
          ) : (
            <Trans
              i18nKey="settings.v10-plan-migration.admin.alert.message"
              defaults="Unable to process your payment for plan update. Please update your payment details to avoid service disruption. Learn more about <1>pricing update</1>."
            >
              Unable to process your payment for plan update. Please update your
              payment details to avoid service disruption. Learn more about
              <Link
                component={RouterLink}
                to={getBlogURLByTier() || ''}
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
                pricing update
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
              {t('settings.v10-plan-migration.alert.action', {
                defaultValue: 'Manage payments',
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
    addBanner,
    bannerId,
    canViewManagePlan,
    t,
    isLegacy,
    newSubscriptionPlanId,
    handleUpgradePlan,
    generalEnableConditions,
    handleDismiss,
    isSubscriptionPlanIdLoading,
    v10SubscriptionMigrationStatus,
    removeBanner,
    getBlogURLByTier,
    companyId,
    planName,
    tier,
    hideStorageKey,
  ]);
}
