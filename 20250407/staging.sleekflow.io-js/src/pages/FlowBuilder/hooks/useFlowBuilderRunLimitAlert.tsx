import { Typography } from '@mui/material';
import dayjs from 'dayjs';
import LocalizedFormat from 'dayjs/plugin/localizedFormat';
import { useEffect } from 'react';
import { Renderable } from 'react-hot-toast/headless';
import { Trans } from 'react-i18next';
import { Link, To } from 'react-router-dom';

import { GlobalBanners, useGlobalBanner } from '@/GlobalBanner';
import { ROUTES } from '@/constants/navigation';
import { useIsActiveUnlimitedIncentive } from '@/hooks/useIsActiveUnlimitedIncentive';
import { useRouteWithLocale } from '@/hooks/useRouteWithLocale/useRouteWithLocale';
import { useGetFeatureFlagFlowEnrollment } from '@/pages/Settings/featureFlags/FeatureFlagFlowEnrollment';
import { usePlansAndBillingsRuleGuard } from '@/pages/Settings/hooks/usePlansAndBillingsRuleGuard';

import { useCompanyUsageQuery } from '@/api/company';
import useFlowHubConfig from './useFlowHubConfig';

dayjs.extend(LocalizedFormat);

const linkProps = {
  component: Link,
  color: 'contentAccent',
  sx: {
    textDecoration: 'none',
    lineHeight: 'inherit',
    ml: '8px !important',
  },
};

const getAlertColor = (percentage: number) => {
  if (percentage >= 90) return 'error';
  if (percentage >= 75) return 'warning';
  return 'error';
};

const getAlertMessage = (percentage: number, link: To): Renderable => {
  if (percentage === 100) {
    return (
      <Trans
        i18nKey="flow-builder.maximum-number-of-runs-per-month-alert-100%"
        defaults="<strong>Service suspended:</strong> You have reached your monthly enrollment limit, which blocks further enrollments. Purchase add-ons now to resume service. <a>Purchase add-on</a>"
        components={{
          strong: (
            <Typography variant="button2" fontWeight="bold" sx={{ pr: 0.5 }} />
          ),
          a: <Typography variant="button2" to={link} {...linkProps} />,
        }}
      />
    );
  } else if (percentage >= 90) {
    return (
      <Trans
        i18nKey="flow-builder.maximum-number-of-runs-per-month-alert-90%"
        defaults="<strong>Warning:</strong> You are about to reach your monthly enrollment limit. Purchase add-ons now to prevent service disruption. <a>Purchase add-on</a>"
        components={{
          strong: (
            <Typography variant="button2" fontWeight="bold" sx={{ pr: 0.5 }} />
          ),
          a: <Typography variant="button2" to={link} {...linkProps} />,
        }}
      />
    );
  } else if (percentage >= 75) {
    return (
      <Trans
        i18nKey="flow-builder.maximum-number-of-runs-per-month-alert-75%"
        defaults="You have used over 75% of your monthly enrollment limit. Purchase add-ons now to prevent service disruption. <a>Purchase add-on</a>"
        components={{
          a: <Typography variant="button2" to={link} {...linkProps} />,
        }}
      />
    );
  }
  return '';
};

