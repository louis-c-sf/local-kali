import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { axiosClient, useAxios } from '@/api/axiosClient';
import useConversation from '@/pages/InboxRXJS/hooks/useConversation';
import {
  ConversationWrapper,
  ConversationWrapperAssignee,
} from '@/services/conversations/managers/conversation-wrapper';
import { getFullName } from '@/utils/formatting';

import type {
  Assignee,
  ChannelType,
  Conversation,
  ConversationMessage,
  ConversationPermission,
  ConversationStatus,
  Team,
} from '../types';
import { conversationKeys } from './queryKeys';
import {
  TravisBackendConversationDomainViewModelsConversationAssignResponseViewModel,
  TravisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel,
  TravisBackendConversationDomainViewModelsConversationStatusResponseViewModel,
  TravisBackendMessageDomainViewModelsConversationHashtagViewModel,
} from '@sleekflow/sleekflow-core-typescript-rxjs-apis';
import { LabelService } from '@/services/labels/label.service';
import { useInjection } from 'inversify-react';
import { CACHE_REFRESHING_BEHAVIOUR } from '@/services/rxjs-utils/rxjs-utils';
import { firstValueFrom, map, take, tap, timer } from 'rxjs';
import { ConversationWrapperManagerService } from '@/services/conversations/managers/conversation-wrapper-manager.service';
import { UserProfileWrapperManagerService } from '@/services/user-profiles/managers/user-profile-wrapper-manager.service';
import { useCallback, useMemo } from 'react';
import { ConversationMessageWrapperManagerService } from '@/services/conversation-messages/managers/conversation-message-wrapper-manager.service';
import { AxiosResponse } from 'axios';
import dayjs from 'dayjs';
import { ConversationService } from '@/services/conversations/conversation.service';
import {
  CompanyService,
  MessagingChannel,
} from '@/services/companies/company.service';
import { useObservableEagerState } from '@/hooks/useObservableEagerState';

export * from './queryKeys';

export type ConversationMessageFilters = {
  conversationId?: string;
  offset?: number;
  limit?: number;
  order?: 'asc' | 'desc';
  afterTimestamp?: number;
  beforeTimestamp?: number;
  channel?: ChannelType;
  channelIds?: string | number;
  IsFromUser?: boolean;
  IsFromImport?: boolean;
  messageType?: 'file' | string;
} & { timestamp?: number };

interface ConversationSummaryFilters {
  status?: ConversationStatus;
  afterUpdatedAt?: string;
  afterModifiedAt?: string;
  channelIds?: Record<string, string>[];
  tags?: string;
  teamId?: string;
  isTeamUnassigned?: boolean;
  isAssigned?: boolean;
  isUnread?: boolean;
  channel?: string[];
  behaviourVersion?: '1' | '2';
}

export interface ConversationAssignedToFilters extends ConversationFilters {
  offset?: number;
  limit?: number;
  orderBy?: 'asc' | 'desc';
}

export interface ConversationFilters extends ConversationSummaryFilters {
  assignedTo:
    | 'all'
    | 'unassigned'
    | 'mentioned'
    | 'team'
    | Omit<
        string,
        'all' | 'unassigned' | 'mentioned' | 'collaborator' | 'team'
      >;
}

export interface ConversationsParams {
  status: string;
  assignedTo?: string;
  isTeamUnassigned?: boolean;
  teamId?: string;
  isAssigned?: boolean;
  orderBy?: 'asc' | 'desc';
  isStaffFetchingAll: boolean;
}

export function useConversationMessage<T = ConversationMessage[]>({
  select,
  params: {
    conversationId,
    offset = 0,
    limit = 10,
    order = 'desc',
    ...restParams
  },
  enabled,
}: {
  select?: (data: ConversationMessage[]) => T;
  params: ConversationMessageFilters;
  enabled?: boolean;
}): UseQueryResult<T, unknown> {
  const url = `/ConversationMessages/GetMessages`;
  const axiosClient = useAxios();
  const { t } = useTranslation();
  return useQuery({
    queryKey: conversationKeys.message(
      {
        conversationId,
        offset,
        limit,
        order,
        ...restParams,
      },
      {
        type: 'query',
      },
    ),
    queryFn: async () => {
      const response = await axiosClient.post<{
        messages: ConversationMessage[];
      }>(url, {
        conversationId,
        offset,
        limit,
        order,
        ...restParams,
      });

      return response.data.messages.map((x) => {
        return {
          ...x,
          sender: {
            ...x.sender,
            // trust the displayName when showing full name
            displayName:
              x.sender?.displayName?.trim() ||
              getFullName({
                firstName: x.sender?.firstName,
                lastName: x.sender?.lastName,
                fallback:
                  x.sender?.email?.trim() ||
                  t('general.unknown-label', {
                    defaultValue: 'Unknown',
                  }),
              }),
          },
        };
      });
    },
    select,
    enabled,
    meta: {
      url,
      description: 'Get all conversation`s msg',
    },
  });
}

