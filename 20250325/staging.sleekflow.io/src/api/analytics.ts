import dayjs, { Dayjs } from 'dayjs';
import { createQueryKeys } from '@lukemorales/query-key-factory';
import {
  TravisBackendCompanyDomainModelsCondition,
  TravisBackendEnumsSupportedNextOperator,
} from '@sleekflow/sleekflow-core-typescript-rxjs-apis';
import {
  AnalyticsBroadcastMtricsResponseType,
  AnalyticsCommonMtrics,
  AnalyticsCommonMtricsResponseType,
} from './types';
import { useAxios } from './axiosClient';
import {
  MutationOptions,
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';
import { Condition, Segment } from '@/services/analytics/types';
import {
  FEATURE_FLAG_NAMES,
  useSuspenseIsCompanyFeatureFlagEnabled,
} from './featureFlag';
import useSnackbar from '@/hooks/useSnackbar';
import { useTranslation } from 'react-i18next';
import { useCallback, useMemo } from 'react';
import { getPreviousPeriod } from '@/pages/Analytics/share/getPreviousPeriod';
import { RULE_OPTIONS } from '@/utils/rules';
import { queryClient } from '@/utils/queryClient';

import { useGetStaffOverview } from './company';
import { StaffCore } from '@/services/companies/types';

export interface FilterValue {
  value: string;
  displayName: string;
}

export type FilterOperator =
  | (typeof RULE_OPTIONS)[keyof typeof RULE_OPTIONS]['value']
  | '';

export interface FilterCondition {
  fieldName: string;
  operator: FilterOperator;
  values: FilterValue[];
}

export type FilterLogicalOperator = 'And' | 'Or';

export interface AnalyticsSegment extends AnalyticsFilter {
  segmentName: string;
}

export const MAX_ANALYTICS_FILTERS_LENGTH = 10;
export interface AnalyticsFilter {
  logicalOperator: FilterLogicalOperator;
  filters: FilterCondition[];
}

export interface AnalyticsAdvancedFilter {
  logicalOperator: string;
  filters: AdvancedFilter[];
}

export interface AdvancedFilter {
  fieldName: string;
  operator: FilterLogicalOperator;
  values: string[];
}

export type AnalyticsGroupBy = 'day' | 'week' | 'month';
export type AnalyticsUsingBusinessHour = boolean;

export interface GetCommonMetricsParams {
  from: string;
  to: string;
  conditions?: TravisBackendCompanyDomainModelsCondition[];
  filter?: AnalyticsFilter;
  groupBy: AnalyticsGroupBy;
  usingBusinessHour: AnalyticsUsingBusinessHour;
}

export interface GetBroadcastMetricsParams {
  from: string;
  to: string;
  conditions?: TravisBackendCompanyDomainModelsCondition[];
}

export const FILTER_OPERATOR_TO_NEXT_OPERATOR_MAP: Record<
  FilterLogicalOperator,
  TravisBackendEnumsSupportedNextOperator
> = {
  And: TravisBackendEnumsSupportedNextOperator.NUMBER_0,
  Or: TravisBackendEnumsSupportedNextOperator.NUMBER_1,
};

export const MAX_SEGMENT_NAME_LENGTH = 255;

export const analyticsKeys = createQueryKeys('analytics', {
  getCommonMetrics: (params: GetCommonMetricsParams) => ({
    metric: 'common',
    ...params,
  }),
  getBroadcastMetrics: (params: GetBroadcastMetricsParams) => ({
    metric: 'broadcastMetrics',
    ...params,
  }),
  getSegments: () => ['segment'],
  getTopics: () => ['topics'],
  getTopicMetric: (startDate: string, endDate: string) => ({
    metric: 'topicMetric',
    startDate,
    endDate,
  }),
});

export function useAnalyticsCommonMetricsOptions(
  params: GetCommonMetricsParams,
  enabled: boolean = true,
) {
  const url = '/Company/Analytics/Conversation/Common';
  const axios = useAxios();
  const snackbar = useSnackbar();
  const { t } = useTranslation();
  return queryOptions({
    queryKey: analyticsKeys.getCommonMetrics(params),
    queryFn: async () => {
      const { groupBy: _, ...apiParams } = params;
      const response = await axios.post<AnalyticsCommonMtricsResponseType>(
        url,
        apiParams,
      );
      return _transformConversationData(response.data, params);
    },
    staleTime: 20 * 60 * 1000, // 20 mins
    enabled,
    throwOnError: (error) => {
      console.error('useAnalyticsCommonMetricsOptions', error);
      snackbar.error(
        t('general.something-went-wrong.title', 'Something went wrong'),
        { id: 'useAnalyticsCommonMetricsOptions' },
      );
      return false;
    },
  });
}

const DATE_FORMAT = 'YYYY-MM-DD';

const GROUP_BY_TRANSFORM_MAP: Record<
  AnalyticsGroupBy,
  {
    startOf: dayjs.OpUnitType;
  }
> = {
  day: {
    startOf: 'day',
  },
  week: {
    startOf: 'week',
  },
  month: {
    startOf: 'month',
  },
};

function _transformConversationData(
  data: AnalyticsCommonMtricsResponseType,
  params: GetCommonMetricsParams,
) {
  const { groupBy } = params;

  if (groupBy === 'day') {
    return data;
  }

  // For the case where the first few days, which their grouped starting week/month, are before the first date of the date range
  // If so, they should be grouped as the first date of the date range
  // e.g. Date Range: 2024-01-14(Tue) - xxxx-xx-xx, Group By: Weekly
  // 2024-01-14 - 2024-01-19(Sun) should be grouped as 2024-01-14(Tue) instead of 2024-01-13(Mon)
  let noOfDateGroupAsFirstDate = 0;
  for (let i = 0; i < data.dailyLogs.length; i++) {
    if (
      dayjs(data.dailyLogs[i].date)
        .startOf(GROUP_BY_TRANSFORM_MAP[groupBy].startOf)
        .isSameOrAfter(dayjs(data.dailyLogs[0].date))
    ) {
      noOfDateGroupAsFirstDate = i + 1;
      break;
    }

    if (i === data.dailyLogs.length - 1) {
      // if it reaches the last date and no date has start week after the first date of the date range.
      // all dates should be grouped as the first date of the date range
      noOfDateGroupAsFirstDate = data.dailyLogs.length;
    }
  }

  const dateDataMap = new Map<string, AnalyticsCommonMtrics>();

  data.dailyLogs.forEach((log, index) => {
    const groupedDate =
      index < noOfDateGroupAsFirstDate
        ? dayjs(data.dailyLogs[0].date).format(DATE_FORMAT)
        : dayjs(log.date)
            .startOf(GROUP_BY_TRANSFORM_MAP[groupBy].startOf)
            .format(DATE_FORMAT);

    if (dateDataMap.has(groupedDate)) {
      const existingLog = dateDataMap.get(groupedDate)!;
      dateDataMap.set(
        groupedDate,
        Object.fromEntries(
          Object.entries(log).map(([metricName, value]) => {
            // guard string value
            if (typeof value === 'string') {
              return [metricName, value];
            }

            return [
              metricName,
              value +
                Number(
                  existingLog?.[metricName as keyof AnalyticsCommonMtrics] || 0,
                ),
            ];
          }),
        ) as AnalyticsCommonMtrics,
      );
      return;
    }

    dateDataMap.set(groupedDate, log);
  });

  return {
    ...data,
    dailyLogs: Array.from(
      dateDataMap.entries().map(([date, log]) => ({
        ...log,
        date,
      })),
    ),
  };
}

export function useAnalyticsBroadcastMetricsOptions(
  params: GetBroadcastMetricsParams,
  enabled: boolean = true,
) {
  const url = '/Company/Analytics/Conversation/Broadcast';
  const axios = useAxios();
  return queryOptions({
    queryKey: analyticsKeys.getBroadcastMetrics(params),
    queryFn: async () => {
      const response = await axios.post<AnalyticsBroadcastMtricsResponseType>(
        url,
        params,
      );
      return response.data;
    },
    staleTime: 20 * 60 * 1000, // 20 mins
    enabled,
  });
}

export enum AnalyticsConversationAccessType {
  NO_ACCESS,
  PARTIAL_ACCESS,
  FULL_ACCESS,
}

interface UseAnalyticsConversationAccessTypeReturn {
  data: AnalyticsConversationAccessType;
  isLoading: boolean;
}

export function useAnalyticsConversationAccessType(): UseAnalyticsConversationAccessTypeReturn {
  const { isLoading: isLoadingFullAccess, data: enabledAnalyticsConversation } =
    useSuspenseIsCompanyFeatureFlagEnabled(
      FEATURE_FLAG_NAMES.ANALYTICS_CONVERSATION,
    );
  const {
    isLoading: isLoadingPartial,
    data: enabledAnalyticsConversationPartial,
  } = useSuspenseIsCompanyFeatureFlagEnabled(
    FEATURE_FLAG_NAMES.ANALYTICS_CONVERSATION_PARTIAL,
  );

  if (enabledAnalyticsConversation) {
    return {
      data: AnalyticsConversationAccessType.FULL_ACCESS,
      isLoading: isLoadingFullAccess,
    };
  }

  if (enabledAnalyticsConversationPartial) {
    return {
      data: AnalyticsConversationAccessType.PARTIAL_ACCESS,
      isLoading: isLoadingPartial,
    };
  }

  return {
    data: AnalyticsConversationAccessType.NO_ACCESS,
    isLoading: isLoadingFullAccess || isLoadingPartial,
  };
}

const getFieldName = (condition: Condition) => {
  // Legacy data has empty fieldName and containHashTag hashtags for labels
  if (condition.fieldName === '') {
    return 'Labels';
  }
  return condition.fieldName;
};

export function useAnalyticsSegmentsQuery() {
  const axios = useAxios();

  return useQuery({
    queryKey: analyticsKeys.getSegments(),
    queryFn: async () => {
      const response = await axios.get<Segment[]>('/Company/Analytics/Segment');
      return response.data
        .map((segment) => ({
          ...segment,
          conditions: segment.conditions.map((condition) => ({
            ...condition,
            fieldName: getFieldName(condition),
          })),
        }))
        .toSorted((a, b) => a.name.localeCompare(b.name));
    },
  });
}

interface CreateSegmentResponse {
  companyId: string;
  conditions: TravisBackendCompanyDomainModelsCondition[];
  createdAt: string;
  id: number;
  name: string;
  status: string;
  updatedAt: string;
}
export function useAnalyticsCreateSegment(
  options?: MutationOptions<
    CreateSegmentResponse,
    Error,
    {
      name: string;
      conditions: TravisBackendCompanyDomainModelsCondition[];
    }
  >,
) {
  const axios = useAxios();

  return useMutation({
    ...options,
    mutationFn: async ({ name, conditions }) => {
      const response = await axios.post<CreateSegmentResponse>(
        '/Company/Analytics/Segment/Create',
        {
          name,
          conditions,
        },
      );
      return response.data;
    },
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: analyticsKeys.getSegments(),
      });
      options?.onSuccess?.(...args);
    },
  });
}

