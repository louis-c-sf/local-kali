import { RoleType } from '@/api/types';
import { useMyProfile, useSuspenseMyProfile } from '@/hooks/useMyProfile';

export const useBroadcastRoleBasedAccessControl = () => {
  const userProfile = useMyProfile();

  return useBroadcastRoleBasedAccessControlResult(userProfile);
};

export const useSuspenseBroadcastRoleBasedAccessControl = () => {
  const userProfile = useSuspenseMyProfile();

  return useBroadcastRoleBasedAccessControlResult(userProfile);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function useBroadcastRoleBasedAccessControlResult(userProfile: any) {
  return {
    // Broadcasts
    canCreateBroadcast: userProfile.data?.roleType !== RoleType.STAFF,
    canViewBroadcasts: userProfile.data?.roleType !== RoleType.STAFF,
    canViewBroadcastReview: userProfile.data?.roleType !== RoleType.STAFF,
  };
}