export interface AssignConversationMutationResponse {
  conversationId: string;
  companyId: string;
  status: string;
  assignee: Assignee;
  assignedTeam: Team;
  additionalAssignees: { assignee: Assignee }[];
  updatedTime: string;
}

export function useSnoozeConversationMutation(
  conversationId: string,
  options?: UseMutationOptions<
    TravisBackendConversationDomainViewModelsConversationStatusResponseViewModel,
    unknown,
    dayjs.Dayjs,
    unknown
  >,
) {
  const url = `/conversation/status/${conversationId}`;
  const axiosClient = useAxios();
  const conversationWrapperManagerService = useInjection(
    ConversationWrapperManagerService,
  );
  const { onSuccess, ...rest } = options || {};

  return useMutation({
    mutationFn: async (snoozeUntil: dayjs.Dayjs) => {
      const response =
        await axiosClient.post<TravisBackendConversationDomainViewModelsConversationStatusResponseViewModel>(
          url,
          {
            status: 'pending',
            snoozeUntil: snoozeUntil.toISOString(),
          },
        );
      return response.data;
    },
    onSuccess: async (...successArgs) => {
      const data = successArgs[0];
      conversationWrapperManagerService.getOrInitConversationWrapper2(
        conversationId,
        data,
      );
      onSuccess?.(...successArgs);
    },
    ...rest,
  });
}

export function useOpenConversationMutation(
  conversationId: string,
  options?: UseMutationOptions<
    TravisBackendConversationDomainViewModelsConversationStatusResponseViewModel,
    unknown,
    void,
    unknown
  >,
) {
  const url = `/conversation/status/${conversationId}`;
  const axiosClient = useAxios();
  const conversationWrapperManagerService = useInjection(
    ConversationWrapperManagerService,
  );
  const { onSuccess, ...rest } = options || {};

  return useMutation({
    mutationFn: async () => {
      const response =
        await axiosClient.post<TravisBackendConversationDomainViewModelsConversationStatusResponseViewModel>(
          url,
          {
            status: 'open',
          },
        );
      return response.data;
    },
    onSuccess: async (...successArgs) => {
      const data = successArgs[0];
      conversationWrapperManagerService.getOrInitConversationWrapper2(
        conversationId,
        data,
      );
      onSuccess?.(...successArgs);
    },
    ...rest,
  });
}

export function useCloseConversationMutation(
  conversationId: string,
  options?: UseMutationOptions<
    TravisBackendConversationDomainViewModelsConversationStatusResponseViewModel,
    unknown,
    void,
    unknown
  >,
) {
  const url = `/conversation/status/${conversationId}`;
  const axiosClient = useAxios();
  const conversationWrapperManagerService = useInjection(
    ConversationWrapperManagerService,
  );
  const { onSuccess, ...rest } = options || {};

  return useMutation({
    mutationFn: async () => {
      const response =
        await axiosClient.post<TravisBackendConversationDomainViewModelsConversationStatusResponseViewModel>(
          url,
          {
            status: 'closed',
          },
        );
      return response.data;
    },
    onSuccess: async (...successArgs) => {
      const data = successArgs[0];
      conversationWrapperManagerService.getOrInitConversationWrapper2(
        conversationId,
        data,
      );
      onSuccess?.(...successArgs);
    },
    ...rest,
  });
}

export function useConversationCollaboratorMutation({
  conversationId,
}: {
  conversationId: string;
}) {
  const url = `/v2/conversation/collaborator/${conversationId}`;
  const axiosClient = useAxios();
  const queryClient = useQueryClient();
  const conversation = useConversation({ conversationId });

  return useMutation({
    mutationFn: async (collaborators: ConversationWrapperAssignee[]) => {
      const response =
        await axiosClient.post<AssignConversationMutationResponse>(url, {
          additionalAssigneeIds: collaborators.map((c) => c.id),
        });
      return response.data;
    },
    onMutate: (collaborators) => {
      conversation.optimisticUpdateCollaborators(collaborators);
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({
        queryKey: conversationKeys.threadCountSummary._def,
      });
      // TODO: Invalidation won't help at time since BE has cache in place
      const conversationQueryKey = conversationKeys.getConversationById({
        conversationId,
      });
      await queryClient.cancelQueries({
        queryKey: conversationQueryKey,
      });
      queryClient.setQueryData<Conversation>(conversationQueryKey, (prev) => {
        if (prev) {
          return {
            ...prev,
            additionalAssignees: data.additionalAssignees,
          };
        }
      });
    },
    onError: () => {
      const existingCollaborators = conversation.getCollaborators();
      if (existingCollaborators) {
        conversation.revertOptimisticUpdateCollaborators(existingCollaborators);
      }
    },
  });
}