export function useAnalyticsEditSegmentMutation(
  options?: MutationOptions<
    CreateSegmentResponse,
    Error,
    {
      segmentId: number;
      name: string;
      conditions: TravisBackendCompanyDomainModelsCondition[];
    }
  >,
) {
  const axios = useAxios();

  return useMutation({
    ...options,
    mutationFn: async ({ segmentId, name, conditions }) => {
      const response = await axios.put<CreateSegmentResponse>(
        `/Company/Analytics/Segment/update/${segmentId}`,
        {
          name,
          conditions,
        },
      );
      return response.data;
    },
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: analyticsKeys.getSegments(),
      });
      options?.onSuccess?.(...args);
    },
  });
}

interface DeleteSegmentOutput {
  message: string;
}
interface DeleteSegmentInput {
  segmentId: number;
  segmentName: string;
}

export function useAnalyticsDeleteSegmentMutation(
  options?: MutationOptions<DeleteSegmentOutput, Error, DeleteSegmentInput>,
) {
  const axios = useAxios();

  return useMutation({
    ...options,
    mutationFn: async ({ segmentId }) => {
      const response = await axios.delete<DeleteSegmentOutput>(
        `/Company/Analytics/segment/${segmentId}`,
      );
      return response.data;
    },
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: analyticsKeys.getSegments(),
      });
      options?.onSuccess?.(...args);
    },
  });
}