const getAlertMessageWithUnlimitedIncentive = (
  percentage: number,
  link: To,
  showLink: boolean,
): Renderable => {
  if (percentage === 100) {
    return (
      <Trans
        i18nKey="flow-builder.maximum-number-of-runs-per-month-alert-100%-unlimited"
        defaults="<strong>Service suspended:</strong> You have reached your monthly enrollment limit. {showLink, select, true {Purchase add-ons now and enjoy 2 months of unlimited enrollments! <a>Purchase add-on</a>} other {Contact your workspace admin to increase the limit.}}"
        values={{ showLink }}
        components={{
          strong: (
            <Typography variant="button2" fontWeight="bold" sx={{ pr: 0.5 }} />
          ),
          a: <Typography variant="button2" to={link} {...linkProps} />,
        }}
      />
    );
  } else if (percentage >= 90) {
    return (
      <Trans
        i18nKey="flow-builder.maximum-number-of-runs-per-month-alert-90%-unlimited"
        defaults="<strong>Warning:</strong> You are about to reach your monthly enrollment limit. {showLink, select, true {Purchase add-ons now and enjoy 2 months of unlimited enrollments! <a>Purchase add-on</a>} other {Contact your workspace admin to increase the limit.}}"
        values={{ showLink }}
        components={{
          strong: (
            <Typography variant="button2" fontWeight="bold" sx={{ pr: 0.5 }} />
          ),
          a: <Typography variant="button2" to={link} {...linkProps} />,
        }}
      />
    );
  }
  if (percentage >= 75) {
    return (
      <Trans
        i18nKey="flow-builder.maximum-number-of-runs-per-month-alert-75%-unlimited"
        defaults="You have used over 75% of your monthly enrollment limit. {showLink, select, true {Purchase add-ons now and enjoy 2 months of unlimited enrollments! <a>Purchase add-on</a>} other {Contact your workspace admin to increase the limit if needed.}}"
        values={{ showLink }}
        components={{
          a: <Typography variant="button2" to={link} {...linkProps} />,
        }}
      />
    );
  }
  return '';
};

export function useFlowBuilderRunLimitAlert() {
  const routeTo = useRouteWithLocale();
  const flowHubConfig = useFlowHubConfig();
  const isFlowEnrollmentEnabled = useGetFeatureFlagFlowEnrollment();
  const { canViewAddons } = usePlansAndBillingsRuleGuard();
  const { isEligibleForIncentive } = useIsActiveUnlimitedIncentive();

  const addBanner = useGlobalBanner((state) => state.addBanner);
  const removeBanner = useGlobalBanner((state) => state.removeBanner);

  const { maximumNumberOfRunPerMonth = Infinity } = flowHubConfig.data ?? {};

  const { data: flowEnrollmentUsageCount = 0 } = useCompanyUsageQuery({
    select: (data) => data.currentFlowBuilderFlowEnrolmentUsage,
  });

  const progressPercentage = Math.round(
    (flowEnrollmentUsageCount / maximumNumberOfRunPerMonth) * 100,
  );

  const conditionByFeatureFlag = isFlowEnrollmentEnabled
    ? progressPercentage < 75
    : maximumNumberOfRunPerMonth > flowEnrollmentUsageCount;

  useEffect(() => {
    if (maximumNumberOfRunPerMonth <= 0 || conditionByFeatureFlag) {
      return;
    }

    if (!isFlowEnrollmentEnabled) {
      addBanner({
        id: GlobalBanners.FLOW_BUILDER_RUN_LIMIT_ALERT,
        type: 'warning',
        message: (
          <Trans
            i18nKey="flow-builder.maximum-number-of-runs-per-month-alert"
            defaults="You've exceeded your monthly flow run limit. All flows will stop running until {date}."
            values={{
              date: dayjs().endOf('month').format('ll'),
            }}
          />
        ),
      });
      return;
    }

    addBanner({
      id: GlobalBanners.FLOW_BUILDER_RUN_LIMIT_ALERT,
      type: getAlertColor(progressPercentage),
      message: isEligibleForIncentive
        ? getAlertMessageWithUnlimitedIncentive(
            progressPercentage,
            routeTo(ROUTES.settingsAddOns),
            canViewAddons,
          )
        : getAlertMessage(progressPercentage, routeTo(ROUTES.settingsAddOns)),
    });

    return () => {
      removeBanner(GlobalBanners.FLOW_BUILDER_RUN_LIMIT_ALERT);
    };
  }, [
    isEligibleForIncentive,
    addBanner,
    conditionByFeatureFlag,
    canViewAddons,
    isFlowEnrollmentEnabled,
    maximumNumberOfRunPerMonth,
    progressPercentage,
    removeBanner,
    routeTo,
  ]);
}
