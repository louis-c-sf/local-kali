import { Box, Stack, Typography } from '@mui/material';
import { TFunction } from 'i18next';
import { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

import { useTeamList } from '@/api/company';
import GlobalTopMenu from '@/components/GlobalTopMenu';
import PageTitle from '@/components/PageTitle';
import { useMyProfile } from '@/hooks/useMyProfile';
import { getInboxMenuSelectedItem } from '@/pages/InboxRXJS/PrimaryInboxMenu/utils';
import { useGetConversationsFilter } from '@/pages/InboxRXJS/hooks/useGetConversationsFilter';

const getInboxLabelMapping = (t: TFunction) => ({
  'assigned-to-me': t('menu.my-inbox.assigned-to-me'),
  collaborations: t('menu.my-inbox.collaborator'),
  mentions: t('menu.my-inbox.mentioned'),
  all: t('menu.all'),
});

const getSubtitle = ({
  t,
  selectedId,
  inboxLabels,
}: {
  t: TFunction;
  selectedId: string;
  inboxLabels: ReturnType<typeof getInboxLabelMapping>;
}) => {
  if (selectedId === 'all' || !(selectedId in inboxLabels)) {
    return t('nav.company-inbox', {
      defaultValue: 'Company Inbox',
    });
  }
  return t('nav.inbox', {
    defaultValue: 'Inbox',
  });
};

function InboxMeta() {
  const { t } = useTranslation();
  const inboxLabels = getInboxLabelMapping(t);
  const { data: teams = [] } = useTeamList();
  const globalGetConversationsFilter = useGetConversationsFilter();
  const userProfileId = useMyProfile();
  const selectedId = getInboxMenuSelectedItem(
    globalGetConversationsFilter.getConversationsFilter,
    {
      myUserProfileId: userProfileId.data?.userInfo.id,
    },
  );
  const title = useMemo(() => {
    if (selectedId in inboxLabels) {
      return inboxLabels[selectedId as keyof typeof inboxLabels];
    }
    const team = teams.find((team) => {
      return String(team.id) === selectedId;
    });
    if (team) {
      return team.teamName;
    }
    return selectedId;
  }, [inboxLabels, selectedId, teams]);

  const pageTitle = title
    ? `${title} | ${t('page-title.inbox')} | ${t('page-title.sleekflow')}`
    : null;
  const subtitle = getSubtitle({
    t,
    selectedId,
    inboxLabels,
  });
  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
      </Helmet>
      <PageTitle
        title={title}
        subtitleComponent={
          <Typography
            sx={{
              textTransform: 'uppercase',
            }}
            variant="subtitle"
          >
            {subtitle}
          </Typography>
        }
      />
    </>
  );
}

const InboxHeader = () => {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      sx={{ borderColor: 'gray.30' }}
      borderBottom="1px solid"
      alignItems="center"
      paddingX="20px"
    >
      <InboxMeta />
      <Box
        display="flex"
        alignItems="center"
        justifyContent="flex-end"
        width="100%"
        height="4rem"
      >
        <GlobalTopMenu />
      </Box>
    </Stack>
  );
};

export default InboxHeader;
