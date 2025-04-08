import { createQueryKeys } from '@lukemorales/query-key-factory';
import type {
  SleekflowApisTicketingHubModelFilterGroup,
  SleekflowApisTicketingHubModelGetTicketActivitiesOutput,
  SleekflowApisTicketingHubModelGetTicketCommentsOutput,
  SleekflowApisTicketingHubModelGetTicketPrioritiesOutput,
  SleekflowApisTicketingHubModelGetTicketStatusesOutput,
  SleekflowApisTicketingHubModelGetTicketTypesOutput,
  SleekflowApisTicketingHubModelTicketCompanyConfig,
  TravisBackendTicketingHubDomainViewModelsGetSchemafulTicketsOutput,
} from '@sleekflow/sleekflow-core-typescript-rxjs-apis';
import {
  DefaultError,
  InfiniteData,
  keepPreviousData,
  QueryKey,
  queryOptions,
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
  useSuspenseQuery,
} from '@tanstack/react-query';
import useSnackbar from '@/hooks/useSnackbar';
import dayjs, { ConfigType } from 'dayjs';
import { useInjection } from 'inversify-react';
import _groupBy from 'lodash/fp/groupBy';
import _map from 'lodash/fp/map';
import _mapValues from 'lodash/fp/mapValues';
import _pipe from 'lodash/fp/pipe';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { firstValueFrom } from 'rxjs';
import type { AjaxError } from 'rxjs/ajax';

import { API_ERROR_CODES } from '@/constants/apiErrorCodes';
import { useSuspenseAccessRuleGuard } from '@/pages/Contacts/shared/accessRuleGuard/useAccessRuleGuard';
import {
  TicketCountResult,
  TicketingService,
} from '@/services/ticketing/ticketing.service';
import { queryClient, retryWithPredicate } from '@/utils/queryClient';
import { axiosClient } from './axiosClient';

import {
  RoleType,
  TICKET_PERMISSION_ACTIONS,
  TicketPermissionAction,
  TicketPermissionSets,
  TicketPermissionType,
  type TicketDetails,
} from './types';
import {
  FEATURE_FLAG_NAMES,
  useIsCompanyFeatureFlagEnabled,
  useSuspenseIsCompanyFeatureFlagEnabled,
} from './featureFlag';

export interface DownloadBlobUrlsArgs {
  blobNames: string[];
  blobType: string;
}

interface Filter {
  field_name: string;
  operator: string;
  value: string | number | null;
}

export interface TicketListParams {
  priority?: string[];
  status?: (string | Filter)[];
  assignee?: string[];
  channel?: {
    channel_type: string;
    channel_identity_id: string;
  }[];
  type?: string[];
  contact?: string[];
  due_date?: { filters: Filter[] }[];

  limit?: number;
  sort?: {
    field_name: string;
    direction: 'asc' | 'desc';
    is_case_sensitive?: boolean;
  };
  search?: string | null;
  deleted?: boolean;
  group_by?: string;
}

export const ticketingKeys = createQueryKeys('ticketing', {
  config: null,
  ticketTypes: null,
  ticketPriorities: null,
  ticketStatuses: null,
  uploadBlobs: null,
  getDownloadBlobUrls: ({ blobNames, blobType }: DownloadBlobUrlsArgs) => ({
    blobNames,
    blobType,
  }),
  list: (filters: TicketListParams) => [{ filters }],
  listTotalCount: (filters: TicketListParams) => [{ filters }],
  detail: (ticketId: string) => [ticketId],
  ticketActivities: (ticketId: string) => [ticketId],
  ticketComments: (ticketId: string) => [ticketId],
});

export const useTicketingConfigOptions = (
  options: Omit<
    UseQueryOptions<
      SleekflowApisTicketingHubModelTicketCompanyConfig | undefined
    >,
    'queryKey' | 'queryFn'
  > = {},
) => {
  const ticketingService = useInjection(TicketingService);

  return queryOptions({
    queryKey: ticketingKeys.config,
    queryFn: () =>
      firstValueFrom(ticketingService.getCompanyTicketingConfig$()),
    staleTime: Infinity,
    throwOnError: false, // Failing to get ticketing config should not break the app
    ...options,
  });
};

type UseTicketingConfigOptions = Parameters<
  typeof useTicketingConfigOptions
>[0];

export const useTicketingConfig = (options: UseTicketingConfigOptions = {}) => {
  return useQuery(useTicketingConfigOptions(options));
};

