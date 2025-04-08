import { Badge, badgeClasses, Box } from '@mui/material';
import { useInjection } from 'inversify-react';
import { useObservableState } from 'observable-hooks';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import SecondaryNavItem from '@/components/SecondaryNav/SecondaryNavItem';
import SecondaryNavSection from '@/components/SecondaryNav/SecondaryNavSection';
import { useMyProfile } from '@/hooks/useMyProfile';
import { useGetConversationsFilter } from '@/pages/InboxRXJS/hooks/useGetConversationsFilter';
import { ConversationUnreadSummaryDataSourceManager } from '@/services/conversations/conversation-unread-summary-data-source-manager';

import { getInboxMenuSelectedItem } from './utils';

export const MyInboxMenuSection = React.memo(function MyInboxMenuSection() {
  const { t } = useTranslation();
  const globalGetConversationsFilter = useGetConversationsFilter();
  const profile = useMyProfile();
  const conversationUnreadSummaryDataSourceManager = useInjection(
    ConversationUnreadSummaryDataSourceManager,
  );
  const conversationUnreadSummary$ = useMemo(() => {
    return conversationUnreadSummaryDataSourceManager
      .getOrInitDataSource({})
      .setupAndGet$();
  }, [conversationUnreadSummaryDataSourceManager]);
  const conversationUnreadSummary = useObservableState(
    conversationUnreadSummary$,
    {
      assignedToMe: 0,
      collaborations: 0,
      mentions: 0,
    },
  );
  const myUserId = profile.data?.userInfo.id;

  const menuItems = useMemo(() => {
    if (!myUserId) {
      return [];
    }

    return [
      {
        id: 'assigned-to-me',
        label: t('menu.my-inbox.assigned-to-me'),
        onClick: () => {
          if (!profile?.data?.staffId) {
            return;
          }

          globalGetConversationsFilter.setGetConversationsFilter(
            {
              assignedStaffId: String(myUserId),
              isStaffAssigned: undefined,
              assignedTeamId: undefined,
              isTeamUnassigned: undefined,
              status: 'open',
              channelIds: undefined,
              labelIds: undefined,
              isUnread: undefined,
              isCollaborated: undefined,
              isMentioned: undefined,
            },
            {
              discardPreviousValues: true,
            },
          );
        },
        endIcon: (
          <Badge
            key="badge-assignedToMe"
            color="red"
            badgeContent={conversationUnreadSummary.assignedToMe}
            sx={{
              height: '20px',
              [`& :not(.${badgeClasses.invisible}).${badgeClasses.badge}`]: {
                position: 'relative',
                transform: 'none',
              },
            }}
          />
        ),
      },
      {
        id: 'collaborations',
        label: t('menu.my-inbox.collaborator'),
        onClick: () => {
          globalGetConversationsFilter.setGetConversationsFilter(
            {
              assignedStaffId: undefined,
              isStaffAssigned: true,
              assignedTeamId: undefined,
              isTeamUnassigned: undefined,
              status: 'open',
              channelIds: undefined,
              labelIds: undefined,
              isUnread: undefined,

              isCollaborated: true,
              isMentioned: undefined,
            },
            {
              discardPreviousValues: true,
            },
          );
        },
        endIcon: (
          <Badge
            key="badge-collaborations"
            color="red"
            badgeContent={conversationUnreadSummary.collaborations}
            sx={{
              height: '20px',
              [`& :not(.${badgeClasses.invisible}).${badgeClasses.badge}`]: {
                position: 'relative',
                transform: 'none',
              },
            }}
          />
        ),
      },
      {
        id: 'mentions',
        label: t('menu.my-inbox.mentioned'),
        onClick: () => {
          globalGetConversationsFilter.setGetConversationsFilter(
            {
              assignedStaffId: undefined,
              isStaffAssigned: true,
              assignedTeamId: undefined,
              isTeamUnassigned: undefined,
              status: 'open',
              channelIds: undefined,
              labelIds: undefined,
              isUnread: undefined,
              isCollaborated: undefined,
              isMentioned: true,
            },
            {
              discardPreviousValues: true,
            },
          );
        },
        endIcon: (
          <Badge
            key="badge-mentions"
            color="red"
            badgeContent={conversationUnreadSummary.mentions}
            sx={{
              height: '20px',
              [`& :not(.${badgeClasses.invisible}).${badgeClasses.badge}`]: {
                position: 'relative',
                transform: 'none',
              },
            }}
          />
        ),
      },
    ];
  }, [
    myUserId,
    t,
    conversationUnreadSummary.assignedToMe,
    conversationUnreadSummary.collaborations,
    conversationUnreadSummary.mentions,
    profile.data,
    globalGetConversationsFilter,
  ]);

  return (
    <SecondaryNavSection title={t('menu.my-inbox.title')}>
      {menuItems.map((menuItem) => {
        return (
          <Box key={menuItem.id}>
            <SecondaryNavItem
              data-id={menuItem.id}
              selected={
                getInboxMenuSelectedItem(
                  globalGetConversationsFilter.getConversationsFilter,
                  {
                    myUserProfileId: profile.data?.userInfo.id,
                  },
                ) === menuItem.id
              }
              endIcon={menuItem.endIcon}
              onClick={menuItem.onClick}
              label={menuItem.label}
            />
          </Box>
        );
      })}
    </SecondaryNavSection>
  );
});
