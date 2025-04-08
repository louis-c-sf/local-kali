import { RoleType } from '@/api/types';
import { useMyProfile, useSuspenseMyProfile } from '@/hooks/useMyProfile';

export const useFlowBuilderRoleBasedAccessControl = ({
  suspense,
}: { suspense?: boolean } = {}) => {
  const userProfileFn = suspense ? useSuspenseMyProfile : useMyProfile;
  const userProfile = userProfileFn();

  return {
    // Flow Builder
    canUseFlow: userProfile.data?.roleType === RoleType.ADMIN,
  };
};