export interface TopicTerm {
  text: string;
}
export interface Topic {
  id: string;
  name: string;
  terms: TopicTerm[];
  updated_by: {
    sleekflow_staff_id?: string | null;
  };
  updated_at: string;
  updated_by_staff?: StaffCore;
}
export interface TopicMetricAnalytics {
  topicId: string;
  rank: number | null;
  summary?: {
    totalConversations: number;
    percentageConversations: number;
  };
  dailyLogs?: Array<{
    date: string;
    totalConversations: number;
  }>;
}
export interface TopicMetric {
  startDate: string;
  endDate: string;
  lastUpdateTime: string;
  analytics: TopicMetricAnalytics[];
}

export type TopicMetricWithTopic = Omit<TopicMetric, 'analytics'> & {
  analytics: (TopicMetricAnalytics & {
    topic: Topic | undefined;
  })[];
};

export function useAnalyticsCreateTopic() {
  const axios = useAxios();
  const queryClient = useQueryClient();
  const snackbar = useSnackbar();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: async (data: { name: string; terms: string[] }) => {
      const response = await axios.post<{
        success: boolean;
        data: { topic: Topic };
      }>('/IntelligentHub/TopicAnalytics/CreateTopic', {
        ...data,
        terms: data.terms.map((term) => ({ text: term })),
      });

      if (!response.data.success) {
        throw new Error('Failed to create topic');
      }
      return response.data;
    },
    onSuccess: ({ data: { topic } }) => {
      queryClient.invalidateQueries({
        queryKey: analyticsKeys.getTopics(),
      });
      queryClient.invalidateQueries({
        queryKey: analyticsKeys.getTopicMetric._def,
      });

      snackbar.success(
        t('analytics.topics.create.success', {
          defaultValue: 'You have successfully created {topicName}',
          topicName: topic.name,
        }),
      );
    },
    onError: (error) => {
      console.error(error);
      snackbar.error(
        t('analytics.topics.create.error', {
          defaultValue: 'Something went wrong. Please try again later.',
        }),
      );
    },
  });
}

