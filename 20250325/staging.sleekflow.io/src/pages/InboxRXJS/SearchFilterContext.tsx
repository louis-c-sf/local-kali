import {
  Badge,
  Box,
  Button,
  Checkbox,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material';
import { useInjection } from 'inversify-react';
import { useObservableState } from 'observable-hooks';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Dropdown from '@/components/DropdownMenu';
import Icon from '@/components/Icon';
import { InputLabel } from '@/components/InputLabel';
import { useMyProfile } from '@/hooks/useMyProfile';
import {
  NestedMenuLayout,
  NestedMenuProvider,
  NestedMenuTab,
  NestedMenuTabPanel,
  NestedMenuTabs,
  NestedMenuTabsList,
} from '@/pages/InboxRXJS/NestedMenu';
import useMyStaff from '@/pages/InboxRXJS/hooks/useMyStaff';
import { useTypedPosthog } from '@/posthog/useTypedPosthog';
import { FeatureService } from '@/services/features/feature.service';
import { testIds } from '@/playwright/lib/test-ids';

import ChannelFilter from './ConversationFilters/ChannelFilter';
import LabelFilter from './ConversationFilters/LabelFilter';
import MemberFilter from './ConversationFilters/MemberFilter';
import { useGetConversationsFilter } from './hooks/useGetConversationsFilter';

const Count = ({ count }: { count: number }) => {
  return (
    <Stack
      component="span"
      sx={{
        padding: '3px 7px',
        backgroundColor: 'blue.90',
        borderRadius: '50%',
        minWidth: '20px',
        minHeight: '20px',
        textAlign: 'center',
      }}
    >
      <Typography variant="menu2" color="white">
        {count > 9 ? '9+' : count}
      </Typography>
    </Stack>
  );
};

interface SearchFilterContextProps {
  disabled?: boolean;
}

const SearchFilterContext: React.FC<SearchFilterContextProps> = ({
  disabled,
}) => {
  const { t } = useTranslation();
  const posthog = useTypedPosthog();
  const { getConversationsFilter } = useGetConversationsFilter();
  const myProfile = useMyProfile();
  const featureService = useInjection(FeatureService);

  const isMemberFilterFeatureAvailable$ = useMemo(() => {
    return featureService.getIsMemberFilterEnabled$();
  }, [featureService]);

  const isMemberFeatureAvailable = useObservableState(
    isMemberFilterFeatureAvailable$,
    false,
  );

  const channelCount = getConversationsFilter?.channelIds?.length ?? 0;
  const labelCount = getConversationsFilter?.labelIds?.length ?? 0;
  const memberCount = useMemo(() => {
    if (
      getConversationsFilter?.assignedStaffId === myProfile.data?.userInfo.id
    ) {
      return 0;
    }
    if (getConversationsFilter?.assignedStaffId) {
      return 1;
    }
    return 0;
  }, [getConversationsFilter?.assignedStaffId, myProfile.data?.userInfo.id]);

  const totalSelected =
    channelCount +
    labelCount +
    memberCount +
    (getConversationsFilter?.isUnread ? 1 : 0);

  // 'members' | 'channels' | 'labels'
  const [seletedFilter, setSeletedFilter] = useState('');
  const conversationFilter = useGetConversationsFilter();
  const selectedMember = getConversationsFilter?.assignedStaffId;
  const myStaff = useMyStaff();
  const onSelectedFilter = (filter: string) => {
    setSeletedFilter(seletedFilter === filter ? '' : filter);
  };

  const isMemberFilterEnabled =
    isMemberFeatureAvailable && myStaff?.id !== selectedMember;

  const contexts = [
    {
      name: 'channels',
      title: t('inbox.conversations-list.filters.channels'),
      onclick: () => onSelectedFilter('channels'),
      badgeContent: channelCount,
    },
    {
      name: 'labels',
      title: t('inbox.conversations-list.filters.labels'),
      onclick: () => onSelectedFilter('labels'),
      badgeContent: labelCount,
    },
  ];

  if (isMemberFilterEnabled) {
    contexts.push({
      name: 'members',
      title: t('inbox.conversations-list.filters.members'),
      onclick: () => onSelectedFilter('members'),
      badgeContent: memberCount,
    });
  }

  return (
    <Dropdown>
      {({ handleOpen, ...menuProps }) => (
        <>
          <IconButton
            data-testid={testIds.inboxFilterConversationTrigger}
            onClick={(e) => {
              posthog.capture('inbox:click_inbox_search_filters', {});
              handleOpen(e);
            }}
            disabled={disabled}
          >
            {/* Selected count */}
            <Badge badgeContent={totalSelected} max={9} color="blue">
              <Icon icon="filter-funnel" size={20} />
            </Badge>
          </IconButton>
          <Menu
            {...menuProps}
            sx={{
              '& > .MuiPaper-root': {
                overflow: 'hidden',
                padding: '6px',
              },
              '& > .MuiPaper-root > .MuiList-root': {
                height: '100%',
              },
            }}
            MenuListProps={{
              sx: {
                padding: 0,
              },
            }}
          >
            <NestedMenuProvider>
              <NestedMenuLayout
                sx={{
                  height: '430px',
                }}
              >
                <NestedMenuTabs>
                  <NestedMenuTabsList
                    sx={{
                      justifyContent: 'space-between',
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        width: '100%',
                      }}
                    >
                      <InputLabel
                        sx={{
                          padding: (theme) => theme.spacing(1, 1.5, 0.5, 1.5),
                        }}
                      >
                        {t('inbox.conversations-list.filters.filters')}
                      </InputLabel>
                      {contexts.map((item, pos) => (
                        <NestedMenuTab key={pos} value={pos}>
                          <MenuItem
                            data-testid={`inbox-filter-${item.name}`}
                            selected={seletedFilter === item.title}
                            onClick={() => item.onclick()}
                          >
                            <ListItemText
                              sx={{
                                '> span': {
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  // prevent MUI's Typography from overriding our active color
                                  color: 'inherit',
                                },
                              }}
                            >
                              {item.title}
                              {Boolean(item.badgeContent) && (
                                <Count count={item.badgeContent} />
                              )}
                            </ListItemText>

                            <ListItemIcon
                              sx={{
                                // prevent MUI's Typography from overriding our active color
                                color: 'inherit',
                                justifyContent: 'flex-end',
                              }}
                            >
                              <Icon icon="chevron-right" />
                            </ListItemIcon>
                          </MenuItem>
                        </NestedMenuTab>
                      ))}
                      <MenuItem
                        onClick={() => {
                          posthog.capture(
                            'inbox:select_inbox_search_filters_by_unread',
                            {},
                          );
                          conversationFilter.setGetConversationsFilter({
                            isUnread:
                              !conversationFilter.getConversationsFilter
                                ?.isUnread,
                          });
                        }}
                      >
                        <ListItemText>
                          {t('inbox.conversations-list.filters.unread')}
                        </ListItemText>
                        <Checkbox
                          checked={
                            conversationFilter.getConversationsFilter
                              ?.isUnread ?? false
                          }
                        />
                      </MenuItem>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Button
                        variant="text"
                        fullWidth={true}
                        onClick={
                          conversationFilter.deleteGetConversationsFilter
                        }
                        disabled={totalSelected === 0}
                      >
                        {t('inbox.conversations-list.filters.reset')}
                      </Button>
                    </Box>
                  </NestedMenuTabsList>
                  <NestedMenuTabPanel value={0}>
                    <ChannelFilter />
                  </NestedMenuTabPanel>
                  <NestedMenuTabPanel
                    value={1}
                    data-testid={testIds.inboxFilterLabelsPanel}
                  >
                    <LabelFilter />
                  </NestedMenuTabPanel>
                  <NestedMenuTabPanel value={2}>
                    <MemberFilter />
                  </NestedMenuTabPanel>
                </NestedMenuTabs>
              </NestedMenuLayout>
            </NestedMenuProvider>
          </Menu>
        </>
      )}
    </Dropdown>
  );
};

export default SearchFilterContext;