export const useSuspenseTicketingConfig = (
  options: UseTicketingConfigOptions = {},
) => {
  return useSuspenseQuery(useTicketingConfigOptions(options));
};

export const useIsTicketingEnabled = () => {
  const { data: isTicketingEnabled, isLoading } =
    useIsCompanyFeatureFlagEnabled(FEATURE_FLAG_NAMES.TICKETING);

  // TODO: remove this once the long term solution of creating ticketing config on the backend is in place
  const { data: ticketingConfig, isLoading: isTicketingConfigLoading } =
    useTicketingConfig({
      staleTime: Infinity,
      gcTime: Infinity,
      enabled: isTicketingEnabled,
    });

  return {
    data: !!(isTicketingEnabled && ticketingConfig),
    isLoading: isLoading || isTicketingConfigLoading,
  };
};

export const useSuspenseIsTicketingEnabled = () => {
  const { data: isTicketingEnabled, isLoading } =
    useSuspenseIsCompanyFeatureFlagEnabled(FEATURE_FLAG_NAMES.TICKETING);

  // TODO: remove this once the long term solution of creating ticketing config on the backend is in place
  const { data: ticketingConfig, isLoading: isTicketingConfigLoading } =
    useTicketingConfig({
      staleTime: Infinity,
      gcTime: Infinity,
      enabled: isTicketingEnabled,
    });

  return {
    data: !!(isTicketingEnabled && ticketingConfig),
    isLoading: isLoading || isTicketingConfigLoading,
  };
};

const _groupPermissionsByType = _groupBy('type');

const _mapPermissionValuesToSet = _mapValues<{ value: string }[], Set<string>>(
  (values) => new Set(values.map((permission) => permission.value)),
);

const _setRoleSetIfMissing = (permissionSet: Record<string, Set<string>>) => {
  const newPermissionSet = { ...permissionSet };
  if (!newPermissionSet.role) {
    newPermissionSet.role = new Set();
  }
  return newPermissionSet;
};

export const useTicketingConfigPermission = () => {
  const { data: companyTicketingConfig, isLoading } = useTicketingConfig();
  const accessRulesGuard = useSuspenseAccessRuleGuard();

  const permissionSets: TicketPermissionSets = useMemo(() => {
    if (companyTicketingConfig?.permissions) {
      const result = TICKET_PERMISSION_ACTIONS.reduce((prev, action) => {
        return {
          ...prev,
          [action]: _pipe(
            _groupPermissionsByType,
            _mapPermissionValuesToSet,
            _setRoleSetIfMissing,
          )(companyTicketingConfig.permissions?.[action] || []),
        };
      }, {} as TicketPermissionSets);

      // Admin always has creation/deletion permission
      result.createTicket.role.add(RoleType.ADMIN);
      result.deleteTicket.role.add(RoleType.ADMIN);

      return result;
    }

    return Object.fromEntries(
      TICKET_PERMISSION_ACTIONS.map((action) => [action, { role: new Set() }]),
    ) as TicketPermissionSets;
  }, [companyTicketingConfig]);

  const myTicketPermission = useMemo(() => {
    if (!permissionSets) {
      return Object.fromEntries(
        TICKET_PERMISSION_ACTIONS.map((action) => [action, false]),
      ) as Record<TicketPermissionAction, boolean>;
    }

    return Object.fromEntries(
      TICKET_PERMISSION_ACTIONS.map((action) => {
        return [
          action,
          permissionSets[action][TicketPermissionType.ROLE].has(
            accessRulesGuard.user.data?.roleType || '',
          ),
        ];
      }),
    ) as Record<TicketPermissionAction, boolean>;
  }, [permissionSets, accessRulesGuard]);

  return {
    permissionSets,
    isLoading,
    myTicketPermission,
  };
};

export const useUpdateTicketingConfigPermission = () => {
  const ticketingService = useInjection(TicketingService);
  const { t } = useTranslation();
  const snackbar = useSnackbar();
  return useMutation({
    mutationFn: async (permissionSets: TicketPermissionSets) => {
      const permissions = Object.fromEntries(
        TICKET_PERMISSION_ACTIONS.map((action) => {
          const typeValueArray = Object.entries(permissionSets[action])
            .map(([type, set]) =>
              [...set].map((value) => ({
                type,
                value,
              })),
            )
            .flat();
          return [action, typeValueArray];
        }),
      );
      return firstValueFrom(
        ticketingService.updateTicketPermissions$({ permissions }),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ticketingKeys.config });
      snackbar.success(
        t(
          'settings.company-inbox.ticketing.permission.update-success',
          'You have successfully updated ticketing permissions',
        ),
      );
    },
    onError: (e) => {
      console.log(e);
      snackbar.error(
        t(
          'settings.company-inbox.ticketing.permission.update-error',
          'Unable to update settings for ticketing permissions. Please try again later.',
        ),
      );
    },
  });
};

