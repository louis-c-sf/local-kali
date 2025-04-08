import { useQuery, useQueryClient } from '@tanstack/react-query';

import { useAxios } from '@/api/axiosClient';
import { backgroundTasksKeys } from '@/api/backgroundTask';
import {
  BackgroundTaskResponseTypeFromApi,
  BackgroundTaskStatus,
  BackgroundTaskType,
} from '@/api/types';

export const FakeBackgroundTaskType = {
  downloadMedia: 'DOWNLOAD_MEDIA',
  exportBillingAnalyticsToCsv: 'EXPORT_BILLING_ANALYTICS_TO_CSV',
  aiFileProcessing: 'AI_FILE_PROCESSING',
} as const;
type FakeBackgroundTaskType =
  (typeof FakeBackgroundTaskType)[keyof typeof FakeBackgroundTaskType];
// TODO: fake background task response type eg. download media
export type FakeBackgroundTaskResponseType = Omit<
  BackgroundTaskResponseTypeFromApi,
  'id' | 'taskType' | 'staffId' | 'userId' | 'target'
> & {
  // id should be a unique identifier for the task eg. uuid
  id: string;
  name?: string;
  taskType: FakeBackgroundTaskType;
};

export type BackgroundTasksResponse =
  | BackgroundTaskResponseTypeFromApi
  | FakeBackgroundTaskResponseType;

export const useBackgroundTaskStore = () => {
  const queryClient = useQueryClient();
  const axiosClient = useAxios();
  /* HACK: because we have some fake background tasks that is from client side state,
   * we need to use a custom query key and set cache to no expire */
  const backgroundTasks = useQuery({
    staleTime: Infinity,
    gcTime: Infinity,
    queryKey: backgroundTasksKeys.backgroundTaskManager,
    queryFn: async ({ signal }) => {
      const resp = await axiosClient.get<BackgroundTaskResponseTypeFromApi[]>(
        '/background-task/list',
        {
          signal,
          params: {
            isDismissed: false,
          },
        },
      );
      return resp.data;
    },
    select: (data) => {
      return (data as BackgroundTasksResponse[]).filter(
        (d) => d.taskType !== BackgroundTaskType.LoopThroughSleekflowContact,
      );
    },
    throwOnError: false,
  });
  const updateTask = (
    data: {
      task: BackgroundTasksResponse;
    },
    options?: {
      onAddNew?: ({ task }: { task: BackgroundTasksResponse }) => void;
      onUpdate?: ({ task }: { task: BackgroundTasksResponse }) => void;
      onSettled?: ({ task }: { task: BackgroundTasksResponse }) => void;
      onError?: ({ task }: { task: BackgroundTasksResponse }) => void;
      onSuccess?: ({ task }: { task: BackgroundTasksResponse }) => void;
    },
  ) => {
    queryClient.setQueryData<BackgroundTasksResponse[]>(
      backgroundTasksKeys.backgroundTaskManager,
      (oldData) => {
        if (oldData) {
          const indexOfItem = oldData.findIndex((t) => t.id === data.task.id);
          if (options?.onUpdate) {
            options.onUpdate({ task: data.task });
          }

          if (
            options?.onSettled &&
            (data.task.taskStatus === BackgroundTaskStatus.Completed ||
              data.task.taskStatus === BackgroundTaskStatus.Error)
          ) {
            options.onSettled({ task: data.task });
          }

          if (
            options?.onError &&
            data.task.taskStatus === BackgroundTaskStatus.Error
          ) {
            options.onError({ task: data.task });
          }

          if (
            options?.onSuccess &&
            data.task.taskStatus === BackgroundTaskStatus.Completed
          ) {
            options.onSuccess({ task: data.task });
          }

          // Add as new task if not found
          if (indexOfItem === -1) {
            if (options?.onAddNew) {
              options.onAddNew({ task: data.task });
            }
            // Put tasks at start of list so it shows on top
            return [data.task, ...oldData];
          }

          // update existing task
          return [
            ...oldData.slice(0, indexOfItem),
            data.task,
            ...oldData.slice(indexOfItem + 1),
          ];
        }
        return oldData;
      },
    );
  };

  const removeTask = (
    data: {
      task: BackgroundTasksResponse;
    },
    options?: {
      onRemove?: ({ task }: { task: BackgroundTasksResponse }) => void;
    },
  ) => {
    if (options?.onRemove) {
      options.onRemove({ task: data.task });
    }

    queryClient.setQueryData<BackgroundTasksResponse[]>(
      backgroundTasksKeys.backgroundTaskManager,
      (oldData) => {
        if (oldData) {
          return oldData.filter((t) => t.id !== data.task.id);
        }
        return oldData;
      },
    );
  };

  return {
    backgroundTasks,
    updateTask,
    removeTask,
  };
};
