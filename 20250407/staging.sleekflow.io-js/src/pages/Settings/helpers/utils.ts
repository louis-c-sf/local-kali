import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { type Timezone, useGetDefaultTimezoneQuery } from '@/api/settings';

export const DEFAULT_STANDARD_TIME = 'GMT Standard Time';

export const useGetDefaultTimeZone = () => {
  const { t } = useTranslation();
  const { data: defaultTimezone, isLoading } = useGetDefaultTimezoneQuery({});

  const getDefaultTimeZoneDisplayName = useCallback(
    (timezone: Timezone) => {
      const defaultOptionId = defaultTimezone?.id || DEFAULT_STANDARD_TIME;
      return defaultOptionId === timezone.id
        ? `${t('settings.general.profile.default-time-zone-label', {
            defaultValue: '[Same as default time zone]',
          })} ${timezone.displayName}`
        : timezone.displayName;
    },
    [t, defaultTimezone?.id],
  );

  return { isLoading, getDefaultTimeZoneDisplayName, defaultTimezone };
};

export const useRemoveQueryParams = () => {
  const navigate = useNavigate();

  const removeQueryParams = useCallback(() => {
    navigate(window.location.pathname, { replace: true });
  }, [navigate]);

  return removeQueryParams;
};
