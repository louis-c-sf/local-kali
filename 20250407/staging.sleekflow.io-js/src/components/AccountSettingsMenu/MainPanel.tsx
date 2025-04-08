import {
  Box,
  Button,
  Divider,
  ListItemText,
  Stack,
  Switch,
  Tooltip,
  Typography,
} from '@mui/material';
import { useInjection } from 'inversify-react';
import { useObservableState } from 'observable-hooks';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { v4 as uuid4 } from 'uuid';

import { AppearOnlineDict } from '@/api/company';
import { usePostDeregisterDeviceLimitMutation } from '@/api/deviceLimit';
import { ROUTES } from '@/constants/navigation';
import { LogoutOptions } from '@/hooks/useAuth';
import { useRouteWithLocale } from '@/hooks/useRouteWithLocale/useRouteWithLocale';
import useSnackbar from '@/hooks/useSnackbar';
import { useSubscriptionRedirectRoute } from '@/hooks/useSubscriptionRedirectRoute';
import { usePlansAndBillingsRuleGuard } from '@/pages/Settings/hooks/usePlansAndBillingsRuleGuard';
import { testIds } from '@/playwright/lib/test-ids';
import { CACHE_REFRESHING_BEHAVIOUR } from '@/services/rxjs-utils/rxjs-utils';
import { BROWSER_ID_STORAGE_KEY } from '@/services/signal-r/signal-r.service';
import { UserService } from '@/services/user.service';
import { colors } from '@/themes';
import { trackEvent, TRACKING_EVENTS } from '@/utils/mixpanelLibs';
import { generateV1RedirectionLink } from '@/utils/v1-utils';

import Icon from '../Icon';
import StaffAvatar from '../StaffAvatar';
import { AccountSettingsPanel } from './constants';
import isAccountAppearOnline from './helpers/isAccountAppearOnline';
import { ListItemButton, MenuList } from './styled';

