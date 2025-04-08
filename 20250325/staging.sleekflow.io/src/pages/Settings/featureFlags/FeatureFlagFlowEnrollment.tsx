import { useGetIsFeatureFlagsEnabledQuery } from '@/api/common';

export function useGetFeatureFlagFlowEnrollment() {
  const { data: isFeatureFlagsEnabled } = useGetIsFeatureFlagsEnabledQuery();
  return isFeatureFlagsEnabled?.isFlowBuilderMonetisationEnabled ?? false;
}
