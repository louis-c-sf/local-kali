import { createQueryKeys } from '@lukemorales/query-key-factory';
import { useMutation, useQuery } from '@tanstack/react-query';

import { useAxios } from '@/api/axiosClient';
import {
  BackgroundTaskResponseTypeFromApi,
  BackgroundTaskType,
} from '@/api/types';

type BackgroundTaskParams = {
  backgroundTaskId: number | string;
};

type getBackgroundTaskListParams = {
  params?: {
    offset?: number;
    limit?: number;
    isCompleted?: boolean;
    isDismissed?: boolean;
  };
  staleTime?: number;
  gcTime?: number;
};

export const backgroundTasksKeys = createQueryKeys('backgroundTasks', {
  // custom query key for background task manager (manages mix of client side state and serverside)
  backgroundTaskManager: null,
  getBackgroundTaskList: ({
    offset,
    limit,
    isCompleted,
    isDismissed,
  }: getBackgroundTaskListParams['params'] = {}) => [
    {
      offset,
      limit,
      isCompleted,
      isDismissed,
    },
  ],
});

export const useReEnqueueBackgroundTask = (options?: {
  onSuccess?:
    | ((
        data: BackgroundTaskResponseTypeFromApi,
        variables: BackgroundTaskParams,
        context: unknown,
      ) => unknown)
    | undefined;
  onMutate?: ((variables: BackgroundTaskParams) => unknown) | undefined;
}) => {
  const axiosClient = useAxios();
  return useMutation({
    mutationFn: async ({ backgroundTaskId }: BackgroundTaskParams) => {
      const resp = await axiosClient.post<BackgroundTaskResponseTypeFromApi>(
        `/background-task/${backgroundTaskId}/re-enqueue`,
      );
      return resp.data;
    },
    onMutate: options?.onMutate,
    onSuccess: options?.onSuccess,
  });
};

export const useBackgroundTaskDismissMutation = ({
  onSuccess,
}: {
  onSuccess?:
    | ((
        data: BackgroundTaskResponseTypeFromApi,
        variables: BackgroundTaskParams,
        context: unknown,
      ) => unknown)
    | undefined;
} = {}) => {
  const url = '/background-task/dismiss';
  const axiosClient = useAxios();

  return useMutation({
    mutationFn: async ({ backgroundTaskId }: BackgroundTaskParams) => {
      const resp = await axiosClient.post<BackgroundTaskResponseTypeFromApi>(
        url,
        {
          backgroundTaskId,
        },
      );
      return resp.data;
    },
    onSuccess,
  });
};

export const useBackgroundTaskListQuery = (
  props: getBackgroundTaskListParams,
) => {
  const url = '/background-task/list';
  const axiosClient = useAxios();

  return useQuery({
    staleTime: props?.staleTime,
    gcTime: props?.gcTime,
    queryKey: backgroundTasksKeys.getBackgroundTaskList({
      offset: props.params?.offset,
      limit: props.params?.limit,
      isCompleted: props.params?.isCompleted,
      isDismissed: props.params?.isDismissed,
    }),
    queryFn: async ({ signal }) => {
      const resp = await axiosClient.get<BackgroundTaskResponseTypeFromApi[]>(
        url,
        {
          signal,
          params: {
            offset: props.params?.offset,
            limit: props.params?.limit,
            isCompleted: props.params?.isCompleted,
            isDismissed: props.params?.isDismissed,
          },
        },
      );

      //Loop through background task will be handled by another api, filter out this task type here to avoid crash
      const filteredData = resp.data.filter(
        (resp) =>
          resp.taskType !== BackgroundTaskType.LoopThroughSleekflowContact,
      );

      return filteredData;
    },
  });
};