export default function MainPanel({
  name,
  email,
  goTo,
  logout,
}: {
  name: string;
  email: string;
  goTo: (panel: AccountSettingsPanel) => void;
  logout: (options: LogoutOptions) => void;
}) {
  const { t } = useTranslation();
  const snackbar = useSnackbar();
  const routeTo = useRouteWithLocale();
  const { canViewSubscriptions } = usePlansAndBillingsRuleGuard();
  const browserId =
    window.localStorage.getItem(BROWSER_ID_STORAGE_KEY) ?? uuid4();
  const mutateDeregisterDeviceLimit = usePostDeregisterDeviceLimitMutation();
  const userService = useInjection(UserService);

  const myStaff$ = useMemo(() => {
    return userService.getMyStaff$(
      CACHE_REFRESHING_BEHAVIOUR.ALWAYS_REFRESH_CLIENT,
    );
  }, [userService]);
  const myStaff = useObservableState(myStaff$);
  const redirectSubscriptionRoute = useSubscriptionRedirectRoute();
  if (!myStaff) {
    return null;
  }

  return (
    <>
      <Box p="16px">
        <Stack direction="row" alignItems="center" spacing="12px" mb="12px">
          <StaffAvatar userId={myStaff.id} alt={name} />
          <Stack>
            <Typography variant="headline3">{name}</Typography>
            <Typography variant="body2">{email}</Typography>
          </Stack>
        </Stack>
        <Button
          variant="outlined"
          fullWidth
          component={Link}
          to={routeTo(ROUTES.settings)}
        >
          {t('manage-account')}
        </Button>
      </Box>
      <Divider />
      <MenuList
        data-testid={testIds.accountSettingsMenuPreferencesList}
        aria-labelledby="preferences-list"
        subheader={
          <ListHeader id="preferences-list">{t('preferences')}</ListHeader>
        }
      >
        <Tooltip
          title={t('appear-online-toggle-tip', {
            defaultValue:
              "This controls the user's activity status. When set to 'away,' user will not be automatically assigned to new conversations by the queue.",
          })}
          placement="left-start"
        >
          <ListItemButton
            onClick={() => {
              userService
                .updateStatus$(
                  isAccountAppearOnline(myStaff.status)
                    ? AppearOnlineDict.Away
                    : AppearOnlineDict.Active,
                )
                .subscribe();
            }}
          >
            {isAccountAppearOnline(myStaff.status) ? (
              <ListItemText
                primary={
                  <Typography variant="menu1">
                    {t('appear-online-set-offline', {
                      defaultValue: 'Set status to away',
                    })}
                  </Typography>
                }
              />
            ) : (
              <ListItemText
                primary={
                  <Typography variant="menu1">
                    {t('appear-online-set-online', {
                      defaultValue: 'Set status to online',
                    })}
                  </Typography>
                }
              />
            )}
          </ListItemButton>
        </Tooltip>
        <Tooltip title={t('agent-name-toggle-tip')} placement="left-start">
          <ListItemButton>
            <ListItemText
              primary={
                <Typography variant="menu1">
                  {t('agent-name-toggle')}
                </Typography>
              }
            />

            <Switch
              onChange={() => {
                const inverse = !myStaff.shouldShowSenderName;

                userService.updateIsShowName$(inverse).subscribe({
                  error: (err) => {
                    console.error(err);

                    snackbar.error(t('show-agent-name-failed'));
                  },
                });
              }}
              checked={myStaff.shouldShowSenderName}
            />
          </ListItemButton>
        </Tooltip>

        <ListItemButton onClick={() => goTo(AccountSettingsPanel.LANGUAGE)}>
          <Icon icon="globe" size={16} />
          <ListItemText
            sx={{ ml: '8px' }}
            primary={
              <Typography variant="menu1">{t('language-title')}</Typography>
            }
          />
          <Icon icon="chevron-right" size={20} />
        </ListItemButton>
      </MenuList>
      <Divider />
      <MenuList
        data-testid={testIds.accountSettingsMenuGeneralList}
        aria-labelledby="account-settings-list"
        subheader={
          <ListHeader id="account-settings-list">
            {t('general-setting-title')}
          </ListHeader>
        }
      >
        {canViewSubscriptions && (
          <ListItemButton
            //temp redirect to v1, Remove it when v2 page is ready
            href={redirectSubscriptionRoute}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ListItemText
              primary={<Typography variant="menu1">{t('billing')}</Typography>}
            />
            <Icon icon="chevron-right" size={20} />
          </ListItemButton>
        )}
        <ListItemButton
          data-testid={testIds.accountSettingsMenuLogoutButton}
          onClick={() => {
            mutateDeregisterDeviceLimit.mutate(
              { isTakeOver: false, browserId },
              {
                onSuccess: () => {
                  logout({ logEvent: 'web_logout_manually' });
                },
              },
            );
          }}
        >
          <ListItemText
            primary={<Typography variant="menu1">{t('log-out')}</Typography>}
          />
          <Icon icon="chevron-right" size={20} />
        </ListItemButton>
        <ListItemButton
          component="a"
          href={generateV1RedirectionLink({
            path: '/',
          })}
          onClick={() => trackEvent(TRACKING_EVENTS.switchToV1)}
          rel="nofollow noopener"
        >
          <ListItemText
            primary={
              <Typography variant="menu1">
                {t('switch-to-sleekflow-v1')}
              </Typography>
            }
          />
        </ListItemButton>
        <AppVersion />
      </MenuList>
    </>
  );
}

function ListHeader({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  return (
    <Box id={id} p="16px" pb="8px">
      <Typography
        variant="headline5"
        sx={{ textTransform: 'uppercase', color: colors.grey80 }}
      >
        {children}
      </Typography>
    </Box>
  );
}

export const getAppVersion = () => {
  const commitHash = import.meta.env.DEV
    ? 'local'
    : import.meta.env.VITE_VERCEL_GIT_COMMIT_SHA?.substring(0, 7);

  const version = [`v${import.meta.env.VITE_WEB_APP_VERSION}`, commitHash]
    .filter(Boolean)
    .join('_');

  return version;
};

function AppVersion() {
  const version = getAppVersion();

  return (
    <Typography
      variant="body2"
      color="contentPlaceholder"
      fontWeight={600}
      textAlign="center"
      mt={1}
    >
      {version}
    </Typography>
  );
}
