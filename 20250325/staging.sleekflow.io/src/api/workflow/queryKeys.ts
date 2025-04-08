import { createQueryKeys } from '@lukemorales/query-key-factory';

import type {
  GetActionNeedsParams,
  GetActiveWorkflowParams,
  GetLatestWorkflowParams,
  GetTriggerEventSamplesParams,
  GetTriggerNeedsParams,
  GetWaitForEventConditionFieldMetadataParams,
  GetWorkflowCountsParams,
  GetWorkflowExecutionUsagesParams,
  GetWorkflowsParams,
} from './types';

export const workflowKeys = createQueryKeys('workflow', {
  getFlowHub: null,
  getActiveWorkflow: ({ workflowId }: GetActiveWorkflowParams) => [
    { workflowId },
  ],
  getLatestWorkflow: ({ workflowId }: GetLatestWorkflowParams) => [
    { workflowId },
  ],
  getManualEnrollmentStatus: ({ workflowId }: GetLatestWorkflowParams) => [
    { workflowId },
  ],
  getWorkflowExecutionUsage: (params: GetWorkflowExecutionUsagesParams) => [
    {
      ...params,
    },
  ],
  getWorkflows: (params: GetWorkflowsParams) => [{ ...params }],
  getWorkflowCounts: (params: GetWorkflowCountsParams) => [{ ...params }],
  getUniqueWorkflowExecutionCount: ({
    from,
    to,
  }: GetWorkflowExecutionUsagesParams) => ({
    from,
    to,
  }),
  getWorkflowWebhookTriggers: (params: { workflowId: string }) => [
    { ...params },
  ],
  getTriggerEventSamples: ({
    triggerId,
    ...params
  }: GetTriggerEventSamplesParams) => [triggerId, { ...params }],
  getWaitForEventConditionFieldMetadata: (
    params: GetWaitForEventConditionFieldMetadataParams,
  ) => [{ ...params }],
  getTriggerNeeds: ({ triggerId, ...params }: GetTriggerNeedsParams) =>
    [triggerId, { ...params }] as const,
  getTriggers: null,
  getActions: null,
  getActionNeeds: ({
    stepId,
    actionGroup,
    actionSubgroup,
    ...params
  }: GetActionNeedsParams) => [
    stepId,
    { actionGroup, actionSubgroup },
    { ...params },
  ],
});