export interface ConversationTagsWithIdMutationArgs
  extends ConversationTagsMutationArgs {
  id: string;
}

export interface ConversationTagsMutationArgs {
  hashtag: string;
  hashTagColor: string;
  hashTagType: string;
}

interface StandardResult<T> {
  result: T;
  code: number;
  timestamp: string;
}

interface ConversationAccessibleResponse {
  isAccessible: boolean;
  staffConversationPermission?: ConversationPermission | null;
}

export interface AccessibleResult {
  isAccessible: boolean;
  canView: boolean;
  canSend: boolean;
}

export const getIsConversationAccessibleQueryOptions = ({
  conversationId,
  conversationWrapper,
  conversationWrapperManagerService,
}: {
  conversationId: string;
  conversationWrapper?: ConversationWrapper;
  conversationWrapperManagerService?: ConversationWrapperManagerService;
}) => {
  return {
    queryKey: conversationKeys.isConversationAccessibleKey({ conversationId }),
    queryFn: async () => {
      const { data } = await axiosClient.post<
        StandardResult<ConversationAccessibleResponse>
      >('/conversation/accessible', { conversationId });
      const { isAccessible, staffConversationPermission } = data.result;

      const conversation =
        conversationWrapper ||
        conversationWrapperManagerService?.getConversationWrapper(
          conversationId,
        );
      if (conversation && staffConversationPermission) {
        conversation.onNextConversationPermissions(staffConversationPermission);
      }

      return {
        isAccessible,
        canView: staffConversationPermission?.canView ?? isAccessible,
        canSend: staffConversationPermission?.canSend ?? isAccessible,
      };
    },
  };
};

export function useIsConversationAccessible({
  conversationId,
}: {
  conversationId: string;
}) {
  const conversationWrapperManagerService = useInjection(
    ConversationWrapperManagerService,
  );
  return useQuery({
    ...getIsConversationAccessibleQueryOptions({
      conversationId,
      conversationWrapperManagerService,
    }),
    enabled:
      !!conversationId &&
      conversationId !== ConversationWrapper.initializing().getId(),
  });
}

export interface UseConversationTagsMutationArgs {
  id: string;
  createTags?: Pick<
    TravisBackendMessageDomainViewModelsConversationHashtagViewModel,
    'hashTagColor' | 'hashtag' | 'hashTagType'
  >[];
  addTags?: TravisBackendMessageDomainViewModelsConversationHashtagViewModel[];
  removeTags?: TravisBackendMessageDomainViewModelsConversationHashtagViewModel[];
}

export function useConversationTagsMutation(
  options?: Omit<
    UseMutationOptions<
      void,
      unknown,
      UseConversationTagsMutationArgs,
      undefined
    >,
    'mutationFn'
  >,
) {
  const axios = useAxios();
  const labelService = useInjection(LabelService);
  const conversationWrapperManagerService = useInjection(
    ConversationWrapperManagerService,
  );
  const conversationMessageWrapperManagerService = useInjection(
    ConversationMessageWrapperManagerService,
  );
  const userProfileWrapperManagerService = useInjection(
    UserProfileWrapperManagerService,
  );

  const syncAfterResponseSuccess = useCallback(
    (
      response: AxiosResponse<TravisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel>,
    ) => {
      const conversation = response.data;
      conversationWrapperManagerService.getOrInitConversationWrapper(
        conversation.conversationId!,
        conversation,
      );
      userProfileWrapperManagerService.getOrInitUserProfileWrapper2(
        conversation.userProfile!.id!,
        conversation,
      );

      if (conversation.lastMessage?.[0]?.id) {
        conversationMessageWrapperManagerService.getOrInitConversationMessageWrapper(
          conversation.lastMessage[0].id,
          conversation.lastMessage[0],
        );
      }
    },
    [
      conversationWrapperManagerService,
      userProfileWrapperManagerService,
      conversationMessageWrapperManagerService,
    ],
  );

  return useMutation({
    ...options,
    mutationFn: async ({
      id,
      createTags,
      addTags,
      removeTags,
    }: UseConversationTagsMutationArgs) => {
      const requests = [];
      const addTagsRequestBody = [...(createTags ?? []), ...(addTags ?? [])];
      const removeTagsRequestBody = [...(removeTags ?? [])];
      if (addTagsRequestBody.length > 0) {
        requests.push(
          axios
            .post<TravisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel>(
              `/conversation/tags/add/${id}`,
              addTagsRequestBody,
            )
            .then(syncAfterResponseSuccess),
        );
      }

      if (removeTagsRequestBody.length > 0) {
        requests.push(
          axios
            .post<TravisBackendConversationDomainViewModelsConversationNoCompanyResponseViewModel>(
              `/conversation/tags/remove/${id}`,
              removeTagsRequestBody,
            )
            .then(syncAfterResponseSuccess),
        );
      }

      await Promise.all(requests);

      if (createTags && createTags.length > 0) {
        await firstValueFrom(
          timer(1000).pipe(
            map(() =>
              labelService
                .getAllLabels$(CACHE_REFRESHING_BEHAVIOUR.ALWAYS_REFRESH_SERVER)
                .pipe(take(1)),
            ),
          ),
        );
      }
    },
  });
}

