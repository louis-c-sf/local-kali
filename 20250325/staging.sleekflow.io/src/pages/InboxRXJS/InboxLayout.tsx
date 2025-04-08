import {
  Box,
  CircularProgress,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Outlet } from 'react-router-dom';
import { useLocalStorage, useMedia, useToggle } from 'react-use';

import { RoleType } from '@/api/types';
import { WithAccessDeniedErrorBoundary } from '@/components/AccessDeniedErrorElement/ErrorBoundary';
import { PERMISSION_KEY } from '@/constants/permissions';
import { useRequireRBAC } from '@/hooks/useRequireRBAC';
import ConversationLists from '@/pages/InboxRXJS/ConversationLists';
import ConversationStatusFilter from '@/pages/InboxRXJS/ConversationLists/ConversationStatusFilter';
import InboxHeader from '@/pages/InboxRXJS/InboxHeader';
import PrimaryInboxMenu, {
  INBOX_MENU_WIDTH,
} from '@/pages/InboxRXJS/PrimaryInboxMenu';
import { testIds } from '@/playwright/lib/test-ids';

import Icon from '../../components/Icon';
import { ROUTES } from '../../constants/navigation';
import { useRouteWithLocale } from '../../hooks/useRouteWithLocale/useRouteWithLocale';
import { semanticTokens } from '../../themes';
import { useContactsLimitReasons } from '../Contacts/shared/accessRuleGuard/useContactsLimitReasons';
import SearchFilter from './SearchFilter';

function InboxLayout() {
  useRequireRBAC(
    [PERMISSION_KEY.inboxConversationView],
    [RoleType.ADMIN, RoleType.TEAMADMIN, RoleType.STAFF],
  );

  const { t } = useTranslation();
  const theme = useTheme();
  const isDesktop = useMedia(`(min-width:${theme.breakpoints.values.lg}px)`);
  const [expanded, toggle] = useToggle(isDesktop);

  return (
    <>
      <Box
        data-testid={testIds.inboxPage}
        position="relative"
        sx={{ height: '100%', width: '100%' }}
      >
        <Stack justifyContent="flex-start" height="100%">
          <Stack direction="row">
            <PrimaryInboxMenu open={expanded} toggleMenu={toggle} />
            <Box width="100%">
              <InboxHeader />
              <LimitAlert />
            </Box>
          </Stack>
          <Stack
            sx={(theme) => ({
              containerType: 'size',
              [theme.breakpoints.up('lg')]: {
                marginLeft: expanded ? `${INBOX_MENU_WIDTH}px` : 0,
                transition: theme.transitions.create(['margin'], {
                  easing: theme.transitions.easing.sharp,
                  duration: theme.transitions.duration.leavingScreen,
                }),
              },
              flex: 1,
            })}
          >
            <Suspense
              fallback={
                <Stack flex={1} justifyContent="center" alignItems="center">
                  <CircularProgress sx={{ mb: '8px' }} />
                  <Typography variant="body2">
                    {t('general.loading')}
                  </Typography>
                </Stack>
              }
            >
              <Box height="100%" width="100%" display="flex">
                <Stack
                  data-testid="inbox-conversation-list"
                  width="100%"
                  flexGrow={1}
                  flexShrink={1}
                  height="100%"
                  sx={(theme) => ({
                    overflowY: 'hidden',
                    minWidth: '276px',
                    maxWidth: '360px',
                    transition: theme.transitions.create(['max-width'], {
                      easing: theme.transitions.easing.sharp,
                      duration: theme.transitions.duration.leavingScreen,
                    }),
                    [theme.breakpoints.down('lg')]: {
                      maxWidth: '276px',
                    },
                    [`@container (max-width: ${theme.breakpoints.values.lg}px)`]:
                      {
                        maxWidth: '276px',
                      },
                    borderRight: `1px solid ${theme.palette.gray[30]}`,
                  })}
                >
                  <ConversationStatusFilter />
                  <SearchFilter />
                  <ConversationLists />
                </Stack>
                <Outlet />
              </Box>
            </Suspense>
          </Stack>
        </Stack>
      </Box>
    </>
  );
}

export default WithAccessDeniedErrorBoundary(InboxLayout);

function LimitAlert() {
  const [showAlert, setShowAlert] = useLocalStorage(
    'showInboxLimitAlert',
    true,
  );
  const limitReasons = useContactsLimitReasons();

  const { t } = useTranslation();
  const routeTo = useRouteWithLocale();

  if (!showAlert || !limitReasons.isLimitExceeded) {
    return null;
  }

  return (
    <Stack
      direction={'row'}
      justifyContent={'flex-start'}
      alignItems={'center'}
      sx={{
        p: 2,
        pl: 3,
        backgroundColor: 'red.5',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
      }}
    >
      <Icon
        icon={'alert-triangle'}
        color={semanticTokens.contentError}
        sx={{
          mr: 2,
        }}
      />
      <Typography variant={'body1'} sx={{ color: 'red.90' }}>
        {limitReasons.isReadOnlyError ? (
          t('contacts.block-user-contact-limit.alert-inbox.readonly', {
            defaultValue:
              '{count,number} new chat windows is not displayed due of exceed of contact limit. Contact your workspace admin for managing the plan.',
            count: limitReasons.countOverLimit,
          })
        ) : (
          <>
            {t('contacts.block-user-contact-limit.alert-inbox.admin', {
              defaultValue:
                '{count,number} new chat windows is not displayed due of exceed of contact limit. Purchase additional limit or upgrade plan to prevent service interruption.',
              count: limitReasons.countOverLimit,
            })}
            <Link
              to={routeTo(ROUTES.settingsSubscriptionsManagePlan)}
              style={{
                color: semanticTokens.contentAccent,
                textDecoration: 'none',
                fontWeight: 600,
                marginLeft: '16px',
              }}
            >
              {t('contacts.block-user-contact-limit.alert.manage', {
                defaultValue: 'Manage plan',
              })}
            </Link>
          </>
        )}
      </Typography>
      <Icon
        icon={'x-close'}
        sx={{ cursor: 'pointer', ml: 'auto' }}
        color={semanticTokens.contentError}
        onClick={() => {
          setShowAlert(false);
        }}
      />
    </Stack>
  );
}
