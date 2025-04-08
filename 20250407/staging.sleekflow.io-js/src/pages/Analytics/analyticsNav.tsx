import { Box, ListItem, Menu, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { NavLink, useLocation } from 'react-router-dom';

import Icon from '@/components/Icon';
import InfiniteScroll from '@/components/InfiniteScroll';
import { ROUTES } from '@/constants/navigation';
import { useMenuAnchor } from '@/hooks/useMenuAnchor';
import { useRouteWithLocale } from '@/hooks/useRouteWithLocale/useRouteWithLocale';
import { NavMenuItemToolTip } from '@/components/Navbar/NavMenuItemTooltip';
import { getNavMenuItemStyles } from '@/components/Navbar/helpers';
import { usePermissionWrapper } from '@/hooks/usePermission';
import { PERMISSION_KEY } from '@/constants/permissions';
import { useMemo } from 'react';

import { useAnalyticsEventsFeatureGuard } from '@/pages/Analytics/hooks/useAnalyticsEventsFeatureGuard';
import {
  FEATURE_FLAG_NAMES,
  useIsCompanyFeatureFlagEnabled,
} from '@/api/featureFlag';

export default function AnalyticsNav() {
  const location = useLocation();
  const { t } = useTranslation();

  const { anchorEl, open, handleAnchorClick, handleAnchorClose } =
    useMenuAnchor();

  const analyticsNavItems = useAnalyticsNavItems();

  return (
    <>
      <NavMenuItemToolTip
        title={t('nav.analytics', {
          defaultValue: 'Analytics',
        })}
        placement="right"
        enterDelay={100}
        enterNextDelay={100}
      >
        <ListItem
          key="analytics"
          component="span"
          disablePadding
          sx={(theme) => ({
            ...getNavMenuItemStyles(
              theme,
              location.pathname.includes('analytics'),
            ),
            cursor: 'pointer',
          })}
          onClick={handleAnchorClick}
        >
          <Icon icon="analytics" size={20} sx={{ flexShrink: 0 }} />
        </ListItem>
      </NavMenuItemToolTip>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleAnchorClose}
        elevation={0}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transitionDuration={250}
        disableAutoFocusItem={true}
        sx={{
          '& .MuiMenu-paper': {
            backgroundColor: 'darkBlue.90',
            borderRadius: '8px',
            minWidth: '260px',
          },
        }}
      >
        <Typography
          variant="subtitle"
          sx={(theme) => ({
            display: 'block',
            color: theme.palette.white,
            textTransform: 'uppercase',
            margin: theme.spacing(1, 2),
          })}
        >
          {t('nav.analytics', {
            defaultValue: 'Analytics',
          })}
        </Typography>
        <InfiniteScroll>
          <Box maxHeight="365px">
            {analyticsNavItems.map((item) => {
              return (
                <NavLink
                  to={item.to}
                  style={{ textDecoration: 'none' }}
                  key={item.label}
                >
                  {({ isActive }) => (
                    <ListItem
                      component="span"
                      disablePadding
                      sx={(theme) => ({
                        ...getNavMenuItemStyles(theme, isActive),
                        padding: theme.spacing(1.5, 2),
                        borderRadius: 'none',
                      })}
                      onClick={handleAnchorClose}
                    >
                      <Typography
                        variant="body1"
                        sx={(theme) => ({
                          marginLeft: theme.spacing(1),
                          color: theme.palette.white,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '200px',
                        })}
                      >
                        {item.title}
                      </Typography>
                    </ListItem>
                  )}
                </NavLink>
              );
            })}
          </Box>
        </InfiniteScroll>
      </Menu>
    </>
  );
}

export function useAnalyticsNavItems() {
  const routeTo = useRouteWithLocale();
  const { check } = usePermissionWrapper();
  const { t } = useTranslation();

  const [canViewConversationAnalytics, canViewSalesAnalytics] = check([
    PERMISSION_KEY.analyticsConversationView,
    PERMISSION_KEY.analyticsSalesView,
  ]);
  const eventsFeatureGuard = useAnalyticsEventsFeatureGuard();
  const { data: canViewTopicAnalytics } = useIsCompanyFeatureFlagEnabled(
    FEATURE_FLAG_NAMES.ANALYTICS_TOPIC,
  );

  return useMemo(
    () =>
      [
        {
          to: routeTo(ROUTES.analyticsConversations),
          label: 'Conversations',
          title: t('analytics.conversations.title', {
            defaultValue: 'Conversations',
          }),
          enabled: canViewConversationAnalytics,
        },
        {
          to: routeTo(ROUTES.analyticsSales),
          label: 'Sales',
          title: t('analytics.sales.title', {
            defaultValue: 'Sales',
          }),
          enabled: canViewSalesAnalytics,
        },
        {
          to: routeTo(ROUTES.analyticsEvents),
          label: 'Events',
          title: t('analytics.events.title', {
            defaultValue: 'Events',
          }),
          enabled: eventsFeatureGuard.dashboardEnabled,
        },
        {
          to: routeTo(ROUTES.analyticsTopics),
          label: 'Topics',
          title: t('analytics.topics.title', {
            defaultValue: 'Topics',
          }),
          // TODO: update to determine by RBAC permission only in phase 2
          enabled: canViewConversationAnalytics && canViewTopicAnalytics,
        },
      ].filter((item) => item.enabled),
    [
      routeTo,
      t,
      canViewConversationAnalytics,
      canViewSalesAnalytics,
      eventsFeatureGuard.dashboardEnabled,
      canViewTopicAnalytics,
    ],
  );
}
