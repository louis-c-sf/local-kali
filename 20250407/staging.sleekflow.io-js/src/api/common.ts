import { createQueryKeys } from '@lukemorales/query-key-factory';
import { useQuery } from '@tanstack/react-query';

import { useAxios } from '@/api/axiosClient';
import { Country, GetCurrentCountryResponse } from '@/api/types';

export const commonKeys = createQueryKeys('common', {
  getCountryList: null,
  getCurrentIp: null,
  getCurrentCountry: null,
  getIsFeatureFlagsEnabled: null,
});

interface IpResponseType {
  ipAddress: string;
}

export const useGetCountryListQuery = <T = Country[]>({
  select,
}: {
  select?: (data: Country[]) => T;
} = {}) => {
  const url = '/country';
  const axiosClient = useAxios();

  return useQuery({
    queryKey: commonKeys.getCountryList,
    queryFn: async ({ signal }) => {
      const result = await axiosClient.get(url, { signal });
      return result.data;
    },
    select,
  });
};

export const useGetCurrentIpQuery = () => {
  const url = '/ipaddress';
  const axiosClient = useAxios();

  return useQuery({
    queryKey: commonKeys.getCurrentIp,

    queryFn: async () => {
      const response = await axiosClient.get<IpResponseType>(url, {
        skipAuth: true,
      });
      if (response.data) {
        return response.data;
      }
      throw new Error('useGetCurrentIpQuery error');
    },
  });
};

export const useGetCurrentCountryQuery = () => {
  const axiosClient = useAxios();
  const url = `/location-info-v2`;

  return useQuery({
    queryKey: commonKeys.getCurrentCountry,
    staleTime: Infinity,
    queryFn: async () => {
      try {
        const response = await axiosClient.get<GetCurrentCountryResponse>(url);
        if (response.data) {
          return response.data;
        }
        throw new Error('useGetCurrentCountryQuery error');
      } catch (e) {
        console.error(`useGetCurrentCountryQuery error: ${e}`);
      }
    },
    throwOnError: false,
  });
};

interface FeatureFlagsResponse {
  isFlowBuilderMonetisationEnabled: boolean;
  isPlanMigrationIncentiveCampaignPeriod: boolean;
  isInFlowEnrollmentIncentivePeriod: boolean;
  isInLegacyPremiumOptInUpgradeIncentivePeriod: boolean;
}

export const useGetIsFeatureFlagsEnabledQuery = <T = FeatureFlagsResponse>({
  select,
  enabled,
}: {
  select?: (data: FeatureFlagsResponse) => T;
  enabled?: boolean;
} = {}) => {
  const axiosClient = useAxios();

  return useQuery({
    queryKey: commonKeys.getIsFeatureFlagsEnabled,
    queryFn: async () => {
      const url = '/app/feature-info';
      const response = await axiosClient.get<FeatureFlagsResponse>(url);
      return response.data;
    },
    select,
    enabled,
  });
};