export function usePinConversationMutation(
  conversationId: string,
  options?: UseMutationOptions<
    TravisBackendConversationDomainViewModelsConversationStatusResponseViewModel,
    unknown,
    void,
    unknown
  >,
) {
  const url = `/conversation/bookmark/${conversationId}?bookmark=true`;
  const axiosClient = useAxios();
  const conversationWrapperManagerService = useInjection(
    ConversationWrapperManagerService,
  );
  const { onSuccess, ...rest } = options || {};

  return useMutation({
    mutationFn: async () => {
      const response =
        await axiosClient.post<TravisBackendConversationDomainViewModelsConversationStatusResponseViewModel>(
          url,
        );
      return response.data;
    },
    onSuccess: async (...successArgs) => {
      const data = successArgs[0];
      conversationWrapperManagerService.getOrInitConversationWrapper2(
        conversationId,
        data,
      );
      onSuccess?.(...successArgs);
    },
    ...rest,
  });
}

export function useUnpinConversationMutation(
  conversationId: string,
  options?: UseMutationOptions<
    TravisBackendConversationDomainViewModelsConversationStatusResponseViewModel,
    unknown,
    void,
    unknown
  >,
) {
  const url = `/conversation/bookmark/${conversationId}?bookmark=false`;
  const axiosClient = useAxios();
  const conversationWrapperManagerService = useInjection(
    ConversationWrapperManagerService,
  );
  const { onSuccess, ...rest } = options || {};

  return useMutation({
    mutationFn: async () => {
      const response =
        await axiosClient.post<TravisBackendConversationDomainViewModelsConversationStatusResponseViewModel>(
          url,
        );
      return response.data;
    },
    onSuccess: async (...successArgs) => {
      const data = successArgs[0];
      conversationWrapperManagerService.getOrInitConversationWrapper2(
        conversationId,
        data,
      );
      onSuccess?.(...successArgs);
    },
    ...rest,
  });
}

export interface UseConversationAssignMutationArgs {
  id: string;
  assignmentType?: 'SpecificPerson' | 'SpecificGroup' | 'Unassigned';
  teamAssignmentType?: 'SpecificPerson' | 'QueueBased' | 'Unassigned';
  teamId?: number;
  staffId?: string;
}

export function useConversationAssignMutation(
  options?: UseMutationOptions<
    TravisBackendConversationDomainViewModelsConversationAssignResponseViewModel,
    unknown,
    UseConversationAssignMutationArgs,
    undefined
  >,
) {
  const axios = useAxios();

  return useMutation({
    ...options,
    mutationFn: async ({
      id,
      assignmentType,
      teamAssignmentType,
      teamId,
      staffId,
    }: UseConversationAssignMutationArgs) => {
      const response =
        await axios.post<TravisBackendConversationDomainViewModelsConversationAssignResponseViewModel>(
          `/v2/conversation/assignee/${id}`,
          {
            assignmentType,
            teamAssignmentType,
            teamId,
            staffId,
          },
        );
      return response.data;
    },
  });
}

export function useReadConversationMutation(conversationId: string) {
  const axios = useAxios();
  const conversationService = useInjection(ConversationService);

  return useMutation({
    mutationFn: async () => {
      await firstValueFrom(
        conversationService.getConversationWrapper$(conversationId).pipe(
          tap((conversationWrapper) => {
            conversationWrapper.resetUnreadMessageCount();
          }),
        ),
      );
      await axios.post(`/v3/conversation/read/${conversationId}`);
      conversationService.onReadConversation.next({ id: conversationId });
    },
  });
}
export function useUnreadConversationMutation(conversationId: string) {
  const axios = useAxios();

  return useMutation({
    mutationFn: () => axios.post(`/v3/conversation/unread/${conversationId}`),
  });
}

interface Params<T> {
  select?: (data: MessagingChannel[]) => T;
}
export function useDisplayableMessageChannels<T = MessagingChannel[]>({
  select,
}: Params<T> = {}) {
  const companyService = useInjection(CompanyService);
  const channels = useObservableEagerState(
    companyService.getDisplayableMessageChannels$(),
    [],
  );

  return useMemo(
    () => (select ? select(channels) : channels),
    [channels, select],
  );
}
