import { IconButtonProps, Stack, Typography } from '@mui/material';
import { nanoid } from 'nanoid';
import { useLayoutEffect } from 'react';
import { Renderable } from 'react-hot-toast/headless';
import { useMeasure } from 'react-use';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import Icon from './components/Icon';
import { IconButton } from './components/IconButton';
import theme from './themes';

export type BannerType = 'error' | 'warning' | 'info' | 'success';

export enum GlobalBanners {
  CLOUD_API_LOW_BALANCE = 'cloud-api-low-balance',
  CLOUD_API_LOW_QUALITY = 'cloud-api-low-quality',
  TWILIO_LOW_BALANCE = 'twilio-low-balance',
  THREESIXTYDIALOG_LOW_BALANCE = '360dialog-low-balance',
  UNABLE_TO_PROCESS_PAYMENT_SUPPORT_SERVICES = 'unable-to-process-payment-support-services',
  STRIPE_CANCEL_ALERT = 'stripe-cancel-alert',
  FLOW_BUILDER_RUN_LIMIT_ALERT = 'flow-builder-run-limit-alert',
  PLAN_MIGRATION_ALERT = 'plan-migration-alert',
  V10_AUTO_MIGRATION_PAYMENT_FAILED = 'v10-migration-payment-failed',
  V10_OPT_IN_INCENTIVE = 'v10-opt-in-incentive',
}

export enum GlobalBannerPriority {
  LOW = 0,
  MEDIUM = 1,
  HIGH = 2,
}

export interface Banner {
  id: string;
  type: BannerType;
  message: Renderable | ((banner: Banner) => Renderable);
  action?: Renderable | ((banner: Banner) => Renderable);
  priority?: GlobalBannerPriority;
  onDismiss?: () => void;
}

interface GlobalBannerStore {
  banners: Banner[];
  totalHeight: number;
  addBanner: (banner: Omit<Banner, 'id'> & { id?: string }) => string;
  removeBanner: (id: string) => void;
  updateTotalHeight: (height: number) => void;
}

export const useGlobalBanner = create<GlobalBannerStore>()(
  immer((set) => ({
    banners: [],
    totalHeight: 0,
    addBanner: (banner) => {
      const id = banner.id || nanoid();
      const priority = banner.priority ?? GlobalBannerPriority.MEDIUM;
      const newBanner = {
        ...banner,
        id,
        priority,
      };

      set((state) => {
        state.banners = state.banners.some((b) => b.id === id)
          ? state.banners.map((b) => (b.id === id ? newBanner : b))
          : [...state.banners, newBanner];

        // Sort banners by priority (highest first)
        state.banners.sort((a, b) => {
          const priorityA = a.priority ?? GlobalBannerPriority.MEDIUM;
          const priorityB = b.priority ?? GlobalBannerPriority.MEDIUM;
          return priorityB - priorityA;
        });
      });

      return id;
    },
    removeBanner: (id) => {
      set((state) => {
        state.banners = state.banners.filter((banner) => banner.id !== id);
      });
    },
    updateTotalHeight: (height) => set(() => ({ totalHeight: height })),
  })),
);

const bannerStyles = {
  error: {
    bgcolor: 'red.5',
    color: 'red.90',
    icon: 'alert-triangle' as const,
    iconColor: 'red' as const,
  },
  warning: {
    bgcolor: 'orange.20',
    color: 'orange.90',
    icon: 'alert-circle' as const,
    iconColor: 'mustard' as const,
  },
  info: {
    bgcolor: theme.palette.componentToken.notification.bgNeutral,
    color: theme.palette.componentToken.notification.textNeutral,
    icon: 'alert-circle' as const,
    iconColor: 'info' as const,
  },
  success: {
    bgcolor: theme.palette.componentToken.notification.bgSuccess,
    color: theme.palette.componentToken.notification.textSuccess,
    icon: 'alert-circle' as const,
    iconColor: 'success' as const,
  },
};

export const GlobalBanner = () => {
  const { banners, removeBanner, updateTotalHeight } = useGlobalBanner();
  const [containerRef, { height }] = useMeasure<HTMLDivElement>();

  useLayoutEffect(() => {
    updateTotalHeight(height);
  }, [height, updateTotalHeight]);

  return (
    <Stack ref={containerRef} width="100%">
      {banners.map((banner) => {
        const { color, bgcolor, icon, iconColor } = bannerStyles[banner.type];

        return (
          <Stack
            key={banner.id}
            direction="row"
            alignItems="center"
            spacing={1.5}
            color={color}
            bgcolor={bgcolor}
            px={2}
            py="10px"
          >
            <Icon icon={icon} size="medium" sx={{ p: 0.5 }} />
            <Stack direction="row" flexGrow={1} spacing={1} alignItems="center">
              {(() => {
                switch (true) {
                  case typeof banner.message === 'string':
                    return (
                      <Typography variant="body1" color={color}>
                        {banner.message}
                      </Typography>
                    );
                  case typeof banner.message === 'function':
                    return banner.message(banner);
                  default:
                    return banner.message;
                }
              })()}

              {typeof banner.action === 'function'
                ? banner.action(banner)
                : banner.action}
            </Stack>

            <IconButton
              color={iconColor as IconButtonProps['color']}
              sx={{ width: '28px', height: '28px' }}
              onClick={() => {
                removeBanner(banner.id);
                banner.onDismiss?.();
              }}
            >
              <Icon icon="x-close" size="medium" />
            </IconButton>
          </Stack>
        );
      })}
    </Stack>
  );
};
