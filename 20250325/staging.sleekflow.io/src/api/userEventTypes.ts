import { createQueryKeys } from '@lukemorales/query-key-factory';
import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import {
  ApiErrorResponseTemplate,
  ApiSuccessResponseTemplate,
} from '@/api/types';

import { useAxios } from './axiosClient';
import { UserEventType } from '@/pages/Settings/SettingsConversionLogging/types';
import { AxiosResponse } from 'axios';

export const userEventKeys = createQueryKeys('userEventType', {
  getUserEventTypes: ({ limit }) => [limit],
});

type GetAllUserEventsResponse = {
  continuation_token: string | null;
  records: UserEventType[];
  count: number;
};

export const useGetAllUserEventsQuery = ({
  limit = 100,
  disabled = false,
}: {
  limit?: number;
  disabled?: boolean;
}) => {
  const axiosClient = useAxios();

  return useInfiniteQuery({
    enabled: !disabled,
    queryKey: userEventKeys.getUserEventTypes({
      limit,
    }),
    initialPageParam: null,
    queryFn: async ({ pageParam = null }) => {
      const url = `/v1/user-event-hub/authorized/UserEventTypes/GetUserEventTypes`;
      const response = await axiosClient.post<
        ApiSuccessResponseTemplate<GetAllUserEventsResponse>
      >(
        url,
        { continuation_token: pageParam, limit },
        {
          baseURL: import.meta.env.VITE_SLEEKFLOW_API_BASE_URL,
        },
      );
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error('Failed to get user events.');
    },
    placeholderData: keepPreviousData,
    getNextPageParam: (lastPage: GetAllUserEventsResponse) => {
      return lastPage.continuation_token;
    },
  });
};

interface CreateNewUserEventTypeRequest {
  eventType: string;
}

interface CreateNewUserEventTypeResponse {
  id: string;
}

export function useCreateNewUserEventTypeMutation({
  onMutate,
  onSuccess,
  onError,
}: {
  onMutate?: (request: CreateNewUserEventTypeRequest) => void;
  onSuccess?:
    | ((
        data: CreateNewUserEventTypeResponse,
        variables: CreateNewUserEventTypeRequest,
        context: void | undefined,
      ) => unknown)
    | undefined;
  onError?: () => void;
} = {}) {
  const axiosClient = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const { eventType } = data;
      const url = `/v1/user-event-hub/authorized/UserEventTypes/CreateUserEventType`;
      const axioResponse = await axiosClient.post<
        unknown,
        AxiosResponse<
          | ApiSuccessResponseTemplate<CreateNewUserEventTypeResponse>
          | ApiErrorResponseTemplate
        >,
        CreateNewUserEventTypeRequest
      >(
        url,
        { eventType: eventType },
        {
          baseURL: import.meta.env.VITE_SLEEKFLOW_API_BASE_URL,
        },
      );

      const response = axioResponse.data;

      if (!response.success) {
        throw Error(response.message);
      }

      return response.data;
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: userEventKeys.getUserEventTypes._def,
      });
    },
    onMutate,
    onSuccess,
    onError,
  });
}

interface DeleteUserEventTypesRequest {
  ids: string[];
}

interface DeleteUserEventTypesResponse {}

export function useDeleteUserEventTypesMutation({
  onMutate,
  onSuccess,
  onError,
}: {
  onMutate?: (request: DeleteUserEventTypesRequest) => void;
  onSuccess?:
    | ((
        data: DeleteUserEventTypesResponse,
        variables: DeleteUserEventTypesRequest,
        context: void | undefined,
      ) => unknown)
    | undefined;
  onError?: () => void;
} = {}) {
  const axiosClient = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const { ids } = data;
      const url = `/v1/user-event-hub/authorized/UserEventTypes/DeleteUserEventTypes`;
      const response = await axiosClient.post<
        unknown,
        ApiSuccessResponseTemplate<DeleteUserEventTypesResponse>,
        DeleteUserEventTypesRequest
      >(
        url,
        { ids: ids },
        {
          baseURL: import.meta.env.VITE_SLEEKFLOW_API_BASE_URL,
        },
      );
      return response.data;
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: userEventKeys.getUserEventTypes._def,
      });
    },
    onMutate,
    onSuccess,
    onError,
  });
}

interface UpdateUserEventTypeRequest {
  id: string;
  updatedEventType: string;
}

interface UpdateUserEventTypeResponse {}

export function useUpdateUserEventTypeMutation({
  onMutate,
  onSuccess,
  onError,
}: {
  onMutate?: (request: UpdateUserEventTypeRequest) => void;
  onSuccess?:
    | ((
        data: UpdateUserEventTypeResponse,
        variables: UpdateUserEventTypeRequest,
        context: void | undefined,
      ) => unknown)
    | undefined;
  onError?: () => void;
} = {}) {
  const axiosClient = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const { id, updatedEventType } = data;
      const url = `/v1/user-event-hub/authorized/UserEventTypes/UpdateUserEventType`;
      const axioResponse = await axiosClient.post<
        unknown,
        AxiosResponse<
          | ApiSuccessResponseTemplate<UpdateUserEventTypeResponse>
          | ApiErrorResponseTemplate
        >,
        UpdateUserEventTypeRequest
      >(
        url,
        { id: id, updatedEventType: updatedEventType },
        {
          baseURL: import.meta.env.VITE_SLEEKFLOW_API_BASE_URL,
        },
      );

      const response = axioResponse.data;

      if (!response.success) {
        throw Error(response.message);
      }

      return response.data;
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: userEventKeys.getUserEventTypes._def,
      });
    },
    onMutate,
    onSuccess,
    onError,
  });
}
