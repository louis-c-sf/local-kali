import { Box, Button, ListItem, Stack } from '@mui/material';
import { TFunction } from 'i18next';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, To } from 'react-router-dom';

import { FEATURE_FLAG_NAMES } from '@/api/featureFlag';
import { useUserDefaultWorkspace } from '@/api/tenantHub';
import { ReactComponent as CircleLogo } from '@/assets/logo/sleekflow-logo-circle.svg';
import { ScrollArea } from '@/components/ScrollArea';
import { ROUTES } from '@/constants/navigation';
import { PERMISSION_KEY, PermissionKey } from '@/constants/permissions';
import { useRouteWithLocale } from '@/hooks/useRouteWithLocale/useRouteWithLocale';
import useSnackbar from '@/hooks/useSnackbar';
import { useAISettingsRoleBasedAccessControl } from '@/pages/AiSettings/hooks/useAISettingsRoleBasedAccessControl';
import AnalyticsNav from '@/pages/Analytics/analyticsNav';
import { useAnalyticsRoleBasedAccessControl } from '@/pages/Analytics/hooks/useAnalyticsRoleBasedAccessControl';
import { useBroadcastRoleBasedAccessControl } from '@/pages/Broadcasts/hooks/useBroadcastRoleBasedAccessControl';
import { useChannelsRulesGuard } from '@/pages/Channels/hooks/useChannelsRulesGuard';
import CustomObjectDataNav from '@/pages/CustomObjectData/CustomObjectDataNav';
import useCustomObjectDataAccessControl from '@/pages/CustomObjectData/hooks/useCustomObjectDataAccessControl';
import { useFlowBuilderRoleBasedAccessControl } from '@/pages/FlowBuilder/hooks/useFlowBuilderRoleBasedAccessControl';
import { useIntegrationsRoleBasedAccessControl } from '@/pages/Integrations/hooks/useIntegrationsRoleBasedAccessControl';
import InviteUserDialog from '@/pages/Settings/SettingsUserManagement/InviteUserDialog';
import { useUserManagementRuleGuard } from '@/pages/Settings/hooks/useCompanySettingsRuleGuard';
import BackgroundTaskManager from '@/signalr/BackgroundTaskManager/BackgroundTaskManager';
import {
  getDebugModeFromLocalStorage,
  useDebugMode,
} from '@/utils/useDebugMode';

import { useCommerceHubAccessControl } from '../../pages/Commerce/hooks/useCommerceHubAccessControl';
import { useContactsAccessControl } from '../../pages/Contacts/hooks/useContactsAccessControl';
import Icon, { IconProps } from '../Icon';
import { NavMenuItemToolTip } from './NavMenuItemTooltip';
import SubNavMenu from './SubNavMenu';
import { getNavMenuItemStyles } from './helpers';
import {
  CustomConditionContext,
  useModuleVisibleControl,
} from './useModuleVisibleControl';

export const SIDEBAR_WIDTH = 76;

export type NavItem = {
  to: string;
  label: string;
  icon: IconProps['icon'];
  oldAccessControlKey?:
    | keyof ReturnType<typeof useBroadcastRoleBasedAccessControl>
    | keyof ReturnType<typeof useFlowBuilderRoleBasedAccessControl>
    | keyof ReturnType<typeof useAISettingsRoleBasedAccessControl>
    | keyof ReturnType<typeof useIntegrationsRoleBasedAccessControl>
    | keyof ReturnType<typeof useAnalyticsRoleBasedAccessControl>
    | keyof ReturnType<typeof useCustomObjectDataAccessControl>
    | keyof ReturnType<typeof useContactsAccessControl>
    | keyof ReturnType<typeof useChannelsRulesGuard>
    | keyof ReturnType<typeof useUserManagementRuleGuard>
    | keyof ReturnType<typeof useCommerceHubAccessControl>;
  children?: NavItem[];
  openInNewTab?: boolean;
  customAccessCondition?: (context: CustomConditionContext) => boolean;
  rbacPermissionKey?: PermissionKey;
};