interface UseAnalyticsEditTopicParams {
  options?: MutationOptions<Topic, Error, Pick<Topic, 'id' | 'name' | 'terms'>>;
}
export function useAnalyticsEditTopic({
  options,
}: UseAnalyticsEditTopicParams = {}) {
  const axios = useAxios();
  const queryClient = useQueryClient();
  const snackbar = useSnackbar();
  const { t } = useTranslation();
  return useMutation({
    ...options,
    mutationFn: async ({
      id,
      name,
      terms,
    }: Pick<Topic, 'id' | 'name' | 'terms'>) => {
      const response = await axios.post<{
        success: boolean;
        data: { topic: Topic };
      }>('/IntelligentHub/TopicAnalytics/UpdateTopic', {
        id,
        updated_properties: { name, terms },
      });

      if (!response.data.success) {
        throw new Error('Failed to update topic');
      }
      return response.data.data.topic;
    },
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: analyticsKeys.getTopics(),
      });
      queryClient.invalidateQueries({
        queryKey: analyticsKeys.getTopicMetric._def,
      });

      options?.onSuccess?.(...args);
      snackbar.info(
        t('analytics.topics.edit.success', {
          defaultValue: `You have edited topic {topicName}`,
          topicName: args[0].name,
        }),
      );
    },
    onError: (...args) => {
      console.error(args[0]);
      options?.onError?.(...args);
      snackbar.error(
        t('analytics.topics.edit.error', {
          defaultValue: 'Something went wrong. Please try again later.',
        }),
      );
    },
  });
}

export function useAnalyticsDeleteTopic() {
  const axios = useAxios();
  const queryClient = useQueryClient();
  const snackbar = useSnackbar();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: async (data: Topic) => {
      await axios.post('/IntelligentHub/TopicAnalytics/DeleteTopics', {
        ids: [data.id],
      });
    },
    onSuccess: (_, { name }) => {
      queryClient.invalidateQueries({
        queryKey: analyticsKeys.getTopics(),
      });
      queryClient.invalidateQueries({
        queryKey: analyticsKeys.getTopicMetric._def,
      });

      snackbar.info(
        t('analytics.topics.delete.success', {
          defaultValue: `You have deleted topic {topicName}`,
          topicName: name,
        }),
      );
    },
    onError: (error) => {
      console.error(error);
      snackbar.error(
        t('analytics.topics.edit.error', {
          defaultValue: 'Something went wrong. Please try again later.',
        }),
      );
    },
  });
}

type UseAnalyticsTopicsQueryParams = Omit<
  UseQueryOptions<TopicsResponseTopic[], unknown, Topic[]>,
  'queryKey' | 'queryFn' | 'select'
>;

type TopicsResponseTopic = Omit<Topic, 'updated_by_staff'>;

