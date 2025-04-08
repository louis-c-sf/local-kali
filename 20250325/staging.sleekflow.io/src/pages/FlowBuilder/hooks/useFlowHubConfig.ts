import {
  useFlowHubQuery,
  useSuspenseFlowHubQuery,
} from '@/api/workflow/queries/getFlowHub';

export default function useFlowHubConfig(options?: {
  suspense?: boolean;
  enabled?: boolean;
}) {
  const useFlowHubQueryFn = options?.suspense
    ? useSuspenseFlowHubQuery
    : useFlowHubQuery;

  return useFlowHubQueryFn({
    ...options,
    select: ({ data }) => ({
      isEnrolled: data.flow_hub_config.is_enrolled,
      maximumNumberOfNodePerFlow:
        (data.flow_hub_config.usage_limit?.maximum_num_of_nodes_per_workflow ??
          Infinity) +
        (data.flow_hub_config.usage_limit_offset
          ?.maximum_num_of_nodes_per_workflow_offset ?? 0),
      maximumActiveFlows:
        (data.flow_hub_config.usage_limit?.maximum_num_of_active_workflows ??
          Infinity) +
        (data.flow_hub_config.usage_limit_offset
          ?.maximum_num_of_active_workflows_offset ?? 0),
      maximumNumberOfRunPerMonth:
        (data.flow_hub_config.usage_limit
          ?.maximum_num_of_monthly_workflow_executions ?? Infinity) +
        (data?.flow_hub_config.usage_limit_offset
          ?.maximum_num_of_monthly_workflow_executions_offset ?? 0),
    }),
  });
}
