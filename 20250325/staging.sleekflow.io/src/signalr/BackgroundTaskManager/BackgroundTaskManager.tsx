import {
  Box,
  Collapse,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Popover,
  Stack,
  Typography,
} from '@mui/material';
import { createRef, MutableRefObject } from 'react';
import { useTranslation } from 'react-i18next';
import { TransitionGroup } from 'react-transition-group';
import { create } from 'zustand';

import {
  BackgroundTaskResponseTypeFromApi,
  BackgroundTaskStatus,
  BackgroundTaskType,
} from '@/api/types';
import Icon from '@/components/Icon';
import { ScrollArea } from '@/components/ScrollArea';
import { STANDARD_SIGNALR_EVENTS, useSignalREffect } from '@/signalr/';
import { useBackgroundTaskStore } from '@/signalr/BackgroundTaskManager/useBackgroundTaskStore';
import useBackgroundTasksUtils from '@/signalr/BackgroundTaskManager/useBackgroundTasksUtils';

import {
  BackgroundTaskActions,
  BackgroundTaskDismissBar,
  CompletedIcon,
  RetryBackgroundTask,
  TaskLoadingIcon,
} from './backgroundTaskActions';
import { NavMenuItemToolTip } from '@/components/Navbar/NavMenuItemTooltip';
import { testIds } from '@/playwright/lib/test-ids';

const getCSSByTaskStatus = (
  taskStatus: BackgroundTaskStatus,
  css: {
    [BackgroundTaskStatus.Error]?: string;
    [BackgroundTaskStatus.Completed]?: string;
    [BackgroundTaskStatus.Processing]: string;
    [BackgroundTaskStatus.Started]?: string;
    [BackgroundTaskStatus.Queued]?: string;
  },
) => {
  return css[taskStatus] || css[BackgroundTaskStatus.Processing];
};

export const useBackgroundTaskManagerState = create<{
  anchorRef: MutableRefObject<HTMLButtonElement | null>;
  open: () => void;
  close: () => void;
  anchorEl: HTMLElement | null;
}>((set) => ({
  anchorRef: createRef<HTMLButtonElement>(),
  open: () => {
    set((state) => ({ anchorEl: state.anchorRef.current }));
  },
  close: () => {
    set({ anchorEl: null });
  },
  anchorEl: null,
}));

function getTaskTypeCode(taskType: number | string): string | undefined {
  const typeEntries = Object.entries(BackgroundTaskType);
  return typeEntries.find(([_, typeId]) => taskType === typeId)?.[0];
}

