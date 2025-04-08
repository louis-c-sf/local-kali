import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import type { AxiosRequestConfig } from 'axios';

import { axiosClient } from '@/api/axiosClient';

import { workflowKeys } from '../queryKeys';
import type { FlowHubConfigResponse } from '../types';

const URL = '/FlowHub/FlowHubConfigs/GetFlowHubConfig';

export async function getFlowHubConfig(config: AxiosRequestConfig = {}) {
  const response = await axiosClient.post<FlowHubConfigResponse>(
    URL,
    {},
    config,
  );
  return response.data;
}

function useFlowHubQueryOptions<T>({
  select,
  enabled,
}: {
  select?: (data: FlowHubConfigResponse) => T;
  enabled?: boolean;
} = {}) {
  return {
    queryKey: workflowKeys.getFlowHub,
    queryFn: ({ signal }: { signal: AbortSignal }) =>
      getFlowHubConfig({ signal }),
    select,
    meta: {
      url: URL,
      description: 'Get flowhub config',
    },
    enabled,
    staleTime: 120000,
  };
}

export function useFlowHubQuery<T = FlowHubConfigResponse>({
  select,
  enabled,
}: {
  select?: (data: FlowHubConfigResponse) => T;
  enabled?: boolean;
} = {}) {
  return useQuery(useFlowHubQueryOptions<T>({ select, enabled }));
}

export function useSuspenseFlowHubQuery<T = FlowHubConfigResponse>({
  select,
}: {
  select?: (data: FlowHubConfigResponse) => T;
} = {}) {
  return useSuspenseQuery(useFlowHubQueryOptions<T>({ select }));
}