// Dynamic i18n keys:
// Ticket type:
// t('ticketing.type.question', 'Question')
// t('ticketing.type.incident', 'Incident')
// t('ticketing.type.problem', 'Problem')
// t('ticketing.type.task', 'Task')

// Ticket status:
// t('ticketing.status.to_do', 'To do')
// t('ticketing.status.in_progress', 'In Progress')
// t('ticketing.status.on_hold', 'On Hold')
// t('ticketing.status.reopened', 'Reopened')
// t('ticketing.status.resolved', 'Resolved')

// Ticket priority:
// t('ticketing.priority.urgent', 'Urgent')
// t('ticketing.priority.high', 'High')
// t('ticketing.priority.medium', 'Medium')
// t('ticketing.priority.low', 'Low')

export const useTicketingPriorities = ({
  enabled,
  ...options
}: Omit<
  UseQueryOptions<
    SleekflowApisTicketingHubModelGetTicketPrioritiesOutput | undefined,
    unknown,
    SleekflowApisTicketingHubModelGetTicketPrioritiesOutput['records']
  >,
  'queryKey'
> = {}) => {
  const { t } = useTranslation();
  const ticketingService = useInjection(TicketingService);
  const { data: isTicketingEnabled } = useIsTicketingEnabled();

  return useQuery({
    queryKey: ticketingKeys.ticketPriorities,
    queryFn: () => firstValueFrom(ticketingService.getTicketPriorities$()),
    select: useCallback(
      (
        data:
          | SleekflowApisTicketingHubModelGetTicketPrioritiesOutput
          | undefined,
      ) =>
        data?.records?.map((priority) => ({
          ...priority,
          // eslint-disable-next-line react-i18n/no-dynamic-translation-keys
          label: t(priority.i18n_key || '', priority.label!),
        })),
      [t],
    ),
    staleTime: Infinity,
    gcTime: Infinity,
    enabled: isTicketingEnabled && enabled,
    ...options,
  });
};

const isDefaultTicketType = (typeLabel: string | null | undefined) =>
  ['Question', 'Incident', 'Problem', 'Task'].includes(typeLabel || '');

export const useTicketingTypes = ({
  enabled,
  ...options
}: Omit<
  UseQueryOptions<
    SleekflowApisTicketingHubModelGetTicketTypesOutput | undefined,
    unknown,
    SleekflowApisTicketingHubModelGetTicketTypesOutput['records']
  >,
  'queryKey'
> = {}) => {
  const { t } = useTranslation();
  const ticketingService = useInjection(TicketingService);
  const { data: isTicketingEnabled } = useIsTicketingEnabled();

  return useQuery({
    queryKey: ticketingKeys.ticketTypes,
    queryFn: () => firstValueFrom(ticketingService.getTicketTypes$()),
    select: useCallback(
      (data: SleekflowApisTicketingHubModelGetTicketTypesOutput | undefined) =>
        data?.records?.map((type) => ({
          ...type,
          // eslint-disable-next-line react-i18n/no-dynamic-translation-keys
          label: t(type.i18n_key || '', type.label!),
          // Hide i18n_key for custom ticket types
          i18n_key: isDefaultTicketType(type.label) ? type.i18n_key : undefined,
        })),
      [t],
    ),
    staleTime: Infinity,
    gcTime: Infinity,
    enabled: isTicketingEnabled && enabled,
    throwOnError: false,
    ...options,
  });
};

