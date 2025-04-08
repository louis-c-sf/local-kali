import {
  Box,
  Divider,
  IconButton,
  List,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useMedia } from 'react-use';

import { useGetIntegrationAlertConfigQuery } from '@/api/integration';
import { useGetIsRbacEnabledQuery } from '@/api/settings';
import Icon from '@/components/Icon';
import { ScrollArea } from '@/components/ScrollArea';
import SecondaryNav from '@/components/SecondaryNav';
import SecondaryNavItem, {
  NavItem,
} from '@/components/SecondaryNav/SecondaryNavItem';
import SecondaryNavSection from '@/components/SecondaryNav/SecondaryNavSection';
import { ROUTES } from '@/constants/navigation';
import { testIds } from '@/playwright/lib/test-ids';

import {
  useCompanyDetailsRuleGuard,
  useUserManagementRuleGuard,
  useTeamManagementRuleGuard,
  useRoleManagementRuleGuard,
  useAuditLogRuleGuard,
} from '../hooks/useCompanySettingsRuleGuard';
import { useSettingAccessRuleGuard } from '../hooks/useLegacySettingAccessRuleGuard';
import { usePlansAndBillingsRuleGuard } from '../hooks/usePlansAndBillingsRuleGuard';
import { useAnalyticsEventsFeatureGuard } from '@/pages/Analytics/hooks/useAnalyticsEventsFeatureGuard';

type SettingNavItem = NavItem & { hidden?: boolean };

const getPathWithoutLocale = (pathName: string) => {
  const basePath = pathName.split('/');
  return basePath.slice(2).join('/');
};

