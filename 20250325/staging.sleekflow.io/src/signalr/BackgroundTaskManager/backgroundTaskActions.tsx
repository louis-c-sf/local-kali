import {
  Box,
  Button,
  CircularProgress,
  circularProgressClasses,
  CircularProgressProps,
  IconButton,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

import {
  useBackgroundTaskDismissMutation,
  useReEnqueueBackgroundTask,
} from '@/api/backgroundTask';
import { BackgroundTaskStatus, BackgroundTaskType } from '@/api/types';
import Icon from '@/components/Icon';
import { invisibleLinkClickDownload } from '@/pages/Contacts/shared/utils';
import {
  BackgroundTasksResponse,
  FakeBackgroundTaskType,
  useBackgroundTaskStore,
} from '@/signalr/BackgroundTaskManager/useBackgroundTaskStore';
import { testIds } from '@/playwright/lib/test-ids';

export const CompletedIcon = () => {
  return (
    <Icon
      icon="check-single"
      sx={{
        color: (theme) => theme.palette.forest[90],
      }}
      size={20}
    />
  );
};

export const TaskLoadingIcon = ({
  value,
  variant = 'determinate',
}: {
  value?: number;
  variant?: CircularProgressProps['variant'];
}) => {
  return (
    <Box sx={{ position: 'relative' }}>
      <CircularProgress
        variant="determinate"
        sx={{
          color: (theme) => theme.palette.gray[30],
        }}
        size={20}
        thickness={5}
        value={100}
      />
      <CircularProgress
        variant={variant}
        disableShrink
        sx={{
          position: 'absolute',
          left: 0,
          [`& .${circularProgressClasses.circle}`]: {
            strokeLinecap: 'round',
          },
        }}
        size={20}
        thickness={5}
        value={value}
      />
    </Box>
  );
};

export const DownloadButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <IconButton
      onClick={onClick}
      sx={{
        '&.MuiIconButton-root:hover': {
          border: '2.5px solid',
          borderColor: 'darkBlue.40',
          borderRadius: '500px',
          backgroundColor: 'darkBlue.60',
        },
        '&.MuiIconButton-root:focus': {
          border: '2.5px solid',
          borderColor: 'darkBlue.40',
          borderRadius: '500px',
          backgroundColor: 'darkBlue.60',
        },
        border: '2px solid',
        borderColor: 'darkBlue.40',
        borderRadius: '500px',
        bgcolor: 'darkBlue.60',
        width: 28,
        height: 28,
      }}
    >
      <Icon
        icon="download"
        sx={{
          color: 'white',
        }}
        size={20}
      />
    </IconButton>
  );
};

export const BackgroundTaskDismissBar = ({
  backgroundTasks,
}: {
  backgroundTasks: BackgroundTasksResponse[];
}) => {
  const backgroundTasksStore = useBackgroundTaskStore();
  const { t } = useTranslation();
  const dismissBackgroundTask = useBackgroundTaskDismissMutation({
    onSuccess: (data) => {
      backgroundTasksStore.removeTask({
        task: data,
      });
    },
  });

  return (
    <ListItem
      sx={{
        backgroundColor: 'gray.5',
        padding: '13px',
      }}
    >
      <ListItemText>
        <Typography>
          {t('background-tasks.completed-tasks-bar', {
            defaultValue: 'Completed {completedTasks} / {totalTasks} tasks',
            totalTasks: backgroundTasks.length,
            completedTasks: backgroundTasks.filter(
              (task) => task.taskStatus === BackgroundTaskStatus.Completed,
            ).length,
          })}
        </Typography>
      </ListItemText>
      <Button
        onClick={() => {
          backgroundTasks.forEach((task) => {
            if (task.taskStatus !== BackgroundTaskStatus.Completed) {
              return;
            }
            // dismiss real background tasks
            if (
              typeof task.taskType !== 'string' &&
              typeof task.id !== 'string'
            ) {
              return dismissBackgroundTask.mutate({
                backgroundTaskId: task.id,
              });
            }
            // dismiss fake background tasks
            return backgroundTasksStore.removeTask({
              task,
            });
          });
        }}
        data-testid={testIds.backgroundTaskManagerClearCompletedCta}
      >
        {t('background-tasks.clear-completed-button', {
          defaultValue: 'Clear completed',
        })}
      </Button>
    </ListItem>
  );
};

export const RetryBackgroundTask = ({
  task,
}: {
  task: BackgroundTasksResponse;
}) => {
  const backgroundTaskStore = useBackgroundTaskStore();
  const reEnqueueBackgroundTask = useReEnqueueBackgroundTask({
    onSuccess: (data) => {
      backgroundTaskStore.updateTask({ task: data });
    },
  });

  switch (task.taskType) {
    case FakeBackgroundTaskType.downloadMedia:
      return null;

    default:
      return (
        <Icon
          onClick={() => {
            reEnqueueBackgroundTask.mutate({ backgroundTaskId: task.id });
          }}
          sx={{ color: 'red.90', cursor: 'pointer' }}
          icon="refresh"
          size={20}
        />
      );
  }
};

export const BackgroundTaskActions = ({
  task,
}: {
  task: BackgroundTasksResponse;
}) => {
  switch (task.taskType) {
    case BackgroundTaskType.ExportContactsListToCsv: {
      const taskUrl = task.result?.url;
      if (taskUrl) {
        return (
          <DownloadButton
            onClick={() => invisibleLinkClickDownload(taskUrl, [])}
          />
        );
      }
      return null;
    }
    case BackgroundTaskType.ExportAnalyticToCsv: {
      const taskUrl = task.result?.url;
      if (taskUrl) {
        return (
          <DownloadButton
            onClick={() => invisibleLinkClickDownload(taskUrl, [])}
          />
        );
      }
      return null;
    }
    case BackgroundTaskType.ExportAnalyticRevampToCsv: {
      const taskUrl = task.result?.url;
      if (taskUrl) {
        return (
          <DownloadButton
            onClick={() => invisibleLinkClickDownload(taskUrl, [])}
          />
        );
      }
      return null;
    }
    case BackgroundTaskType.ExportBroadcastStatusListToCsv: {
      const taskUrl = task.result?.url;
      if (taskUrl) {
        return (
          <DownloadButton
            onClick={() => invisibleLinkClickDownload(taskUrl, [])}
          />
        );
      }
      return null;
    }
    case BackgroundTaskType.ExportFlowUsageCsv: {
      const taskUrl = task.result?.url;
      if (taskUrl) {
        return (
          <DownloadButton
            onClick={() => invisibleLinkClickDownload(taskUrl, [])}
          />
        );
      }
      return null;
    }
    case BackgroundTaskType.ExportTicketCsv: {
      const taskUrl = task.result?.url;
      if (taskUrl) {
        return (
          <DownloadButton
            onClick={() => invisibleLinkClickDownload(taskUrl, [])}
          />
        );
      }
      return null;
    }
    default:
      return null;
  }
};