export const useTicketingStatuses = ({
  enabled,
  ...options
}: Omit<
  UseQueryOptions<
    SleekflowApisTicketingHubModelGetTicketStatusesOutput | undefined,
    unknown,
    SleekflowApisTicketingHubModelGetTicketStatusesOutput['records']
  >,
  'queryKey'
> = {}) => {
  const { t } = useTranslation();
  const ticketingService = useInjection(TicketingService);
  const { data: isTicketingEnabled } = useIsTicketingEnabled();

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ticketingKeys.ticketStatuses,
    queryFn: () => firstValueFrom(ticketingService.getTicketStatuses$()),
    select: useCallback(
      (
        data: SleekflowApisTicketingHubModelGetTicketStatusesOutput | undefined,
      ) =>
        data?.records?.map((status) => ({
          ...status,
          // eslint-disable-next-line react-i18n/no-dynamic-translation-keys
          label: t(status.i18n_key || '', status.label!),
        })),
      [t],
    ),
    staleTime: Infinity,
    gcTime: Infinity,
    enabled: isTicketingEnabled && enabled,
    ...options,
  });

  const DefaultTicketStatus = useMemo(
    () =>
      (data
        ?.filter((status) => status.is_default && status.internal_value)
        .reduce(
          (acc, status) => ({
            ...acc,
            [(status.internal_value as string).toUpperCase()]: status.id!,
          }),
          {},
        ) ?? {}) as Record<string, string | undefined>,
    [data],
  );

  return {
    data,
    isLoading,
    DefaultTicketStatus,
    refetch,
    isFetching,
  };
};

export const useTicketStatus = (ticket?: TicketDetails) => {
  const { data: ticketingStatuses } = useTicketingStatuses();

  return useMemo(
    () =>
      ticketingStatuses?.find((status) => status.id === ticket?.status_id) ??
      null,
    [ticketingStatuses, ticket],
  );
};

export const useIsTicketResolved = (ticket?: TicketDetails) => {
  const ticketStatus = useTicketStatus(ticket);

  return ticketStatus?.type === 'end';
};

export const buildDueDateFilter = (
  dueDateOptionValue: string | null,
  from: string | null,
  to: string | null,
  resolvedStatusId?: string | null,
) => {
  const toDayStart = (date: ConfigType) =>
    dayjs(date).set('hour', 0).set('minute', 0).set('second', 0).toISOString();

  const toDayEnd = (date: ConfigType) =>
    dayjs(date)
      .set('hour', 23)
      .set('minute', 59)
      .set('second', 59)
      .toISOString();

  const toFilters = (start: ConfigType, end?: ConfigType) => [
    {
      filters: [
        {
          field_name: 'due_date',
          operator: '>=',
          value: toDayStart(start),
        },
      ],
    },
    {
      filters: [
        {
          field_name: 'due_date',
          operator: '<=',
          value: toDayEnd(end ?? start),
        },
      ],
    },
  ];

  if (from && to) {
    return toFilters(from, to);
  }

  if (dueDateOptionValue === 'overdue') {
    return [
      {
        filters: [
          {
            field_name: 'due_date',
            operator: '<=',
            value: dayjs().toISOString(),
          },
        ],
      },
      {
        filters: [
          {
            field_name: 'status_id',
            operator: '!=',
            value: resolvedStatusId || '',
          },
        ],
      },
    ];
  }

  if (dueDateOptionValue === 'today') {
    const now = dayjs();
    return toFilters(now);
  }

  if (dueDateOptionValue === 'tomorrow') {
    const tomorrow = dayjs().add(1, 'day');
    return toFilters(tomorrow);
  }

  if (dueDateOptionValue === 'yesterday') {
    const yesterday = dayjs().subtract(1, 'day');
    return toFilters(yesterday);
  }

  if (dueDateOptionValue === 'next_7_days') {
    const now = dayjs();
    const next7Days = now.add(7, 'day');
    return toFilters(now, next7Days);
  }

  if (dueDateOptionValue === 'last_7_days') {
    const now = dayjs();
    const last7Days = now.subtract(7, 'day');
    return toFilters(last7Days, now);
  }

  if (dueDateOptionValue === 'null') {
    return [
      {
        filters: [
          {
            field_name: 'due_date',
            operator: '=',
            value: null,
          },
        ],
      },
    ];
  }
};

interface UseTicketListParams
  extends Omit<
    UseInfiniteQueryOptions<
      | TravisBackendTicketingHubDomainViewModelsGetSchemafulTicketsOutput
      | undefined,
      Error,
      InfiniteData<
        | TravisBackendTicketingHubDomainViewModelsGetSchemafulTicketsOutput
        | undefined
      >,
      | TravisBackendTicketingHubDomainViewModelsGetSchemafulTicketsOutput
      | undefined,
      QueryKey,
      string | null | undefined
    >,
    'queryKey'
  > {
  params?: TicketListParams;
}