export function useAnalyticsTopicsQuery(
  options?: UseAnalyticsTopicsQueryParams,
) {
  const axios = useAxios();
  const { data: staffMap } = useGetStaffOverview({
    select: useCallback(
      (staffs: StaffCore[]) =>
        staffs.reduce(
          (acc, staff) => {
            acc[staff.id] = staff;
            return acc;
          },
          {} as Record<string, StaffCore>,
        ),
      [],
    ),
  });

  return useQuery({
    queryKey: analyticsKeys.getTopics(),
    queryFn: async () => {
      const response = await axios.post<{
        data: { topics: TopicsResponseTopic[] };
      }>('/IntelligentHub/TopicAnalytics/GetTopics', {
        header: {
          'Content-Type': 'application/json',
        },
      });
      return response.data.data.topics;
    },
    select: (topics) => {
      return topics.map((topic) => ({
        ...topic,
        updated_by_staff:
          staffMap?.[topic?.updated_by?.sleekflow_staff_id || ''],
      }));
    },
    ...options,
  });
}

function _transformTopicMetricData(
  data: TopicMetric,
  groupBy: AnalyticsGroupBy,
): TopicMetric {
  if (groupBy === 'day') {
    return data;
  }

  return {
    ...data,
    analytics: data.analytics.map((topic) => {
      if (!topic.dailyLogs) {
        return topic;
      }

      // For the case where the first few days, which their grouped starting week/month, are before the first date of the date range
      let noOfDateGroupAsFirstDate = 0;
      const dailyLogs = topic.dailyLogs;
      for (let i = 0; i < dailyLogs.length; i++) {
        if (
          dayjs(dailyLogs[i].date)
            .startOf(GROUP_BY_TRANSFORM_MAP[groupBy].startOf)
            .isSameOrAfter(dayjs(dailyLogs[0].date))
        ) {
          noOfDateGroupAsFirstDate = i + 1;
          break;
        }

        if (i === dailyLogs.length - 1) {
          noOfDateGroupAsFirstDate = dailyLogs.length;
        }
      }

      const dateDataMap = new Map<
        string,
        { date: string; totalConversations: number }
      >();

      dailyLogs.forEach((log, index) => {
        const groupedDate =
          index < noOfDateGroupAsFirstDate
            ? dayjs(dailyLogs[0].date).format(DATE_FORMAT)
            : dayjs(log.date)
                .startOf(GROUP_BY_TRANSFORM_MAP[groupBy].startOf)
                .format(DATE_FORMAT);

        if (dateDataMap.has(groupedDate)) {
          const existingLog = dateDataMap.get(groupedDate)!;
          dateDataMap.set(groupedDate, {
            date: groupedDate,
            totalConversations:
              existingLog.totalConversations + log.totalConversations,
          });
          return;
        }

        dateDataMap.set(groupedDate, {
          date: groupedDate,
          totalConversations: log.totalConversations,
        });
      });

      return {
        ...topic,
        dailyLogs: Array.from(dateDataMap.values()),
      };
    }),
  };
}

interface UseAnalyticsTopicMetricQueryParams {
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  isComparePreviousPeriod?: boolean;
  groupBy?: AnalyticsGroupBy;
  options?: Omit<
    UseQueryOptions<TopicMetric, unknown, TopicMetricWithTopic>,
    'queryKey' | 'queryFn'
  >;
}
export function useAnalyticsTopicMetricQuery({
  startDate,
  endDate,
  isComparePreviousPeriod,
  groupBy = 'day',
  options,
}: UseAnalyticsTopicMetricQueryParams) {
  const axios = useAxios();
  const { from, to } = useMemo(
    () =>
      isComparePreviousPeriod
        ? getPreviousPeriod(startDate || '', endDate || '')
        : {
            from: startDate?.format(DATE_FORMAT),
            to: endDate?.format(DATE_FORMAT),
          },
    [isComparePreviousPeriod, startDate, endDate],
  );

  const { data: topics } = useAnalyticsTopicsQuery();

  return useQuery({
    ...options,
    queryKey: analyticsKeys.getTopicMetric(from || '', to || ''),
    queryFn: async () => {
      const response = await axios.post<TopicMetric>(
        '/Company/Analytics/Topic/Common',
        {
          from,
          to,
        },
      );
      return response.data;
    },
    enabled: !!startDate && !!endDate && options?.enabled,
    select: (data) => {
      const transformedData = _transformTopicMetricData(data, groupBy);
      return {
        ...transformedData,
        analytics: transformedData.analytics.map((topicMetric) => ({
          ...topicMetric,
          topic: topics?.find((topic) => topic.id === topicMetric.topicId),
        })),
      };
    },
  });
}
