import { RoleType } from '@/api/types';
import { useMyProfile, useSuspenseMyProfile } from '@/hooks/useMyProfile';

export const useAISettingsRoleBasedAccessControl = ({
  suspense,
}: { suspense?: boolean } = {}) => {
  const userProfileFn = suspense ? useSuspenseMyProfile : useMyProfile;
  const userProfile = userProfileFn();

  return {
    canViewAISettings: userProfile.data?.roleType === RoleType.ADMIN,
  };
};