const getNavbarItems = (t: TFunction): NavItem[] => [
  {
    to: ROUTES.channels,
    label: t('nav.channels'),
    icon: 'signal' as const,
    customAccessCondition: ({
      oldAccessControl,
      checkPermission,
    }: CustomConditionContext) =>
      checkPermission(
        [PERMISSION_KEY.channelView],
        [oldAccessControl.canAccessChannels],
      )[0],
  },
  { to: ROUTES.inbox, label: t('nav.inbox'), icon: 'inbox' },
  {
    to: ROUTES.tickets,
    label: t('nav.tickets', 'Tickets'),
    icon: 'ticket',
    customAccessCondition: ({
      checkPermission,
      companyEnabledFeatureFlagMap,
    }: CustomConditionContext) => {
      return (
        !!companyEnabledFeatureFlagMap?.[FEATURE_FLAG_NAMES.TICKETING] &&
        checkPermission([PERMISSION_KEY.ticketingAccess])[0]
      );
    },
  },
  {
    to: ROUTES.contacts,
    label: t('nav.contacts'),
    icon: 'contacts',
    rbacPermissionKey: PERMISSION_KEY.contactsAccess,
  },
  {
    to: ROUTES.broadcasts,
    label: t('nav.broadcasts'),
    icon: 'broadcasts',
    oldAccessControlKey: 'canViewBroadcasts' as const,
    rbacPermissionKey: PERMISSION_KEY.broadcastView,
  },
  {
    to: ROUTES.flowBuilder,
    label: t('nav.flow-builder'),
    icon: 'dataflow-downwards',
    oldAccessControlKey: 'canUseFlow' as const,
    rbacPermissionKey: PERMISSION_KEY.flowBuilderView,
  },
  {
    to: ROUTES.analytics,
    label: t('nav.analytics'),
    icon: 'analytics',
    customAccessCondition: ({
      oldAccessControl,
      checkPermission,
    }: CustomConditionContext) =>
      checkPermission(
        [
          PERMISSION_KEY.analyticsConversationView,
          PERMISSION_KEY.analyticsEventsView,
          PERMISSION_KEY.analyticsSalesView,
        ],
        [
          oldAccessControl.canViewAnalytics,
          oldAccessControl.canViewAnalytics,
          oldAccessControl.canViewAnalytics,
        ],
      ).some(Boolean),
  },
  {
    to: ROUTES.integrations.index,
    label: t('nav.integrations'),
    icon: 'puzzle-piece',
    rbacPermissionKey: PERMISSION_KEY.integrationsView,
    oldAccessControlKey: 'canViewIntegrationsSettings',
  },
  {
    to: ROUTES.commerceHub,
    label: t('nav.commerce-hub'),
    icon: 'shopping-cart',
    customAccessCondition: (context) =>
      context.oldAccessControl.canViewCommerceHub,
  },
  {
    to: ROUTES.aiSettings,
    label: t('nav.ai-settings'),
    icon: 'star-ai' as const,
    oldAccessControlKey: 'canViewAISettings' as const,
    rbacPermissionKey: PERMISSION_KEY.aiView,
  },
  {
    to: ROUTES.customObjectData,
    label: t('nav.custom-object-data'),
    icon: 'database',
    oldAccessControlKey: 'canAccessCustomObjectFeature',
    rbacPermissionKey: PERMISSION_KEY.customObjectsDataAccess,
  },
];

const getFooterItems = (t: TFunction): NavItem[] => [
  { to: ROUTES.settings, label: t('nav.settings'), icon: 'settings' },
  {
    label: t('nav.help-and-support', { defaultValue: 'help and support' }),
    icon: 'help-circle',
    to: 'help-and-support',
    children: [
      {
        to: 'https://help.sleekflow.io/',
        label: t('nav.help-center', { defaultValue: 'Help center' }),
        icon: 'book-open',
        openInNewTab: true,
      },
      {
        to: 'https://share.hsforms.com/1o8NZAO0mRJuPWLqxeFeDKAcdz4m',
        label: t('nav.submit-ticket', {
          defaultValue: 'Submit support ticket',
        }),
        icon: 'email',
        openInNewTab: true,
      },
    ],
  },
];