export default function SettingsMenu({
  open,
  toggleMenu,
}: {
  open: boolean;
  toggleMenu: () => void;
}) {
  const theme = useTheme();
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const {
    isManageCustomObjectsAllowToView,
    isDataPrivacyAllowToView,
    isLabelsAllowToManage,
    isCustomFieldsAllowToManage,
    isDeletedContactAllowToView,
    isIntegrationDisconnectAlertAllowToView,
    isTicketingManagementAllowToView,
    isInboxSettingsAllowToView,
    isConversionLoggingAllowToView,
  } = useSettingAccessRuleGuard();
  const { canViewCompanyDetail } = useCompanyDetailsRuleGuard();
  const { canViewUserManagement } = useUserManagementRuleGuard();
  const { canViewTeamManagement } = useTeamManagementRuleGuard();
  const { canViewRoleManagement } = useRoleManagementRuleGuard();
  const { canViewAuditLog } = useAuditLogRuleGuard();
  const {
    canViewSubscriptions,
    canViewInvoice,
    canViewSupportServices,
    canViewAddons,
  } = usePlansAndBillingsRuleGuard();

  const integrationAlertConfig = useGetIntegrationAlertConfigQuery();
  const conversionLoggingFeatureGuard = useAnalyticsEventsFeatureGuard();

  const basePath = getPathWithoutLocale(location.pathname);
  const selectedId = id || basePath;

  const isDesktop = useMedia(`(min-width:${theme.breakpoints.values.lg}px)`);
  const planAndBillingWording = t('settings.menu.plans-and-billings.title', {
    defaultValue: 'Plans and billings',
  });
  const { data: isRbacEnabled } = useGetIsRbacEnabledQuery({});

  const preferenceList: SettingNavItem[] = useMemo(
    () => [
      {
        id: ROUTES.settings,
        label: t('settings.menu.preferences.general', {
          defaultValue: 'General',
        }),
      },
    ],
    [t],
  );
  const companySettingsList: SettingNavItem[] = useMemo(
    () =>
      [
        {
          id: ROUTES.settingsCompanyDetail,
          label: t('settings.menu.company-settings.company-details', {
            defaultValue: 'Company details',
          }),
          hidden: !canViewCompanyDetail,
        },
        {
          id: ROUTES.settingsUserManagement,
          label: t('settings.menu.company-settings.user-management', {
            defaultValue: 'User management',
          }),
          hidden: !canViewUserManagement,
        },
        {
          id: ROUTES.settingsTeamManagement,
          label: t('settings.menu.company-settings.team-management', {
            defaultValue: 'Team management',
          }),
          hidden: !canViewTeamManagement,
        },
        ...(isRbacEnabled?.is_enabled
          ? [
              {
                id: ROUTES.settingsRolesAndPermissions,
                label: t(
                  'settings.menu.company-settings.roles-and-permissions',
                  {
                    defaultValue: 'Roles and permissions',
                  },
                ),
                hidden: !canViewRoleManagement,
              },
            ]
          : []),
        {
          id: ROUTES.settingsAuditLog,
          label: t('settings.menu.company-settings.audit-log', {
            defaultValue: 'Audit log',
          }),
          hidden:
            import.meta.env.VITE_USER_NODE_ENV === 'production' ||
            !canViewAuditLog,
        },
        {
          id: ROUTES.settingsDataPrivacy,
          label: t('settings.menu.company-settings.data-privacy', {
            defaultValue: 'Data privacy',
          }),
          hidden: !isDataPrivacyAllowToView,
        },
        {
          id: ROUTES.settingsInboxSettings,
          label: t('settings.menu.company-inbox.inbox-settings', {
            defaultValue: 'Inbox settings',
          }),
          hidden: !isInboxSettingsAllowToView(),
        },
        {
          id: ROUTES.settingsIntegrationDisconnectionAlerts,
          label: t(
            'settings.menu.company-settings.integration-disconnection-alert',
            {
              defaultValue: 'Integration disconnection alerts',
            },
          ),
          hidden:
            !isIntegrationDisconnectAlertAllowToView() ||
            !integrationAlertConfig.data?.id,
        },
      ].filter((menuItem) => !menuItem.hidden),
    [
      t,
      canViewCompanyDetail,
      canViewUserManagement,
      canViewTeamManagement,
      isRbacEnabled?.is_enabled,
      canViewRoleManagement,
      canViewAuditLog,
      isDataPrivacyAllowToView,
      planAndBillingWording,
      canViewSubscriptions,
      isInboxSettingsAllowToView,
      isIntegrationDisconnectAlertAllowToView,
      integrationAlertConfig.data?.id,
    ],
  );
  const billingList: SettingNavItem[] = useMemo(
    () =>
      [
        {
          id: ROUTES.settingsSubscriptions,
          label: t('settings.menu.plans-and-billings.subscriptions', {
            defaultValue: 'Subscriptions',
          }),
          hidden: !canViewSubscriptions,
        },
        {
          id: ROUTES.settingsAddOns,
          label: t('settings.menu.plans-and-billings.add-ons', {
            defaultValue: 'Add-ons',
          }),
          hidden: !canViewAddons,
        },
        {
          id: ROUTES.settingsSupportServices,
          label: t('settings.menu.plans-and-billings.support-services', {
            defaultValue: 'Support services',
          }),
          hidden: !canViewSupportServices,
        },
        {
          id: ROUTES.settingsInvoices,
          label: t('settings.menu.plans-and-billings.invoices', {
            defaultValue: 'Invoices',
          }),
          hidden: !canViewInvoice,
        },
      ].filter((menuItem) => !menuItem.hidden),
    [
      t,
      canViewSubscriptions,
      canViewAddons,
      canViewSupportServices,
      canViewInvoice,
    ],
  );
  const companyInboxList: SettingNavItem[] = useMemo(
    () =>
      [
        {
          id: ROUTES.settingsTicketing,
          label: t('settings.menu.company-inbox.ticketing', 'Ticketing'),
          disabled: false,
          hidden: !isTicketingManagementAllowToView,
        },
      ].filter((item) => !item.hidden),
    [isTicketingManagementAllowToView, t],
  );

  const contactsAndDataList: SettingNavItem[] = useMemo(() => {
    return [
      {
        id: ROUTES.settingsLabels,
        label: t('settings.menu.contacts-and-data.labels', {
          defaultValue: 'Labels',
        }),
        disabled: false,
        hidden: !isLabelsAllowToManage,
      },
      {
        id: ROUTES.settingsContactPropertiesDefault,
        label: t('settings.menu.contacts-and-data.contact-properties', {
          defaultValue: 'Contact properties',
        }),
        disabled: false,
        hidden: !isCustomFieldsAllowToManage,
      },
      {
        id: ROUTES.settingsCustomObject,
        label: t('settings.menu.contacts-and-data.custom-objects', {
          defaultValue: 'Custom objects',
        }),
        disabled: false,
        hidden: !isManageCustomObjectsAllowToView(),
      },
      {
        id: ROUTES.settingsConversionLogging,
        label: t('settings.menu.contacts-and-data.conversion-logging', {
          defaultValue: 'Conversion logging',
        }),
        disabled: false,
        hidden: !(
          isConversionLoggingAllowToView &&
          conversionLoggingFeatureGuard.settingsEnabled
        ),
      },
      {
        id: ROUTES.settingsDeletedContacts,
        label: t('settings.menu.contacts-and-data.deleted-contact', {
          defaultValue: 'Recently deleted contacts',
        }),
        disabled: false,
        hidden: !isDeletedContactAllowToView(),
      },
    ].filter((menuItem) => !menuItem.hidden);
  }, [
    t,
    isLabelsAllowToManage,
    isManageCustomObjectsAllowToView,
    isDeletedContactAllowToView,
  ]);

  const otherSettingsList: SettingNavItem[] = useMemo(() => {
    return [
      {
        id: ROUTES.settingsSleekFlowLab,
        label: t('settings.menu.other.sleekflow-lab', {
          defaultValue: 'SleekFlow Lab',
        }),
        disabled: false,
      },
    ];
  }, []);

  const onClick = () => {
    if (!isDesktop) {
      toggleMenu();
    }
  };

  return (
    <SecondaryNav
      open={open}
      menuTestId={testIds.settingsMenuDrawer}
      menuToggleTestId={testIds.settingsMenuToggleButton}
      toggleMenu={toggleMenu}
      menuWidth={theme.secondaryMenu.width.md}
    >
      <Stack
        direction="row"
        width="100%"
        paddingX="16px"
        alignItems="center"
        justifyContent="space-between"
      >
        <Typography variant="headline1">
          {t('settings.menu.title', { defaultValue: 'Settings' })}
        </Typography>
        <IconButton
          data-testid={testIds.settingsMenuCloseButton}
          aria-label="Toggle Menu"
          onClick={toggleMenu}
        >
          <Icon icon="layout-flex-align-left" size={20} />
        </IconButton>
      </Stack>
      <List
        component={ScrollArea}
        slotProps={{ viewport: { sx: { overflow: 'hidden scroll' } } }}
        sx={{
          paddingTop: '15px',
          width: '100%',
          paddingX: '16px',
          margin: '0px',
        }}
      >
        <Stack spacing="10px" divider={<Divider />}>
          <SecondaryNavSection
            title={t('settings.menu.preferences.title', {
              defaultValue: 'YOUR PREFERENCES',
            })}
          >
            {preferenceList.map((menuItem) => (
              <Box key={menuItem.id}>
                <SecondaryNavItem
                  disabled={!!menuItem.disabled}
                  selected={menuItem.id === selectedId}
                  to={menuItem.id}
                  label={menuItem.label}
                  onClick={onClick}
                />
              </Box>
            ))}
          </SecondaryNavSection>
          {companySettingsList.length && (
            <SecondaryNavSection
              title={t('settings.menu.company-settings.title', {
                defaultValue: 'COMPANY SETTINGS',
              })}
            >
              {companySettingsList.map((menuItem) => (
                <Box key={menuItem.id}>
                  <SecondaryNavItem
                    disabled={!!menuItem.disabled}
                    selected={menuItem.id === selectedId}
                    to={menuItem.id}
                    label={menuItem.label}
                    onClick={onClick}
                  />
                </Box>
              ))}
            </SecondaryNavSection>
          )}
          {billingList.length && (
            <SecondaryNavSection
              title={t('settings.menu.plans-and-billings.title', {
                defaultValue: 'Plans and billings',
              })}
            >
              {billingList.map((menuItem) => (
                <Box key={menuItem.id}>
                  <SecondaryNavItem
                    disabled={!!menuItem.disabled}
                    selected={menuItem.id === selectedId}
                    to={menuItem.id}
                    label={menuItem.label}
                    onClick={onClick}
                  />
                </Box>
              ))}
            </SecondaryNavSection>
          )}
          {companyInboxList.length > 0 && (
            <SecondaryNavSection
              title={t('settings.menu.company-inbox.title', {
                defaultValue: 'COMPANY INBOX',
              })}
            >
              {companyInboxList.map((menuItem) => (
                <Box key={menuItem.id}>
                  <SecondaryNavItem
                    disabled={!!menuItem.disabled}
                    selected={menuItem.id === selectedId}
                    to={menuItem.id}
                    label={menuItem.label}
                    onClick={onClick}
                  />
                </Box>
              ))}
            </SecondaryNavSection>
          )}
          <SecondaryNavSection
            title={t('settings.menu.contacts-and-data.title', {
              defaultValue: 'CONTACTS AND DATA',
            })}
          >
            {contactsAndDataList.map((menuItem) => (
              <Box key={menuItem.id}>
                <SecondaryNavItem
                  disabled={!!menuItem.disabled}
                  selected={menuItem.id === selectedId}
                  to={menuItem.id}
                  label={menuItem.label}
                  onClick={onClick}
                />
              </Box>
            ))}
          </SecondaryNavSection>
          <SecondaryNavSection
            title={t('settings.menu.other.title', { defaultValue: 'Other' })}
          >
            {otherSettingsList.map((menuItem) => (
              <Box key={menuItem.id}>
                <SecondaryNavItem
                  disabled={!!menuItem.disabled}
                  selected={menuItem.id === selectedId}
                  to={menuItem.id}
                  label={menuItem.label}
                  onClick={onClick}
                />
              </Box>
            ))}
          </SecondaryNavSection>
        </Stack>
      </List>
    </SecondaryNav>
  );
}