const BackgroundTaskManager = () => {
  const { t } = useTranslation();
  // const [open, setOpen] = useState(false);
  const backgroundTasksStore = useBackgroundTaskStore();
  const utils = useBackgroundTasksUtils();

  const isSomeTaskCompleted = backgroundTasksStore.backgroundTasks.data?.some(
    (task) => task.taskStatus === BackgroundTaskStatus.Completed,
  );
  const {
    anchorRef,
    anchorEl,
    open: openBackgroundTaskManger,
    close: closeBackgroundTaskManger,
  } = useBackgroundTaskManagerState(({ anchorRef, anchorEl, open, close }) => ({
    anchorRef,
    anchorEl,
    open,
    close,
  }));
  const open = Boolean(anchorEl);
  const isBackgroundTaskManagerHidden =
    !backgroundTasksStore.backgroundTasks.data ||
    backgroundTasksStore.backgroundTasks.data.length === 0;
  function handleAnchorClick() {
    openBackgroundTaskManger();
  }

  function handleAnchorClose() {
    closeBackgroundTaskManger();
  }

  useSignalREffect(
    STANDARD_SIGNALR_EVENTS.onBackgroundTaskStatusChange,
    (task: BackgroundTaskResponseTypeFromApi) => {
      backgroundTasksStore.updateTask(
        { task },
        {
          onSuccess: (data) => {
            utils.getBackgroundTaskSuccessActions({ task: data.task });
          },
          onAddNew: () => {
            openBackgroundTaskManger();
          },
          onSettled: (data) => {
            utils.getBackgroundTaskSettledActions({ task: data.task });
          },
        },
      );
    },
  );

  return (
    <>
      <NavMenuItemToolTip
        title={t('nav.background-tasks')}
        placement="right"
        enterDelay={100}
        enterNextDelay={100}
      >
        <ListItem
          ref={anchorRef}
          onClick={handleAnchorClick}
          component="button"
          disablePadding
          sx={{
            visibility: isBackgroundTaskManagerHidden ? 'hidden' : 'visible',
            border: 'none',
            cursor: 'pointer',
            color: open ? 'white' : 'gray.90',
            backgroundColor: open ? 'darkBlue.80' : 'transparent',
            padding: '8px 12px',
            borderRadius: '8px',
            width: 'auto',
            overflow: 'hidden',
            '&:hover': {
              backgroundColor: 'darkBlue.80',
              color: 'white',
            },
          }}
        >
          <Icon icon="activity" size={20} sx={{ flexShrink: 0 }} />
        </ListItem>
      </NavMenuItemToolTip>
      {!isBackgroundTaskManagerHidden && (
        <Popover
          data-testid={testIds.backgroundTaskManager}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          sx={{
            '&.MuiPopover-root .MuiPopover-paper': {
              marginLeft: '24px',
              background: 'transparent',
              boxShadow: '0px 8px 32px 2px hsla(216, 100%, 50%, 0.1)',
            },
            background: 'transparent',
          }}
          onClose={handleAnchorClose}
          open={open}
          anchorEl={anchorEl}
        >
          <Box
            sx={{
              borderRadius: '8px',
              display: 'flex',
              overflow: 'hidden',
              flexDirection: 'column',
              background: 'white',
              height:
                backgroundTasksStore.backgroundTasks.data!.length > 4
                  ? '324px'
                  : '100%',
              width: '360px',
            }}
          >
            <Box
              sx={{
                backgroundColor: 'darkBlue.70',
                width: '100%',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  padding: '13px',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Typography
                  sx={{
                    color: 'white',
                  }}
                >
                  {t('background-tasks.running-background-tasks')}
                </Typography>
                <IconButton
                  onClick={handleAnchorClose}
                  sx={{
                    '&.MuiButtonBase-root:hover': {
                      background: 'transparent',
                    },
                    '&.MuiButtonBase-root:focus': {
                      background: 'transparent',
                    },
                  }}
                >
                  <Icon icon="x-close" sx={{ color: 'white' }} size={20} />
                </IconButton>
              </Box>
            </Box>
            <ScrollArea>
              <List sx={{ padding: '0', height: '100%' }}>
                <TransitionGroup style={{ height: '100%' }}>
                  {isSomeTaskCompleted ? (
                    <BackgroundTaskDismissBar
                      backgroundTasks={
                        backgroundTasksStore.backgroundTasks.data!
                      }
                    />
                  ) : null}
                  {backgroundTasksStore.backgroundTasks.data!.map((task) => {
                    return (
                      <Collapse
                        key={task.id}
                        data-testid={testIds.backgroundTaskManagerTask(task.id)}
                        data-task-type={getTaskTypeCode(task.taskType)}
                      >
                        <ListItem
                          sx={{
                            backgroundColor: getCSSByTaskStatus(
                              task.taskStatus,
                              {
                                [BackgroundTaskStatus.Processing]:
                                  'transparent',
                                [BackgroundTaskStatus.Completed]: 'forest.5',
                                [BackgroundTaskStatus.Error]: 'red.5',
                              },
                            ),
                            padding: '13px',
                          }}
                        >
                          <ListItemText>
                            <Typography
                              sx={{
                                color: getCSSByTaskStatus(task.taskStatus, {
                                  [BackgroundTaskStatus.Processing]:
                                    'darkBlue.100',
                                  [BackgroundTaskStatus.Completed]: 'forest.90',
                                  [BackgroundTaskStatus.Error]: 'red.90',
                                }),
                              }}
                            >
                              {utils.getBackgroundTaskMessage(task)}
                            </Typography>
                          </ListItemText>
                          <Stack
                            direction="row"
                            spacing="16px"
                            alignItems="center"
                          >
                            <BackgroundTaskActions task={task} />
                            {task.taskStatus ===
                            BackgroundTaskStatus.Completed ? (
                              <CompletedIcon />
                            ) : task.taskStatus ===
                              BackgroundTaskStatus.Queued ? (
                              <TaskLoadingIcon variant="indeterminate" />
                            ) : task.taskStatus ===
                              BackgroundTaskStatus.Error ? (
                              <RetryBackgroundTask task={task} />
                            ) : (
                              <TaskLoadingIcon value={task.progress} />
                            )}
                          </Stack>
                        </ListItem>
                      </Collapse>
                    );
                  })}
                </TransitionGroup>
              </List>
            </ScrollArea>
          </Box>
        </Popover>
      )}
    </>
  );
};
export default BackgroundTaskManager;
