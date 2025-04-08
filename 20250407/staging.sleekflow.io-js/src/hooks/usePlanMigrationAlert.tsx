import { Link, Typography } from '@mui/material';
import { useEffect, useCallback } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';

import { GlobalBanners, useGlobalBanner } from '@/GlobalBanner';
import { useCompany } from '@/api/company';
import { useGetMigrationSubscriptionPlanIdQuery } from '@/api/settings';
import { useSubscribePlanMutation } from '@/api/stripe';
import { ROUTES } from '@/constants/navigation';
import { usePlansAndBillingsRuleGuard } from '@/pages/Settings/hooks/usePlansAndBillingsRuleGuard';

import useDailyAlertDismissChecker from './useDailyAlertDismissChecker';
import { useGetBlogURLByTier } from './useGetBlogURLByTier';

const DAILY_DISMISS_STORAGE_KEY = 'DAILY_DISMISS_PLAN_MIGRATION_ALERT_CHECKER';
export function usePlanMigrationAlert() {
  const { t } = useTranslation();
  const { data: companyId } = useCompany({
    select: ({ id }) => id,
  });
  const addBanner = useGlobalBanner((s) => s.addBanner);
  const { getBlogURLByTier } = useGetBlogURLByTier();

  const {
    canProPlanDisplayPlanMigrationAlert,
    canPremiumPlanDisplayPlanMigrationAlert,
  } = usePlansAndBillingsRuleGuard();

  const { data: migrationPlanData, isLoading: isSubscriptionPlanIdLoading } =
    useGetMigrationSubscriptionPlanIdQuery({
      enabled: canProPlanDisplayPlanMigrationAlert,
    });
  const subscriptionPlanId = migrationPlanData?.subscriptionPlanId;

  const { mutate } = useSubscribePlanMutation({});
  const handleUpdatePlan = useCallback(() => {
    if (!subscriptionPlanId || isSubscriptionPlanIdLoading) {
      return;
    }
    mutate({
      baseSubscriptionPlanId: subscriptionPlanId,
      addOns: [],
      successUrl: `${window.location.origin}/${ROUTES.settingsSubscriptions}`,
      cancelUrl: `${window.location.origin}/${ROUTES.settingsSubscriptions}`,
    });
  }, [subscriptionPlanId, isSubscriptionPlanIdLoading, mutate]);

  const bannerId = `${GlobalBanners.PLAN_MIGRATION_ALERT}-${companyId ?? ''}`;
  const dismissStorageKey = companyId
    ? `${DAILY_DISMISS_STORAGE_KEY}-${companyId}`
    : '';
  const { showAlert, handleDismiss } =
    useDailyAlertDismissChecker(dismissStorageKey);
  useEffect(() => {
    if (!companyId) {
      return;
    }
    if (canProPlanDisplayPlanMigrationAlert && showAlert) {
      addBanner({
        id: bannerId,
        type: 'warning',
        message: (
          <Trans i18nKey="settings.plan-migration.pro-plan.alert.message">
            <Typography
              variant="body1"
              fontWeight="600"
              sx={(theme) => ({
                pr: 0.5,
                color: theme.palette.componentToken.snackbar.textWarning,
              })}
            >
              Important pricing update:
            </Typography>
            Update your plan now to unlock exclusive benefits and new
            features—limited time only! Find out
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
              })}
            >
              more
            </Link>
          </Trans>
        ),
        action: (
          <Link
            component="button"
            underline="none"
            onClick={handleUpdatePlan}
            sx={{
              cursor: 'pointer',
              '&:hover': {
                textDecoration: 'none',
              },
            }}
            disabled={isSubscriptionPlanIdLoading}
          >
            <Typography variant="button2" color="blue.90">
              {t('settings.plan-migration.pro-plan.alert.action', {
                defaultValue: 'Update plan now',
              })}
            </Typography>
          </Link>
        ),
        onDismiss: handleDismiss,
      });
    }

    if (canPremiumPlanDisplayPlanMigrationAlert && showAlert) {
      addBanner({
        id: bannerId,
        type: 'info',
        message: (
          <Trans i18nKey="settings.plan-migration.premium-plan.alert.message">
            <Typography variant="body1" fontWeight="bold" sx={{ pr: 0.5 }}>
              Important pricing update:
            </Typography>
            Your Premium plan pricing will automatically update on 20 Feb 2025.
            Find out
            <Link
              component={RouterLink}
              to={getBlogURLByTier() || ''}
              underline="always"
              target="_blank"
              rel="noopener noreferrer"
              sx={(theme) => ({
                color: theme.palette.componentToken.notification.textNeutral,
                ml: '5px !important',
              })}
            >
              more
            </Link>
          </Trans>
        ),
        onDismiss: handleDismiss,
      });
    }
  }, [
    addBanner,
    canProPlanDisplayPlanMigrationAlert,
    canPremiumPlanDisplayPlanMigrationAlert,
    t,
    handleDismiss,
    subscriptionPlanId,
    isSubscriptionPlanIdLoading,
    handleUpdatePlan,
    bannerId,
    showAlert,
    getBlogURLByTier,
    companyId,
  ]);
}
