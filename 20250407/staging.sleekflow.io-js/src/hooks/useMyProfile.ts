import { useGetStaffById, useSuspenseGetStaffById } from '@/api/company';
import { UserWorkspace, useUserWorkspaces } from '@/api/tenantHub';
import { getUserId } from '@/utils/user';

import { useAuth } from './useAuth';

export const CONNECTION_STRATEGY = {
  auth0: 'auth0',
  'google-oauth2': 'google-oauth2',
  apple: 'apple',
  adfs: 'adfs',
  openid: 'openid',
};

export type ConnectionStrategy = keyof typeof CONNECTION_STRATEGY;

export type MyProfile = ReturnType<typeof useMyProfile>;

const EMPTY: UserWorkspace[] = [];

function useProfileParams() {
  const { user } = useAuth();
  const { data = EMPTY } = useUserWorkspaces();

  return {
    user,
    userId: getUserId({ user }),
    userWorkspaces: data,
  };
}

export function useMyProfile() {
  const { user, userId, userWorkspaces } = useProfileParams();

  const staffInfo = useGetStaffById({
    userId,
    select: (data) => {
      if (data.length > 0) {
        const staff = data[0];

        // BE should not return integer type but they did
        const associatedTeams = staff.associatedTeams?.map((team) => ({
          ...team,
          id: team.id,
        }));

        const { name: _, ...staffWithoutName } = staff;
        const result = {
          ...staffWithoutName,
          auth0User: user,
          connectionStrategy: user?.[
            'https://app.sleekflow.io/connection_strategy'
          ] as ConnectionStrategy | undefined,
          userWorkspaces: userWorkspaces,
          associatedTeams,
        };

        return result;
      }
      throw new Error('Cannot get staff info');
    },
    staleTime: Infinity,
  });

  return staffInfo;
}

export function useSuspenseMyProfile() {
  const { user, userId, userWorkspaces } = useProfileParams();

  const staffInfo = useSuspenseGetStaffById({
    userId,
    select: (data) => {
      if (data.length > 0) {
        const staff = data[0];

        // BE should not return integer type but they did
        const associatedTeams = staff.associatedTeams?.map((team) => ({
          ...team,
          id: team.id,
        }));

        const { name: _, ...staffWithoutName } = staff;
        const result = {
          ...staffWithoutName,
          auth0User: user,
          connectionStrategy: user?.[
            'https://app.sleekflow.io/connection_strategy'
          ] as ConnectionStrategy | undefined,
          userWorkspaces: userWorkspaces,
          associatedTeams,
        };

        return result;
      }
      throw new Error('Cannot get staff info');
    },
    staleTime: Infinity,
  });

  return staffInfo;
}
