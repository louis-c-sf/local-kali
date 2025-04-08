import { useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useEffect } from 'react';

import { useCompany } from '@/api/company';
import {
  intelligentHubKeys,
  useGetFileDocListQuery,
  useGetProcessFileDocumentStatusMutation,
} from '@/api/intelligentHub';
import { BackgroundTaskStatus } from '@/api/types';
import { PERMISSION_KEY } from '@/constants/permissions';
import { useAISettingsRoleBasedAccessControl } from '@/pages/AiSettings/hooks/useAISettingsRoleBasedAccessControl';
import { useBackgroundTaskManagerState } from '@/signalr/BackgroundTaskManager/BackgroundTaskManager';
import {
  FakeBackgroundTaskResponseType,
  useBackgroundTaskStore,
} from '@/signalr/BackgroundTaskManager/useBackgroundTaskStore';
import { usePermissionWrapper } from './usePermission';

const useAIStatusLongPolling = () => {
  const { check, isLoading: isPermissionLoading } = usePermissionWrapper();
  const { canViewAISettings } = useAISettingsRoleBasedAccessControl();
  const [canAccessAiSettings] = check(
    [PERMISSION_KEY.aiView],
    [canViewAISettings],
  );
  const isPermissionValid = canAccessAiSettings && !isPermissionLoading;

  const backgroundTasks = useBackgroundTaskStore();
  const openBackgroundTaskManager = useBackgroundTaskManagerState(
    ({ open }) => open,
  );
  const companyId = useCompany({
    select: (company) => company.id,
  });
  const fileDocList = useGetFileDocListQuery({
    enabled: !!companyId.data && isPermissionValid,
    companyId: companyId.data!,
    select: (data) =>
      data.file_document_infos.filter(
        (file) =>
          file.training_status === 'processing' ||
          file.training_status === 'pending',
      ),
    throwOnError: false,
  });
  // FIXME: change to useQueries when RQ is updated to v5
  const statusPolling = useGetProcessFileDocumentStatusMutation();
  const queryClient = useQueryClient();

  const handleStatusPolling = async () => {
    const promisedMutation = (fileDocList.data || []).map((file) =>
      statusPolling.mutateAsync({
        companyId: companyId.data!,
        documentId: file.document_id,
      }),
    );
    (await Promise.allSettled(promisedMutation)).forEach((result) => {
      if (result.status === 'fulfilled') {
        const task: FakeBackgroundTaskResponseType = {
          id: result.value.document_id,
          taskType: 'AI_FILE_PROCESSING',
          total: 1,
          name:
            fileDocList.data?.find(
              (file) => file.document_id === result.value.document_id,
            )?.file_name || '',
          companyId: '',
          updatedAt: dayjs().toISOString(),
          createdAt: dayjs().toISOString(),
          progress: 0,
          isCompleted: false,
          isDismissed: false,
          completedAt: null,
          startedAt: null,
          errorMessage: null,
          taskStatus: BackgroundTaskStatus.Queued,
        };

        switch (result.value.file_document_process_status) {
          case 'pending':
            backgroundTasks.updateTask(
              {
                task,
              },
              {
                onAddNew: () => {
                  openBackgroundTaskManager();
                },
              },
            );
            break;
          case 'processing':
            backgroundTasks.updateTask(
              {
                task: {
                  ...task,
                  taskStatus: BackgroundTaskStatus.Processing,
                },
              },
              {
                onAddNew: () => {
                  openBackgroundTaskManager();
                },
              },
            );
            break;
          case 'completed':
            backgroundTasks.updateTask({
              task: {
                ...task,
                isCompleted: true,
                completedAt: dayjs().toISOString(),
                taskStatus: BackgroundTaskStatus.Completed,
              },
            });
            queryClient.invalidateQueries({
              queryKey: intelligentHubKeys.getFileDocList,
            });
            break;
        }
      }
    });
  };

  // Refetch status every 10 seconds
  useEffect(() => {
    const hasValidFiles = (fileDocList.data || []).length > 0;
    const shouldPoll = hasValidFiles && isPermissionValid;

    let interval: NodeJS.Timeout | null = null;
    if (shouldPoll) {
      handleStatusPolling();
      interval = setInterval(() => {
        if (hasValidFiles) {
          handleStatusPolling();
        }
      }, 1000 * 10);
    }

    if (!shouldPoll && !!interval) {
      clearInterval(interval);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileDocList.data, isPermissionValid]);
};

export default useAIStatusLongPolling;
