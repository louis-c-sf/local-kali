import { Box } from '@mui/material';
import { useInjection } from 'inversify-react';
import { useObservableState } from 'observable-hooks';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { map } from 'rxjs';

import { Team } from '@/api/types';
import SecondaryNavItem from '@/components/SecondaryNav/SecondaryNavItem';
import SecondaryNavSection from '@/components/SecondaryNav/SecondaryNavSection';
import { useMyProfile } from '@/hooks/useMyProfile';
import { useGetConversationsFilter } from '@/pages/InboxRXJS/hooks/useGetConversationsFilter';
import { FeatureService } from '@/services/features/feature.service';
import { testIds } from '@/playwright/lib/test-ids';

import { getInboxMenuSelectedItem } from './utils';

// eslint-disable-next-line react/display-name
export const CompanyInboxSection = React.memo(
  () => {
    const { t } = useTranslation();
    const featureService = useInjection<FeatureService>(FeatureService);

    const globalGetConversationsFilter = useGetConversationsFilter();
    const myUserProfile = useMyProfile();

    const teams$ = useMemo(() => {
      return featureService.getAvailableConversationTeams$().pipe(
        map((teams) =>
          teams.map(
            (team) =>
              ({
                id: team.id,
                teamName: team.name,
              }) as Team,
          ),
        ),
      );
    }, [featureService]);

    const teams = useObservableState(teams$, undefined);

    const menuItems = useMemo(() => {
      if (!teams) {
        return [];
      }

      return [
        {
          id: 'all',
          label: t('menu.all'),
          onClick: () => {
            globalGetConversationsFilter.setGetConversationsFilter(
              {
                assignedStaffId: undefined,
                assignedTeamId: undefined,
                isCollaborated: undefined,
                isMentioned: undefined,
                status: 'open',
                isStaffAssigned: true,
              },
              {
                discardPreviousValues: true,
              },
            );
          },
        },
      ].concat(
        teams.map((team) => ({
          id: String(team.id), //TODO: BE should not return integer type but they did
          label: team.teamName,
          onClick: () => {
            globalGetConversationsFilter.setGetConversationsFilter(
              {
                status: 'open',
                assignedStaffId: undefined,
                assignedTeamId: Number(team.id),
                isCollaborated: undefined,
                isMentioned: undefined,
                isStaffAssigned: true,
              },
              {
                discardPreviousValues: true,
              },
            );
          },
        })),
      );
    }, [globalGetConversationsFilter, t, teams]);

    if (menuItems.length === 0) {
      return null;
    }

    return (
      <SecondaryNavSection title={t('menu.company-inbox.title')}>
        {menuItems.map((menuItem) => {
          return (
            <Box key={menuItem.id}>
              <SecondaryNavItem
                selected={
                  getInboxMenuSelectedItem(
                    globalGetConversationsFilter.getConversationsFilter,
                    {
                      myUserProfileId: myUserProfile.data?.userInfo.id,
                    },
                  ) === menuItem.id
                }
                data-testid={testIds.inboxCompanyInboxMenuItem}
                data-id={menuItem.id}
                onClick={menuItem.onClick}
                label={menuItem.label}
              />
            </Box>
          );
        })}
      </SecondaryNavSection>
    );
  },
  () => true,
);