const buildTicketListFilterGroup = (params: TicketListParams) => {
  const filterGroups = [
    {
      filters: [
        {
          field_name: 'record_statuses',
          operator: 'array_contains',
          value: (params.deleted ? 'Deleted' : 'Active') as string | number,
        },
      ],
    },
  ] as { filters: Filter[] }[];

  if (params.contact && params.contact.length > 0) {
    filterGroups.push({
      filters: params.contact.map((contactId) => ({
        field_name: 'sleekflow_user_profile_id',
        operator: '=',
        value: contactId,
      })),
    });
  }

  if (params.status && params.status.length > 0) {
    filterGroups.push({
      filters: params.status.map((statusIdOrFilter) =>
        typeof statusIdOrFilter === 'string'
          ? {
              field_name: 'status_id',
              operator: '=',
              value: statusIdOrFilter,
            }
          : statusIdOrFilter,
      ),
    });
  }

  if (params.due_date) {
    filterGroups.push(...params.due_date);
  }

  if (params.search) {
    filterGroups.push({
      filters: [
        {
          field_name: 'external_id',
          operator: '=',
          value: Number(params.search.replace('#', '')),
        },
        {
          field_name: 'title',
          operator: 'contains',
          value: params.search,
        },
      ],
    });
  }

  if (params.assignee && params.assignee.length > 0) {
    filterGroups.push({
      filters: params.assignee.map((assigneeId) => ({
        field_name: 'assignee_id',
        operator: '=',
        value: assigneeId,
      })),
    });
  }

  if (params.priority && params.priority.length > 0) {
    filterGroups.push({
      filters: params.priority.map((priorityId) => ({
        field_name: 'priority_id',
        operator: '=',
        value: priorityId,
      })),
    });
  }

  if (params.type && params.type.length > 0) {
    filterGroups.push({
      filters: params.type.map((typeId) => ({
        field_name: 'type_id',
        operator: '=',
        value: typeId,
      })),
    });
  }

  if (params.channel && params.channel.length > 0) {
    filterGroups.push(
      {
        filters: params.channel.map(({ channel_type }) => ({
          field_name: 'channel.channel_type',
          operator: '=',
          value: channel_type,
        })),
      },
      {
        filters: params.channel.map(({ channel_identity_id }) => ({
          field_name: 'channel.channel_identity_id',
          operator: '=',
          value: channel_identity_id,
        })),
      },
    );
  }

  return filterGroups;
};

export const useTicketList = ({
  enabled,
  params = {},
  ...options
}: UseTicketListParams) => {
  const ticketingService = useInjection(TicketingService);
  const { data: isTicketingEnabled } = useIsTicketingEnabled();

  return useInfiniteQuery({
    queryKey: ticketingKeys.list(params),
    ...options,
    queryFn: ({ pageParam }) =>
      firstValueFrom(
        ticketingService.getTickets$({
          continuation_token: pageParam,
          filter_groups: buildTicketListFilterGroup(params),
          limit: params.limit,
          sort: params.sort || {
            direction: 'desc',
            field_name: 'created_at',
            is_case_sensitive: false,
          },
        }),
      ),
    initialPageParam: undefined,
    enabled: isTicketingEnabled && enabled,
    staleTime: 0,
    placeholderData: keepPreviousData,
  });
};

interface UseTicketCountParams<T>
  extends Omit<UseQueryOptions<TicketCountResult[], unknown, T>, 'queryKey'> {
  params?: TicketListParams;
  select?: (data: TicketCountResult[]) => T;
}

export const useTicketCount = <T = TicketCountResult[]>({
  params = {},
  enabled,
  ...options
}: UseTicketCountParams<T> = {}) => {
  const ticketingService = useInjection(TicketingService);
  const { data: isTicketingEnabled } = useIsTicketingEnabled();

  return useQuery({
    queryKey: ticketingKeys.listTotalCount(params),
    queryFn: () =>
      firstValueFrom(
        ticketingService.getTicketCount$({
          filter_groups: buildTicketListFilterGroup(params),
          group_bys: params.group_by ? [{ field_name: params.group_by }] : [],
        }),
      ),
    staleTime: 0,
    enabled: isTicketingEnabled && enabled,
    throwOnError: false, // Ticket count is not essential, no need to throw
    ...options,
  });
};

interface UseTicketOptions
  extends Omit<
    UseQueryOptions<TicketDetails | undefined, AjaxError>,
    'queryKey'
  > {
  ticketId?: string | null;
}

