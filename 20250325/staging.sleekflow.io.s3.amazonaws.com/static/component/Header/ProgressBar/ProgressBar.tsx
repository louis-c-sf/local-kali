import React, { useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import useRouteConfig from "../../../config/useRouteConfig";
import { Image, Loader, Progress } from "semantic-ui-react";
import { adjust } from "ramda";
import { useTranslation } from "react-i18next";
import { useSignalRGroup } from "../../SignalR/useSignalRGroup";
import { useAppSelector } from "../../../AppRootContext";
import { getWithExceptions, post } from "../../../api/apiRequest";
import {
  GET_BACKGROUND_LIST,
  POST_BACKGROUND_TASK_DISMISS,
} from "../../../api/apiPath";
import {
  NewContactListTargetFieldType,
  NormalTargetFieldType,
  TargetTypeEnum,
  TaskResponseType,
  TaskStatusEnum,
  TaskTypeEnum,
} from "./types/TaskType";
import Tick from "../../../assets/images/icons/tick-white.svg";
import Cross from "../../../assets/images/ui/cross-lg-white.svg";
import iconStyles from "../../shared/Icon/Icon.module.css";
import styles from "./ProgressBar.module.css";

export const ProgressBar = () => {
  const signalRGroupName = useAppSelector((s) => s.user?.signalRGroupName);
  const { t } = useTranslation();
  const history = useHistory();
  const { routeTo } = useRouteConfig();

  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<TaskResponseType[]>([]);
  const listRef = useRef<TaskResponseType[]>([]);
  const [index, setIndex] = useState<number>(0);
  const taskData = list[index];
  const taskId = taskData?.id ?? -1;
  const percentage = taskData?.progress ?? 0;
  const isCompleted = percentage === 100 && taskData?.isCompleted;
  const taskType = taskData?.taskType ?? 0;
  const taskStatus = taskData?.taskStatus ?? TaskStatusEnum.Processing;
  const targetData = taskData?.target ?? undefined;
  const getFileName = () => {
    if (!targetData) {
      return undefined;
    }
    if (targetData.targetType === TargetTypeEnum.Campaign) {
      return targetData?.templateName;
    } else if (
      targetData.targetType === TargetTypeEnum.List &&
      taskType === 40
    ) {
      return (targetData as NewContactListTargetFieldType)?.newContactListName;
    } else {
      return (targetData as NormalTargetFieldType)?.importName;
    }
  };
  const total = taskData?.total ?? 0;
  const totalTask = list.length;

  const importStatusesMap = {
    [TaskStatusEnum.Queued]: t(
      "progressBar.content.importContacts.processing",
      { fileName: getFileName() }
    ),
    [TaskStatusEnum.Started]: t(
      "progressBar.content.importContacts.processing",
      { fileName: getFileName() }
    ),
    [TaskStatusEnum.Processing]: t(
      "progressBar.content.importContacts.processing",
      { fileName: getFileName() }
    ),
    [TaskStatusEnum.Completed]: t(
      "progressBar.content.importContacts.completed",
      { fileName: getFileName() }
    ),
    [TaskStatusEnum.Error]: t("progressBar.common.errorContent", {
      taskName: t("progressBar.content.importContacts.processing", {
        fileName: getFileName(),
      }),
    }),
  };

  const contentMapping = {
    [TaskTypeEnum.AddContactsToList]: {
      [TaskStatusEnum.Queued]: t(
        "progressBar.content.addContactsToList.processing",
        { count: total, fileName: getFileName() }
      ),
      [TaskStatusEnum.Started]: t(
        "progressBar.content.addContactsToList.processing",
        { count: total, fileName: getFileName() }
      ),
      [TaskStatusEnum.Processing]: t(
        "progressBar.content.addContactsToList.processing",
        { count: total, fileName: getFileName() }
      ),
      [TaskStatusEnum.Completed]: t(
        "progressBar.content.addContactsToList.completed",
        { count: total, fileName: getFileName() }
      ),
      [TaskStatusEnum.Error]: t("progressBar.common.errorContent", {
        taskName: t("progressBar.content.addContactsToList.processing", {
          count: total,
          fileName: getFileName(),
        }),
      }),
    },
    [TaskTypeEnum.ImportWhatsAppHistoryOmnichat]: {
      [TaskStatusEnum.Queued]: t(
        "progressBar.content.importContacts.processing",
        { fileName: getFileName() }
      ),
      [TaskStatusEnum.Started]: t(
        "progressBar.content.importContacts.processing",
        { fileName: getFileName() }
      ),
      [TaskStatusEnum.Processing]: t(
        "progressBar.content.importContacts.processing",
        { fileName: getFileName() }
      ),
      [TaskStatusEnum.Completed]: t(
        "progressBar.content.importContacts.completed",
        { fileName: getFileName() }
      ),
      [TaskStatusEnum.Error]: t("progressBar.common.errorContent", {
        taskName: t("progressBar.content.importContacts.processing", {
          fileName: getFileName(),
        }),
      }),
    },
    [TaskTypeEnum.ImportContacts]: importStatusesMap,
    [TaskTypeEnum.BulkImportContacts]: importStatusesMap,
    [TaskTypeEnum.BulkUpdateContactsCustomFields]: {
      [TaskStatusEnum.Queued]: t(
        "progressBar.content.bulkUpdateContactsCustomFields.processing",
        { count: total }
      ),
      [TaskStatusEnum.Started]: t(
        "progressBar.content.bulkUpdateContactsCustomFields.processing",
        { count: total }
      ),
      [TaskStatusEnum.Processing]: t(
        "progressBar.content.bulkUpdateContactsCustomFields.processing",
        { count: total }
      ),
      [TaskStatusEnum.Completed]: t(
        "progressBar.content.bulkUpdateContactsCustomFields.completed",
        { count: total }
      ),
      [TaskStatusEnum.Error]: t("progressBar.common.errorContent", {
        taskName: t(
          "progressBar.content.bulkUpdateContactsCustomFields.processing",
          { count: total }
        ),
      }),
    },
    [TaskTypeEnum.ExportContactsListToCsv]: {
      [TaskStatusEnum.Queued]: t(
        "progressBar.content.exportContactsListToCsv.processing",
        { fileName: getFileName() }
      ),
      [TaskStatusEnum.Started]: t(
        "progressBar.content.exportContactsListToCsv.processing",
        { fileName: getFileName() }
      ),
      [TaskStatusEnum.Processing]: t(
        "progressBar.content.exportContactsListToCsv.processing",
        { fileName: getFileName() }
      ),
      [TaskStatusEnum.Completed]: t(
        "progressBar.content.exportContactsListToCsv.completed",
        { fileName: getFileName() }
      ),
      [TaskStatusEnum.Error]: t("progressBar.common.errorContent", {
        taskName: t("progressBar.content.exportContactsListToCsv.processing", {
          fileName: getFileName(),
        }),
      }),
    },
    [TaskTypeEnum.ExportAnalyticToCsv]: {
      [TaskStatusEnum.Queued]: t(
        "progressBar.content.exportAnalyticToCsv.processing"
      ),
      [TaskStatusEnum.Started]: t(
        "progressBar.content.exportAnalyticToCsv.processing"
      ),
      [TaskStatusEnum.Processing]: t(
        "progressBar.content.exportAnalyticToCsv.processing"
      ),
      [TaskStatusEnum.Completed]: t(
        "progressBar.content.exportAnalyticToCsv.completed"
      ),
      [TaskStatusEnum.Error]: t("progressBar.common.errorContent", {
        taskName: t("progressBar.content.exportAnalyticToCsv.processing"),
      }),
    },
    [TaskTypeEnum.ExportBroadcastStatusListToCsv]: {
      [TaskStatusEnum.Queued]: t(
        "progressBar.content.exportContactsListToCsv.processing",
        { fileName: getFileName() }
      ),
      [TaskStatusEnum.Started]: t(
        "progressBar.content.exportContactsListToCsv.processing",
        { fileName: getFileName() }
      ),
      [TaskStatusEnum.Processing]: t(
        "progressBar.content.exportContactsListToCsv.processing",
        { fileName: getFileName() }
      ),
      [TaskStatusEnum.Completed]: t(
        "progressBar.content.exportContactsListToCsv.completed",
        { fileName: getFileName() }
      ),
      [TaskStatusEnum.Error]: t("progressBar.common.errorContent", {
        taskName: t("progressBar.content.exportContactsListToCsv.processing", {
          fileName: getFileName(),
        }),
      }),
    },
    [TaskTypeEnum.ImportWhatsAppHistory]: {
      [TaskStatusEnum.Queued]: t(
        "progressBar.content.importWhatsAppHistory.processing",
        { count: total }
      ),
      [TaskStatusEnum.Started]: t(
        "progressBar.content.importWhatsAppHistory.processing",
        { count: total }
      ),
      [TaskStatusEnum.Processing]: t(
        "progressBar.content.importWhatsAppHistory.processing",
        { count: total }
      ),
      [TaskStatusEnum.Completed]: t(
        "progressBar.content.importWhatsAppHistory.completed",
        { count: total }
      ),
      [TaskStatusEnum.Error]: t("progressBar.common.errorContent", {
        taskName: t("progressBar.content.importWhatsAppHistory.processing", {
          count: total,
        }),
      }),
    },
    [TaskTypeEnum.ConvertCampaignLeadsToContactList]: {
      [TaskStatusEnum.Queued]: t(
        "progressBar.content.convertCampaignLeadsToContactList.processing",
        { listName: getFileName() }
      ),
      [TaskStatusEnum.Started]: t(
        "progressBar.content.convertCampaignLeadsToContactList.processing",
        { listName: getFileName() }
      ),
      [TaskStatusEnum.Processing]: t(
        "progressBar.content.convertCampaignLeadsToContactList.processing",
        { listName: getFileName() }
      ),
      [TaskStatusEnum.Completed]: t(
        "progressBar.content.convertCampaignLeadsToContactList.completed",
        { listName: getFileName(), count: total }
      ),
      [TaskStatusEnum.Error]: t("progressBar.common.errorContent", {
        taskName: t(
          "progressBar.content.convertCampaignLeadsToContactList.processing",
          {
            listName: getFileName(),
          }
        ),
      }),
    },
  };

  async function getTaskList(isMount?: boolean) {
    try {
      if (isMount || isMount === undefined) {
        setLoading(true);
        const list: TaskResponseType[] = await getWithExceptions(
          GET_BACKGROUND_LIST,
          {
            param: {
              isDismissed: false,
            },
          }
        );
        setList(list.length > 0 ? list : []);
      }
    } catch (e) {
      console.error("getTaskList error: ", e);
    } finally {
      setLoading(false);
    }
  }

  async function handleDismiss() {
    try {
      await post(POST_BACKGROUND_TASK_DISMISS, {
        param: {
          backgroundTaskId: taskId,
        },
      });
      refreshList();
    } catch (e) {
      console.error(`handleDismiss error ${e}`);
    }
  }

  const handleClickView = () => {
    if (targetData?.targetType === TargetTypeEnum.List) {
      history.push(
        routeTo(
          `/contacts/lists/${(targetData as NormalTargetFieldType).listId}`
        )
      );
    }
  };

  const refreshList = () => {
    getTaskList();
    setIndex(0);
  };

  useSignalRGroup(
    signalRGroupName,
    {
      OnBackgroundTaskStatusChange: [
        (state, task: TaskResponseType) => {
          const newList = listRef.current.map((row) => ({ ...row }));
          const existed = listRef.current.findIndex((row) => {
            return row.id === task.id;
          });

          setList(() => {
            return existed === -1
              ? [task, ...newList]
              : adjust(existed, (l) => ({ ...l, ...task }), newList);
          });
        },
      ],
    },
    "ProgressBar"
  );

  useEffect(() => {
    let isMount = true;
    getTaskList(isMount);
    return () => {
      isMount = false;
    };
  }, []);

  listRef.current = list;

  if (
    list.length === 0 ||
    [
      TaskTypeEnum.LoopThroughSleekflowContact,
      TaskTypeEnum.exportFlowUsageCsv,
    ].indexOf(taskType) > -1
  ) {
    return null;
  }

  const content = list.length > 0 ? contentMapping[taskType]?.[taskStatus] : "";
  const showViewButton =
    (taskType === TaskTypeEnum.AddContactsToList ||
      taskType === TaskTypeEnum.ImportContacts) &&
    taskStatus === TaskStatusEnum.Completed;
  const showDownloadButton =
    (taskType === TaskTypeEnum.ExportAnalyticToCsv ||
      taskType === TaskTypeEnum.ExportContactsListToCsv ||
      taskType === TaskTypeEnum.ExportBroadcastStatusListToCsv) &&
    taskStatus === TaskStatusEnum.Completed;

  return (
    <div>
      {loading ? (
        <Loader
          className={styles.loader}
          active
          inline="centered"
          size="mini"
        />
      ) : (
        <Progress
          id="background-task-bar"
          percent={percentage}
          active={!isCompleted}
          className={`${styles.container} ${isCompleted ? styles.success : ""}`}
        >
          <div className={styles.content}>
            {taskStatus === TaskStatusEnum.Completed && <Image src={Tick} />}
            {content}
            {showViewButton && (
              <span className={styles.view} onClick={handleClickView}>
                {t("form.button.view")}
              </span>
            )}
            {showDownloadButton &&
              targetData?.targetType &&
              [
                TargetTypeEnum.List,
                TargetTypeEnum.Analytic,
                TargetTypeEnum.Campaign,
              ].includes(targetData.targetType) &&
              taskData?.result?.url && (
                <a className={styles.view} href={taskData?.result?.url}>
                  {t("form.button.download")}
                </a>
              )}
            <div className={styles.rightBlock}>
              <div className={styles.stepContainer}>
                {0 !== index && (
                  <div
                    className={styles.arrowIconContainer}
                    onClick={() => {
                      setIndex((prev) => Math.max(0, prev - 1));
                    }}
                  >
                    <span
                      className={`${iconStyles.icon} ${styles.arrowIcon}`}
                    />
                  </div>
                )}
                <span>
                  {t("progressBar.common.inProgress", {
                    currentIndex: index + 1,
                    totalIndex: totalTask,
                  })}
                </span>
                {index !== totalTask - 1 && (
                  <div
                    className={styles.arrowIconContainer}
                    onClick={() => {
                      setIndex((prev) => {
                        const lastIndex = totalTask - 1;
                        if (prev !== lastIndex) {
                          return ++prev;
                        } else {
                          return lastIndex;
                        }
                      });
                    }}
                  >
                    <span
                      className={`${iconStyles.icon} ${styles.arrowIcon}`}
                    />
                  </div>
                )}
              </div>
              <span>
                {t("progressBar.common.completed", {
                  count: list.filter((c) => c.isCompleted).length,
                })}
              </span>
              {taskStatus === TaskStatusEnum.Completed && (
                <Image
                  className={styles.closeIcon}
                  src={Cross}
                  onClick={handleDismiss}
                />
              )}
            </div>
          </div>
        </Progress>
      )}
    </div>
  );
};
