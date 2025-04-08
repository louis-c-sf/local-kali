import {
  Box,
  Button,
  CircularProgress,
  ClickAwayListener,
  Divider,
  Link,
  List,
  ListItem,
  Stack,
  Typography,
} from '@mui/material';
import { Suspense } from 'react';
import { useTranslation, type TFunction } from 'react-i18next';

import type { SubscriptionPlan } from '@/api/types';
import { ROUTES } from '@/constants/navigation';
import { useSuspenseAccessRuleGuard } from '@/pages/Contacts/shared/accessRuleGuard/useAccessRuleGuard';
import {
  isFreeOrFreemiumPlan,
  isProPlan,
} from '@/utils/subscription-plan-checker';

import CheckListItem from './CheckListItem';

export default function CheckList(props: { onClose: () => void }) {
  const { onClose } = props;
  const { t } = useTranslation();

  return (
    <ClickAwayListener onClickAway={onClose}>
      <List
        sx={(theme) => ({
          position: 'absolute',
          top: '48px',
          left: '-79px',
          backgroundColor: 'white',
          width: '300px',
          zIndex: 101,
          boxShadow: theme.shadows[2],
          borderRadius: 2,
          padding: '0',
        })}
      >
        <ListHeader />
        <Divider />
        <Suspense
          fallback={
            <Stack flex={1} justifyContent="center" alignItems="center" py={2}>
              <CircularProgress sx={{ mb: '8px' }} />
              <Typography variant="body2">{t('general.loading')}</Typography>
            </Stack>
          }
        >
          <ListContent />
          <Divider />
          <ListFooter />
        </Suspense>
      </List>
    </ClickAwayListener>
  );
}

function ListHeader() {
  const { t } = useTranslation();

  return (
    <ListItem
      sx={{
        borderBottom: '1px solid grey.30',
        padding: '10px',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <Typography variant="headline3" color="darkBlue.70">
        {t('setupGuide.list.title', {
          defaultValue: 'Setup guides',
        })}
      </Typography>
    </ListItem>
  );
}

function ListFooter() {
  const { t } = useTranslation();
  const accessRulesGuard = useSuspenseAccessRuleGuard();
  const currentPlan =
    accessRulesGuard.company.data?.currentPlan.billRecord?.subscriptionPlan;
  const isFreePlan = Boolean(currentPlan && isFreeOrFreemiumPlan(currentPlan));

  if (isFreePlan) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          fontSize: '14px',
          padding: '12px',
        }}
      >
        <Box
          sx={{
            marginBottom: '8px',
            color: 'grey.90',
            fontWeight: '400',
            textAlign: 'center',
          }}
        >
          {t('setupGuide.list.schedule', {
            defaultValue:
              'Schedule a personal call tailored for your business needs',
          })}
        </Box>
        <Button
          variant="contained"
          sx={{ marginBottom: '8px', width: '276px' }}
          component={Link}
          underline="none"
          href="https://sleekflow.io/book-a-demo"
          target="_blank"
          rel="noopener"
          aria-label="go-to-book-a-demo"
        >
          {t('setupGuide.list.book-demo', {
            defaultValue: 'Book a demo',
          })}
        </Button>
        <Button
          variant="outlined"
          sx={{ width: '276px' }}
          component={Link}
          underline="none"
          href="https://help.sleekflow.io/"
          target="_blank"
          rel="noopener"
          aria-label="go-to-help-center"
        >
          {t('setupGuide.list.help-center', {
            defaultValue: 'Learn more in Help Center',
          })}
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={(theme) => ({
        color: theme.palette.componentToken.button.textTertiaryEnabled,
        fontWeight: '600',
        fontSize: '14px',
        padding: '20px 0',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
      })}
      component={Link}
      underline="none"
      href="https://help.sleekflow.io/"
      target="_blank"
      rel="noopener"
      aria-label="go-to-help-center"
    >
      {t('setupGuide.list.help-center', {
        defaultValue: 'Learn more in Help Center',
      })}
    </Box>
  );
}

function ListContent() {
  const { t } = useTranslation();
  const accessRulesGuard = useSuspenseAccessRuleGuard();
  const currentPlan =
    accessRulesGuard.company.data?.currentPlan.billRecord?.subscriptionPlan;
  const listItems = getCheckListItems(t, currentPlan);

  return (
    <Stack divider={<Divider />}>
      {listItems.map((item, index) => (
        <CheckListItem
          key={`${item.title}_${index}`}
          index={index}
          title={item.title}
          description={item.description}
          buttonText={item.buttonText}
          redirectUrl={item.redirectUrl}
        />
      ))}
    </Stack>
  );
}

function getCheckListItems(
  t: TFunction,
  currentPlan: SubscriptionPlan | undefined,
) {
  const isFreePlan = Boolean(currentPlan && isFreeOrFreemiumPlan(currentPlan));
  const isProPlanCheck = Boolean(currentPlan && isProPlan(currentPlan));

  const channels = {
    title: t('setupGuide.list.channel.title', {
      defaultValue: 'Connect channels',
    }),
    description: t('setupGuide.list.channel.description', {
      defaultValue:
        'Start connecting your channels to SleekFlow and unlock the power of Inbox',
    }),
    buttonText: t('setupGuide.list.channel.button', {
      defaultValue: 'Go to Channels',
    }),
    redirectUrl: ROUTES.channels,
  };

  const inviteUsers = {
    title: t('setupGuide.list.user.title', {
      defaultValue: 'Invite users',
    }),
    description: t('setupGuide.list.user.description', {
      defaultValue:
        'Add your teammates to SleekFlow and start collaborating on work',
    }),
    buttonText: t('setupGuide.list.user.button', {
      defaultValue: 'Go to user management',
    }),
    redirectUrl: ROUTES.settingsUserManagement,
  };

  const upgradePlan = {
    title: t('setupGuide.list.upgrade.title', {
      defaultValue: 'Upgrade your plan',
    }),
    description: t('setupGuide.list.upgrade.description', {
      defaultValue:
        'Upgrade your plan for advanced features and increased limits',
    }),
    buttonText: t('setupGuide.list.upgrade.button', {
      defaultValue: 'Go to plans and billings',
    }),
    redirectUrl: ROUTES.settingsSubscriptions,
  };

  const manageSubscription = {
    title: t('setupGuide.list.manage-subscription.title', {
      defaultValue: 'Manage subscriptions and add-ons',
    }),
    description: t('setupGuide.list.manage-subscription.description', {
      defaultValue:
        'Change your plan or explore useful add-ons to fulfil your business needs',
    }),
    buttonText: t('setupGuide.list.manage-subscription.button', {
      defaultValue: 'Go to plans and billings',
    }),
    redirectUrl: ROUTES.settingsSubscriptions,
  };

  const createTeam = {
    title: t('setupGuide.list.create-teams.title', {
      defaultValue: 'Create teams',
    }),
    description: t('setupGuide.list.create-teams.description', {
      defaultValue: 'Create teams to better allocate customer conversations',
    }),
    buttonText: t('setupGuide.list.create-teams.button', {
      defaultValue: 'Go to team management',
    }),
    redirectUrl: ROUTES.settingsTeamManagement,
  };

  return isFreePlan
    ? [channels, inviteUsers, upgradePlan]
    : isProPlanCheck
    ? [channels, inviteUsers, manageSubscription]
    : [channels, inviteUsers, createTeam, manageSubscription];
}
