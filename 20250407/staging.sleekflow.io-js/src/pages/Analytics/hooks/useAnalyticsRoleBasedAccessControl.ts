import { RoleType } from '@/api/types';
import { useMyProfile, useSuspenseMyProfile } from '@/hooks/useMyProfile';

export const useAnalyticsRoleBasedAccessControl = ({
  suspense,
}: { suspense?: boolean } = {}) => {
  const userProfileFn = suspense ? useSuspenseMyProfile : useMyProfile;
  const userProfile = userProfileFn();

  return {
    // Analytics
    canViewAnalytics: userProfile.data?.roleType === RoleType.ADMIN,
  };
};
