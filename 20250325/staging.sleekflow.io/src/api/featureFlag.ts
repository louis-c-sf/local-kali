import { createQueryKeys } from '@lukemorales/query-key-factory';
import {
  queryOptions,
  useQuery,
  UseQueryOptions,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { useMemo } from 'react';
import { axiosClient } from './axiosClient';
import { useCompany, useSuspenseCompany } from './company';
import { Company } from './types';

export type FeatureFlagName =
  (typeof FEATURE_FLAG_NAMES)[keyof typeof FEATURE_FLAG_NAMES];

interface FeatureFlag {
  categories: string[] | null;
  created_at: string;
  created_by: string;
  description: string;
  id: string;
  is_enabled: boolean;
  name: FeatureFlagName;
  updated_at: string;
  updated_by: string;
}

export const featureFlagKeys = createQueryKeys('featureFlag', {
  getCompanyFeatureFlags: (companyId: string) => ({
    companyId,
  }),
});

export const FEATURE_FLAG_NAMES = {
  TICKETING: 'enable_ticketing',
  ANALYTICS_CONVERSATION: 'enable_analytics',
  ANALYTICS_CONVERSATION_PARTIAL: 'enable_analytics_partial',
  ANALYTICS_TOPIC: 'enable_topic_analytics',
  ANALYTICS_EVENTS_FULL: 'enable_analytics_events_full',
  ANALYTICS_EVENTS_LIMITED: 'enable_analytics_events_limited',
  WHATSAPP_FLOW: 'enable_whatsapp_flow',
  FLOW_BUILDER_PLUS: 'enable_advanced_flow_builder',
  GOOGLE_SHEETS_INTEGRATION: 'enable_google_sheets_integration',
  HUBSPOT_INTEGRATION: 'enable_hubspot_integration',
  ZOHO_INTEGRATION: 'enable_zoho_integration',
  LOW_BANDWIDTH_MODE: 'enable_low_bandwidth_mode',
} as const;

type UseCompanyEnabledFeatureFlagOptions = Omit<
  UseQueryOptions<Record<FeatureFlag['name'], FeatureFlag>>,
  'queryKey' | 'queryFn'
>;
interface useCompanyEnabledFeatureFlagOptionsParams {
  company: Company | undefined;
  options?: UseCompanyEnabledFeatureFlagOptions;
}
const useCompanyEnabledFeatureFlagOptions = ({
  company,
  options,
}: useCompanyEnabledFeatureFlagOptionsParams) =>
  queryOptions({
    queryKey: featureFlagKeys.getCompanyFeatureFlags(company?.id || ''),
    queryFn: async () => {
      const response = await axiosClient.post<{
        data: { enabled_features: FeatureFlag[] };
      }>(
        `/v1/tenant-hub/authorized/EnabledFeatures/GetEnabledFeaturesForCompany`,
        {
          sleekflow_company_id: company?.id,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          baseURL: import.meta.env.VITE_SLEEKFLOW_API_BASE_URL,
        },
      );
      return Object.fromEntries(
        response.data.data.enabled_features.map((feature) => [
          feature.name,
          feature,
        ]),
      ) as Record<FeatureFlag['name'], FeatureFlag>;
    },
    enabled: !!company?.id,
    staleTime: Infinity,
    throwOnError: false,
    ...options,
  });

const useCompanyEnabledFeatureFlag = (
  options: UseCompanyEnabledFeatureFlagOptions = {},
) => {
  const { data: company } = useCompany();

  return useQuery(
    useCompanyEnabledFeatureFlagOptions({
      company,
      options,
    }),
  );
};

const useSuspenseCompanyEnabledFeatureFlag = (
  options: UseCompanyEnabledFeatureFlagOptions = {},
) => {
  const { data: company } = useSuspenseCompany();

  return useSuspenseQuery(
    useCompanyEnabledFeatureFlagOptions({
      company,
      options,
    }),
  );
};

export const useIsCompanyFeatureFlagEnabled = (flagName: FeatureFlagName) => {
  const { data: featureFlags, isLoading: isLoadingCompanyFeatureFlags } =
    useCompanyEnabledFeatureFlag();

  const isEnabled = Boolean(featureFlags?.[flagName]?.is_enabled);

  return {
    data: isEnabled,
    isLoading: isLoadingCompanyFeatureFlags,
  };
};

export const useSuspenseIsCompanyFeatureFlagEnabled = (
  flagName: FeatureFlagName,
) => {
  const { data: featureFlags, isLoading: isLoadingCompanyFeatureFlags } =
    useSuspenseCompanyEnabledFeatureFlag();

  const isEnabled = Boolean(featureFlags?.[flagName]?.is_enabled);

  return {
    data: isEnabled,
    isLoading: isLoadingCompanyFeatureFlags,
  };
};

type UseFeatureFlagEnabledMapReturn = Record<FeatureFlagName, boolean>;
export const useFeatureFlagEnabledMap = () => {
  const { data: featureFlags } = useCompanyEnabledFeatureFlag();

  return useMemo(() => {
    if (!featureFlags) {
      return Object.fromEntries(
        Object.values(FEATURE_FLAG_NAMES).map((flagName) => [flagName, false]),
      ) as UseFeatureFlagEnabledMapReturn;
    }

    return Object.fromEntries(
      Object.entries(featureFlags).map(([featureFlagName, featureFlag]) => [
        featureFlagName,
        Boolean(featureFlag.is_enabled),
      ]),
    ) as UseFeatureFlagEnabledMapReturn;
  }, [featureFlags]);
};
