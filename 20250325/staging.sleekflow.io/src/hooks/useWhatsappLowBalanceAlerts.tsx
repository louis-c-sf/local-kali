import { Link, Typography } from '@mui/material';
import { useLocalStorage } from '@uidotdev/usehooks';
import dayjs from 'dayjs';
import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';

import { GlobalBanners, useGlobalBanner } from '@/GlobalBanner';
import { useCompany, useGetCloudApiBalanceRecordsQuery } from '@/api/company';
import { RoleType } from '@/api/types';
import { useAccessRuleGuard } from '@/pages/Contacts/shared/accessRuleGuard/useAccessRuleGuard';

import { useRouteWithLocale } from './useRouteWithLocale/useRouteWithLocale';
import { usePermissionWrapper } from './usePermission';
import { PERMISSION_KEY } from '@/constants/permissions';

const bannerConfigs = {
  whatsapp: {
    id: GlobalBanners.CLOUD_API_LOW_BALANCE,
    channelName: 'WhatsApp Cloud API',
    redirection: '/channels/whatsapp/billing',
  },
  whatsappTwilio: {
    id: GlobalBanners.TWILIO_LOW_BALANCE,
    channelName: 'WhatsApp Twilio',
    redirection: '/channels/twilio?tab=billing',
  },
  whatsapp360dialog: {
    id: GlobalBanners.THREESIXTYDIALOG_LOW_BALANCE,
    channelName: 'WhatsApp 360dialog',
    redirection: '/channels/360dialog?tab=billing',
  },
};

const CREDIT_LIMIT_CLOUDAPI = 20;
const CREDIT_LIMIT_360DIALOG = 200;

export const useWhatsappLowBalanceAlerts = () => {
  const { t } = useTranslation();
  const routeTo = useRouteWithLocale();
  const addBanner = useGlobalBanner((s) => s.addBanner);
  const removeBanner = useGlobalBanner((s) => s.removeBanner);

  const [nextCheckTimestamps, setNextCheckTimestamps] = useLocalStorage(
    'whatsapp_low_balance_check_timestamps',
    {
      whatsapp: '',
      whatsappTwilio: '',
      whatsapp360dialog: '',
    },
  );

  const isAfterNow = (timestamp: string | undefined) =>
    new Date().toISOString() > (timestamp || '');

  const { data: company } = useCompany();

  const { data: whatsappCloudApiUsageRecords } =
    useGetCloudApiBalanceRecordsQuery();

  const isCloudApiLowBalance =
    isAfterNow(nextCheckTimestamps?.whatsapp) &&
    whatsappCloudApiUsageRecords?.some(
      (record) => record.balance.amount < CREDIT_LIMIT_CLOUDAPI,
    );

  const is360DialogLowBalance =
    isAfterNow(nextCheckTimestamps?.whatsapp360dialog) &&
    company?.whatsApp360DialogUsageRecords?.some(
      (record) =>
        record.balance - record.upcomingCharges < CREDIT_LIMIT_360DIALOG,
    );

  const isTwilioLowBalance =
    isAfterNow(nextCheckTimestamps?.whatsappTwilio) &&
    company?.twilioUsageRecords?.some((record) => record.balance <= 0);

  const { check } = usePermissionWrapper();
  const accessRulesGuard = useAccessRuleGuard();
  const canViewChannels = check(
    [PERMISSION_KEY.channelView],
    [accessRulesGuard.user.data?.roleType === RoleType.ADMIN],
  )[0];

  const makeBanner = useCallback(
    (channel: keyof typeof bannerConfigs) => {
      const { id, channelName, redirection } = bannerConfigs[channel];

      return addBanner({
        id,
        type: 'error',
        message: canViewChannels
          ? t('whatsapp-low-balance-banner.admin-message', {
              defaultValue:
                'Messaging via {channelName} channels may be disrupted due to low balance.',
              channelName,
            })
          : t('whatsapp-low-balance-banner.non-admin-message', {
              defaultValue:
                'Messaging via {channelName} channels may be disrupted due to low balance. Please contact workspace admin for support.',
              channelName,
            }),
        ...(canViewChannels && {
          action: (
            <Link
              component={RouterLink}
              to={routeTo(redirection)}
              underline="none"
            >
              <Typography variant="button2" color="blue.90">
                {t(
                  'whatsapp-low-balance-banner.action-manage-billings',
                  'Manage WhatsApp Billings',
                )}
              </Typography>
            </Link>
          ),
        }),
        onDismiss: () => {
          const nextTimestamp = dayjs()
            .add(1, 'day')
            .startOf('day')
            .toISOString();
          setNextCheckTimestamps((timestamps) => ({
            ...(timestamps as Record<keyof typeof bannerConfigs, string>),
            [channel]: nextTimestamp,
          }));
        },
      });
    },
    [addBanner, canViewChannels, routeTo, setNextCheckTimestamps, t],
  );

  useEffect(() => {
    if (isCloudApiLowBalance) {
      makeBanner('whatsapp');
    } else {
      removeBanner(bannerConfigs.whatsapp.id);
    }
  }, [isCloudApiLowBalance, makeBanner, removeBanner]);

  useEffect(() => {
    if (is360DialogLowBalance) {
      makeBanner('whatsapp360dialog');
    } else {
      removeBanner(bannerConfigs.whatsapp360dialog.id);
    }
  }, [is360DialogLowBalance, makeBanner, removeBanner]);

  useEffect(() => {
    if (isTwilioLowBalance) {
      makeBanner('whatsappTwilio');
    } else {
      removeBanner(bannerConfigs.whatsappTwilio.id);
    }
  }, [isTwilioLowBalance, makeBanner, removeBanner]);
};