export const useTicket = ({
  ticketId,
  enabled,
  ...options
}: UseTicketOptions = {}) => {
  const ticketingService = useInjection(TicketingService);
  const { data: isTicketingEnabled } = useIsTicketingEnabled();

  return useQuery({
    queryKey: ticketingKeys.detail(ticketId!),
    queryFn: () => firstValueFrom(ticketingService.getTicket$(ticketId!)),
    staleTime: 0,
    enabled: Boolean(ticketId) && isTicketingEnabled && enabled,
    retry: retryWithPredicate(
      (error: AjaxError) =>
        ![API_ERROR_CODES.notFoundObjectException].includes(
          error.response.errorCode,
        ),
    ),
    ...options,
  });
};

export type TicketActivityPage =
  SleekflowApisTicketingHubModelGetTicketActivitiesOutput;

interface UseTicketActivitiesOptions
  extends Omit<
    UseInfiniteQueryOptions<
      TicketActivityPage,
      DefaultError,
      InfiniteData<TicketActivityPage>,
      TicketActivityPage,
      QueryKey,
      string | null | undefined
    >,
    'queryKey' | 'getNextPageParam' | 'initialPageParam'
  > {
  ticketId?: string | null;
  limit?: number;
}

const TICKET_ACTIVITY_PAGE_SIZE = 1000;

export const useTicketActivities = ({
  ticketId,
  limit,
  ...options
}: UseTicketActivitiesOptions = {}) => {
  const ticketingService = useInjection(TicketingService);
  const { data: isTicketingEnabled } = useIsTicketingEnabled();

  return useInfiniteQuery({
    ...options,
    queryKey: ticketingKeys.ticketActivities(ticketId!),
    queryFn: ({ pageParam }) =>
      firstValueFrom(
        ticketingService.getTicketActivities$({
          ticketId: ticketId!,
          continuationToken: pageParam,
          limit: limit ?? TICKET_ACTIVITY_PAGE_SIZE,
        }),
      ),
    enabled: Boolean(ticketId && isTicketingEnabled),
    getNextPageParam: (lastPage: TicketActivityPage | undefined) =>
      lastPage?.continuation_token,
    initialPageParam: undefined,
    staleTime: 0,
    placeholderData: keepPreviousData,
  });
};

export interface TicketCommentsParams {
  id: string;
  sort?: {
    fieldName: string;
    direction: 'asc' | 'desc';
    is_case_sensitive: boolean;
  };
  limit?: number;
}

const buildTicketCommentsFilterGroup = (
  params: TicketCommentsParams,
): SleekflowApisTicketingHubModelFilterGroup[] => {
  return [
    {
      filters: [
        {
          field_name: 'ticket_id',
          operator: '=',
          value: params.id,
        },
      ],
    },
  ];
};

type UseTicketingCommentsOptions = Omit<
  UseInfiniteQueryOptions<
    SleekflowApisTicketingHubModelGetTicketCommentsOutput | undefined,
    DefaultError,
    InfiniteData<
      SleekflowApisTicketingHubModelGetTicketCommentsOutput | undefined
    >,
    SleekflowApisTicketingHubModelGetTicketCommentsOutput | undefined,
    QueryKey,
    string | null | undefined
  >,
  'queryKey' | 'getNextPageParam' | 'initialPageParam'
>;

const TICKET_COMMENT_PAGE_SIZE = 1000;
export const useTicketingComments = (
  params: TicketCommentsParams,
  options: UseTicketingCommentsOptions = {},
) => {
  const ticketingService = useInjection(TicketingService);
  return useInfiniteQuery({
    queryKey: ticketingKeys.ticketComments(params.id),
    queryFn: ({ pageParam }) =>
      firstValueFrom(
        ticketingService.getComments$({
          filter_groups: buildTicketCommentsFilterGroup(params),
          sort: params.sort ?? {
            direction: 'desc',
            field_name: 'created_at',
            is_case_sensitive: false,
          },
          limit: params.limit ?? TICKET_COMMENT_PAGE_SIZE,
          continuation_token: pageParam,
        }),
      ),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage?.continuation_token,
    placeholderData: keepPreviousData,
    ...options,
  });
};

type UseExportTicketCSVOptions = UseMutationOptions<
  void,
  unknown,
  [dayjs.Dayjs, dayjs.Dayjs]
>;
export function useExportTicketCSV(options?: UseExportTicketCSVOptions) {
  const snackbar = useSnackbar();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (dateRange) => {
      await axiosClient.post('/TicketingHub/Tickets/Export', {
        start_date: dateRange[0].toISOString(),
        end_date: dateRange[1].toISOString(),
      });
    },
    onError: () => {
      snackbar.error(t('general.generic-toast-error'));
    },
    ...options,
  });
}
