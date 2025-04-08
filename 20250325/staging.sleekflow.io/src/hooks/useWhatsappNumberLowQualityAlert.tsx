import { Link, Stack, Typography } from '@mui/material';
import { useLocalStorage } from '@uidotdev/usehooks';
import dayjs from 'dayjs';
import { useCallback, useEffect, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';

import {
  GlobalBannerPriority,
  GlobalBanners,
  useGlobalBanner,
} from '@/GlobalBanner';
import { useGetAvailableChannels } from '@/api/company';
import { RoleType } from '@/api/types';
import { useAccessRuleGuard } from '@/pages/Contacts/shared/accessRuleGuard/useAccessRuleGuard';

import { useRouteWithLocale } from './useRouteWithLocale/useRouteWithLocale';
import { ChannelQualityRating } from '@/api/channels/whatsapp/types';
import { usePermissionWrapper } from './usePermission';
import { PERMISSION_KEY } from '@/constants/permissions';

const bannerConfigs = {
  whatsapp: {
    id: GlobalBanners.CLOUD_API_LOW_QUALITY,
    channelName: 'WhatsApp Cloud API',
    redirection: '/channels/whatsapp',
  },
};

export const useWhatsappNumberLowQualityAlert = () => {
  const { t } = useTranslation();
  const routeTo = useRouteWithLocale();
  const addBanner = useGlobalBanner((s) => s.addBanner);
  const removeBanner = useGlobalBanner((s) => s.removeBanner);

  const [nextCheckTimestamps, setNextCheckTimestamps] = useLocalStorage(
    'whatsapp_low_quality_check_timestamp',
    '',
  );

  const isAfterNow = (timestamp: string | undefined) =>
    new Date().toISOString() > (timestamp || '');

  const { data: channels } = useGetAvailableChannels();

  const riskyChannelCount = useMemo(
    () =>
      channels?.whatsappCloudApiConfigs?.filter(
        (config) =>
          config.facebookPhoneNumberQualityRating ===
            ChannelQualityRating.LOW ||
          config.facebookPhoneNumberQualityRating ===
            ChannelQualityRating.MEDIUM,
      ).length ?? 0,
    [channels],
  );

  const { check } = usePermissionWrapper();
  const accessRulesGuard = useAccessRuleGuard();
  const canViewChannels = check(
    [PERMISSION_KEY.channelView],
    [accessRulesGuard.user.data?.roleType === RoleType.ADMIN],
  )[0];

  const getBannerMessage = useCallback(() => {
    return canViewChannels ? (
      <Typography color="error">
        <Trans
          i18nKey="whatsapp-low-quality-banner.manage-channel-action"
          defaults="{count} of your channels have a medium or low quality rating, which may impact your messaging capabilities. Review your accounts and <1>visit our Help Center</1> to improve your rating."
          values={{ count: riskyChannelCount }}
          components={{
            1: (
              <Typography
                variant="body1"
                sx={{ textDecoration: 'none', fontWeight: 600 }}
                component="a"
                color="error"
                href="https://help.sleekflow.io/best-practices-for-managing-your-whatsapp-accounts"
                target="_blank"
                rel="noopener noreferrer"
              />
            ),
          }}
        >
          <Typography color="error">
            {riskyChannelCount} of your channels have a medium or low quality
            rating, which may impact your messaging capabilities.
          </Typography>
          <Typography>
            Review your accounts and
            <Typography
              variant="body1"
              sx={{ textDecoration: 'none', fontWeight: 600 }}
              component="a"
              color="error"
              href="https://help.sleekflow.io/best-practices-for-managing-your-whatsapp-accounts"
              target="_blank"
              rel="noopener noreferrer"
            >
              visit our Help Center
            </Typography>
            to improve your rating.
          </Typography>
        </Trans>
      </Typography>
    ) : (
      t('whatsapp-low-quality-banner.non-admin-message', {
        defaultValue:
          '{count} of your channels have a medium or low quality rating, which may impact your messaging capabilities. Please contact your workspace admin to take immediate action.',
        count: riskyChannelCount,
      })
    );
  }, [canViewChannels, riskyChannelCount, t]);

  const makeBanner = useCallback(
    (channel: keyof typeof bannerConfigs) => {
      const { id, redirection } = bannerConfigs[channel];

      return addBanner({
        id,
        type: 'error',
        priority: GlobalBannerPriority.HIGH,
        message: getBannerMessage,
        ...(canViewChannels && {
          action: (
            <Stack direction="row" spacing={1}>
              <Link
                component={RouterLink}
                to={routeTo(redirection)}
                underline="none"
              >
                <Typography variant="button2" color="blue.90">
                  {t(
                    'whatsapp-low-quality-banner.manage-channel-action',
                    'Review Account',
                  )}
                </Typography>
              </Link>
            </Stack>
          ),
        }),
        ...(!canViewChannels && {
          action: (
            <Stack direction="row" spacing={1}>
              <Link
                target="_blank"
                component={RouterLink}
                to="https://help.sleekflow.io/best-practices-for-managing-your-whatsapp-accounts"
                underline="none"
              >
                <Typography variant="button2" color="blue.90">
                  {t(
                    'whatsapp-low-quality-banner.manage-channel-action',
                    'Visit our Help Center to improve your rating.',
                  )}
                </Typography>
              </Link>
            </Stack>
          ),
        }),
        onDismiss: () => {
          const nextTimestamp = dayjs()
            .add(2, 'day')
            .startOf('day')
            .toISOString();
          setNextCheckTimestamps(nextTimestamp);
        },
      });
    },
    [
      addBanner,
      getBannerMessage,
      canViewChannels,
      routeTo,
      setNextCheckTimestamps,
      t,
    ],
  );

  useEffect(() => {
    if (isAfterNow(nextCheckTimestamps) && riskyChannelCount > 0) {
      makeBanner('whatsapp');
    } else {
      removeBanner(bannerConfigs.whatsapp.id);
    }
  }, [makeBanner, nextCheckTimestamps, riskyChannelCount, removeBanner]);
};