export default memo(function Navbar() {
  const { t } = useTranslation();
  const checkPermissionModuleVisible = useModuleVisibleControl();

  const { data: defaultUserWorkspace } = useUserDefaultWorkspace();
  const toggleDebugValue = useDebugMode((state) => state.toggleDebugValue);
  const snackbar = useSnackbar();

  return (
    <Box component="nav" sx={{ zIndex: 1000 }} width={SIDEBAR_WIDTH}>
      <Box
        sx={{
          backgroundColor: 'darkBlue.90',
          height: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          flexDirection: 'column',
        }}
      >
        <Box
          display="flex"
          height="100%"
          flex={0}
          alignItems="center"
          position="relative"
          padding="16px"
        >
          <Box
            display="flex"
            alignItems="center"
            padding="0 2px"
            overflow="hidden"
            height={40}
            width={1}
            onClick={() => {
              if (import.meta.env.VITE_USER_NODE_ENV === 'production') {
                return;
              }

              toggleDebugValue();
              snackbar.info(
                getDebugModeFromLocalStorage()
                  ? t(
                      'debug-mode.toggled-on',
                      'You have toggled on debug mode. Debug mode is not available in production',
                    )
                  : t(
                      'debug-mode.toggled-off',
                      'You have toggled off debug mode',
                    ),
                { id: 'debug-mode-toggle' },
              );
            }}
          >
            <NavMenuItemToolTip
              title={defaultUserWorkspace?.server_location ?? ''}
              placement="right"
              enterDelay={100}
              enterNextDelay={100}
            >
              <span>
                <CircleLogo
                  width={40}
                  height={40}
                  style={{ flexShrink: 0, cursor: 'pointer' }}
                />
              </span>
            </NavMenuItemToolTip>
          </Box>
        </Box>
        <ScrollArea sx={{ flex: 'auto' }} onDark>
          <Stack spacing="4px" padding="0 16px">
            {getNavbarItems(t).map((item) => {
              if (
                checkPermissionModuleVisible({
                  oldAccessControlKey: item.oldAccessControlKey,
                  customCondition: item.customAccessCondition,
                  permissionKey: item.rbacPermissionKey,
                })
              ) {
                if (item.to === ROUTES.analytics) {
                  return <AnalyticsNav key={item.to} />;
                }
                if (item.to === ROUTES.customObjectData) {
                  return <CustomObjectDataNav key={item.to} />;
                }
                return <NavMenuItem key={item.to} {...item} />;
              }
              return null;
            })}
          </Stack>
        </ScrollArea>
        <Stack spacing="4px" padding="16px" flex={0}>
          <BackgroundTaskManager />
          {checkPermissionModuleVisible({
            customCondition: ({ oldAccessControl }) =>
              oldAccessControl.canInviteUser,
          }) && (
            <InviteUserDialog
              renderButton={({ setOpen, isOpen }) => (
                <NavMenuClickableItem
                  icon="users-add"
                  label={t('nav.invite-users')}
                  onClick={setOpen}
                  isActive={isOpen}
                />
              )}
            />
          )}
          {getFooterItems(t).map((item) => (
            <NavMenuItem key={item.to} {...item} />
          ))}
        </Stack>
      </Box>
    </Box>
  );
});

function NavMenuItem({
  label,
  icon,
  to,
  children,
}: {
  to: To;
  label: string;
  icon: IconProps['icon'];
  children?: NavItem[];
}) {
  const routeTo = useRouteWithLocale();
  if (children?.length) {
    return (
      <SubNavMenu title={label} icon={icon}>
        {children}
      </SubNavMenu>
    );
  }
  return (
    <NavMenuItemToolTip
      title={label}
      placement="right"
      enterDelay={100}
      enterNextDelay={100}
    >
      <NavLink to={routeTo(to)} style={{ textDecoration: 'none' }}>
        {({ isActive }) => (
          <ListItem
            component="span"
            disablePadding
            sx={(theme) => getNavMenuItemStyles(theme, isActive)}
          >
            <Icon icon={icon} size={20} sx={{ flexShrink: 0 }} />
          </ListItem>
        )}
      </NavLink>
    </NavMenuItemToolTip>
  );
}

function NavMenuClickableItem({
  label,
  icon,
  onClick,
  isActive = false,
}: {
  label: string;
  icon: IconProps['icon'];
  onClick: () => void;
  isActive?: boolean;
}) {
  return (
    <NavMenuItemToolTip
      title={label}
      placement="right"
      enterDelay={100}
      enterNextDelay={100}
    >
      <ListItem
        component={Button}
        disablePadding
        onClick={onClick}
        sx={(theme) => ({
          ...getNavMenuItemStyles(theme, isActive),
          minWidth: 'auto',
        })}
      >
        <Icon icon={icon} size={20} sx={{ flexShrink: 0 }} />
      </ListItem>
    </NavMenuItemToolTip>
  );
}
