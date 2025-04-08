import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import {
  BackgroundTaskStatus,
  BackgroundTaskType,
  TargetType,
} from '@/api/types';
import { userProfileKeys } from '@/api/userProfile';
import { invisibleLinkClickDownload } from '@/pages/Contacts/shared/utils';
import {
  BackgroundTasksResponse,
  FakeBackgroundTaskType,
} from '@/signalr/BackgroundTaskManager/useBackgroundTaskStore';

const useBackgroundTasksUtils = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const getBackgroundTaskSettledActions = ({
    task,
  }: {
    task: BackgroundTasksResponse;
  }) => {
    // TODO: add query invalidations for diff background tasks + settled actions
    switch (task.taskType) {
      case BackgroundTaskType.BulkUpdateContactsCustomFields: {
        queryClient.invalidateQueries({
          queryKey: userProfileKeys._def,
        });
        break;
      }
      case BackgroundTaskType.AddContactsToList: {
        queryClient.invalidateQueries({
          queryKey: userProfileKeys._def,
        });

        break;
      }
      case BackgroundTaskType.ImportContacts: {
        queryClient.invalidateQueries({
          queryKey: userProfileKeys._def,
        });
        break;
      }
      default:
        break;
    }
  };

  const getBackgroundTaskSuccessActions = ({
    task,
  }: {
    task: BackgroundTasksResponse;
  }) => {
    switch (task.taskType) {
      case BackgroundTaskType.ExportContactsListToCsv: {
        // TODO; not sure if need to check user Id before executing download
        if (task.result) {
          invisibleLinkClickDownload(task.result.url, [
            {
              attribute: 'download',
              value: task.result.fileName,
            },
          ]);
        }
        break;
      }
      case BackgroundTaskType.ExportBroadcastStatusListToCsv: {
        if (task.result?.url) {
          invisibleLinkClickDownload(task.result.url, [
            {
              attribute: 'download',
              value: task.result.fileName,
            },
          ]);
        }
        break;
      }
      case BackgroundTaskType.ExportAnalyticToCsv: {
        if (task.result?.url) {
          invisibleLinkClickDownload(task.result.url, [
            {
              attribute: 'download',
              value: task.result.fileName,
            },
          ]);
        }
        break;
      }
      case BackgroundTaskType.ExportAnalyticRevampToCsv: {
        if (task.result?.url) {
          invisibleLinkClickDownload(task.result.url, [
            {
              attribute: 'download',
              value: task.result.fileName,
            },
          ]);
        }
        break;
      }
      case BackgroundTaskType.ExportFlowUsageCsv: {
        if (task.result?.url) {
          invisibleLinkClickDownload(task.result.url, [
            {
              attribute: 'download',
              value: task.result.fileName,
            },
          ]);
        }
        break;
      }
      case BackgroundTaskType.ExportTicketCsv: {
        if (task.result?.url) {
          invisibleLinkClickDownload(task.result.url, [
            {
              attribute: 'download',
              value: task.result.fileName,
            },
          ]);
        }
        break;
      }
    }
  };

  function exhaustiveGuard(_value: never): never {
    throw new Error(`${_value} is not a recognised task type`);
  }

  const getBackgroundTaskMessage = (task: BackgroundTasksResponse) => {
    const taskType = task.taskType;

    switch (taskType) {
      case BackgroundTaskType.BulkUpdateContactsCustomFields: {
        switch (task.taskStatus) {
          case BackgroundTaskStatus.Completed:
            return t('background-tasks.bulk-edit-contacts-update-success', {
              defaultValue: 'Updated {count} contacts',
              count: task.total,
            });
          case BackgroundTaskStatus.Error:
            return t('background-tasks.bulk-edit-contacts-update-error', {
              defaultValue: 'Failed to update {count} contacts',
              count: task.total,
            });
          default:
            return t('background-tasks.bulk-edit-contacts-update-in-progress', {
              defaultValue: 'Updating {count} contacts',
              count: task.total,
            });
        }
      }
      case FakeBackgroundTaskType.downloadMedia: {
        switch (task.taskStatus) {
          case BackgroundTaskStatus.Completed:
            return t('background-tasks.download-media-success', {
              count: task.total,
            });
          case BackgroundTaskStatus.Error:
            return t('background-tasks.download-media-error', {
              count: task.total,
            });
          default:
            return t('background-tasks.download-media-in-progress', {
              count: task.total,
            });
        }
      }
      case FakeBackgroundTaskType.exportBillingAnalyticsToCsv: {
        switch (task.taskStatus) {
          case BackgroundTaskStatus.Completed:
            return t('background-tasks.export-billing-analytics-success', {
              defaultValue: 'Exported conversation usage report',
              count: task.total,
            });
          case BackgroundTaskStatus.Error:
            return t(
              'background-tasks.failed-to-export-billing-analytics-error',
              {
                defaultValue: 'Failed to export conversation usage report',
                count: task.total,
              },
            );
          default:
            return t('background-tasks.export-billing-analytics-in-progress', {
              defaultValue: 'Exporting conversation usage report',
              count: task.total,
            });
        }
      }
      case BackgroundTaskType.AddContactsToList: {
        switch (task.taskStatus) {
          case BackgroundTaskStatus.Completed:
            return t('background-tasks.add-contacts-to-list-success', {
              defaultValue: 'Added {count} contacts to {listName}',
              listName:
                task.target.targetType === TargetType.List
                  ? (task.target?.importName ?? t('general.untitled-label'))
                  : t('general.untitled-label'),
              count: task.total,
            });

          case BackgroundTaskStatus.Error:
            return t('background-tasks.add-contacts-to-list-error', {
              defaultValue: 'Failed to add {count} contacts to {listName}',
              listName:
                task.target.targetType === TargetType.List
                  ? (task.target?.importName ?? t('general.untitled-label'))
                  : t('general.untitled-label'),
              count: task.total,
            });
            break;
          default:
            return t('background-tasks.add-contacts-to-list-in-progress', {
              defaultValue: 'Adding {count} contacts to {listName}',
              listName:
                task.target.targetType === TargetType.List
                  ? (task.target?.importName ?? t('general.untitled-label'))
                  : t('general.untitled-label'),
              count: task.total,
            });
        }
      }
      case BackgroundTaskType.ExportAnalyticToCsv: {
        switch (task.taskStatus) {
          case BackgroundTaskStatus.Completed:
            return t('background-tasks.export-analytics-to-csv-success', {
              defaultValue: 'Exported Analytics to CSV',
            });
            break;
          case BackgroundTaskStatus.Error:
            return t('background-tasks.export-analytics-to-csv-error', {
              defaultValue: 'Error exporting Analytics to CSV ',
            });
            break;
          default:
            return t('background-tasks.export-analytics-to-csv-in-progress', {
              defaultValue: 'Export Analytics to CSV in progress',
            });
        }
      }
      case BackgroundTaskType.ExportAnalyticRevampToCsv: {
        switch (task.taskStatus) {
          case BackgroundTaskStatus.Completed:
            return t('background-tasks.export-analytics-to-csv-success', {
              defaultValue: 'Exported Analytics to CSV',
            });
            break;
          case BackgroundTaskStatus.Error:
            return t('background-tasks.export-analytics-to-csv-error', {
              defaultValue: 'Error exporting Analytics to CSV ',
            });
            break;
          default:
            return t('background-tasks.export-analytics-to-csv-in-progress', {
              defaultValue: 'Export Analytics to CSV in progress',
            });
        }
      }
      case BackgroundTaskType.ImportWhatsAppHistory: {
        switch (task.taskStatus) {
          case BackgroundTaskStatus.Completed:
            return t('background-tasks.export-analytics-to-csv-success', {
              count: task.total,
            });
            break;
          case BackgroundTaskStatus.Error:
            return t('background-tasks.export-analytics-to-csv-error', {
              count: task.total,
            });
            break;
          default:
            return t('background-tasks.export-analytics-to-csv-in-progress', {
              count: task.total,
            });
        }
      }
      case BackgroundTaskType.BulkImportContacts:
      case BackgroundTaskType.ImportContacts:
        switch (task.taskStatus) {
          case BackgroundTaskStatus.Completed:
            return t('background-tasks.import-contacts-success', {
              defaultValue: 'Imported {count} contacts',
              count: task.total,
            });
          case BackgroundTaskStatus.Error:
            return t('background-tasks.import-contacts-error', {
              defaultValue: 'Failed to import {count} contacts',
              count: task.total,
            });
          default:
            return t('background-tasks.import-contacts-in-progress', {
              defaultValue: 'Importing {count} contacts',
              count: task.total,
            });
        }

      case BackgroundTaskType.ExportBroadcastStatusListToCsv: {
        switch (task.taskStatus) {
          case BackgroundTaskStatus.Completed:
            return t(
              'background-tasks.export-broadcast-status-list-to-csv-success',
              {
                defaultValue: 'Exported {templateName} list to CSV',
                templateName:
                  task.target.targetType === TargetType.Campaign
                    ? (task.target?.templateName ?? t('general.untitled-label'))
                    : t('general.untitled-label'),
                count: task.total,
              },
            );
          case BackgroundTaskStatus.Error:
            return t(
              'background-tasks.export-broadcast-status-list-to-csv-error',
              {
                defaultValue: 'Error exporting {templateName} list to CSV',
                templateName:
                  task.target.targetType === TargetType.Campaign
                    ? (task.target?.templateName ?? t('general.untitled-label'))
                    : t('general.untitled-label'),
                count: task.total,
              },
            );
          default:
            return t(
              'background-tasks.export-broadcast-status-list-to-csv-in-progress',
              {
                defaultValue: 'Exporting {templateName} list to CSV',
                templateName:
                  task.target.targetType === TargetType.Campaign
                    ? (task.target?.templateName ?? t('general.untitled-label'))
                    : t('general.untitled-label'),
                count: task.total,
              },
            );
        }
      }
      case BackgroundTaskType.ExportContactsListToCsv: {
        switch (task.taskStatus) {
          case BackgroundTaskStatus.Completed:
            return t('background-tasks.export-contacts-list-to-csv-success', {
              defaultValue: 'Exported {count} contacts from {listName} to CSV',
              listName:
                task.target.targetType === TargetType.List
                  ? (task.target?.importName ?? t('general.untitled-label'))
                  : t('general.untitled-label'),
              count: task.total,
            });
          case BackgroundTaskStatus.Error:
            return t('background-tasks.export-contacts-list-to-csv-error', {
              defaultValue:
                'Error exporting {count} contacts from {listName} to CSV',
              listName:
                task.target.targetType === TargetType.List
                  ? (task.target?.importName ?? t('general.untitled-label'))
                  : t('general.untitled-label'),
              count: task.total,
            });
          default:
            return t(
              'background-tasks.export-contacts-list-to-csv-in-progress',
              {
                defaultValue:
                  'Exporting {count} contacts from {listName} to CSV',
                listName:
                  task.target.targetType === TargetType.List
                    ? (task.target?.importName ?? t('general.untitled-label'))
                    : t('general.untitled-label'),
                count: task.total,
              },
            );
        }
      }
      case BackgroundTaskType.ExportFlowUsageCsv: {
        switch (task.taskStatus) {
          case BackgroundTaskStatus.Completed:
            return t('background-tasks.export-flow-usage-csv-success', {
              defaultValue: 'You have successfully exported list as .CSV',
            });
          case BackgroundTaskStatus.Error:
            return t('background-tasks.export-flow-usage-to-csv-error', {
              defaultValue: 'Error exporting list to CSV',
              listName:
                task.target.targetType === TargetType.List
                  ? (task.target?.importName ?? t('general.untitled-label'))
                  : t('general.untitled-label'),
              count: task.total,
            });
          default:
            return t(
              'background-tasks.export-contacts-flow-usage-in-progress',
              {
                defaultValue: 'Exporting list as .CSV',
              },
            );
        }
      }
      case FakeBackgroundTaskType.aiFileProcessing: {
        switch (task.taskStatus) {
          case BackgroundTaskStatus.Completed:
            return t('background-tasks.ai-file-success', {
              defaultValue: 'Imported {name} to AI library successfully',
              name: task.name,
            });
          case BackgroundTaskStatus.Error:
            return t('background-tasks.ai-file-error', {
              defaultValue: 'Import {name} to AI library failed',
              name: task.name,
            });
          default:
            return t('background-tasks.ai-file-in-progress', {
              defaultValue: 'Importing {name} to AI library',
              name: task.name,
            });
        }
      }
      case BackgroundTaskType.ExportTicketCsv: {
        switch (task.taskStatus) {
          case BackgroundTaskStatus.Completed:
            return t('background-tasks.export-ticket-csv-success', {
              defaultValue: 'Exported ticket data as .CSV',
            });
          case BackgroundTaskStatus.Error:
            return t('background-tasks.export-ticket-csv-error', {
              defaultValue: 'Unable to export ticket data as .CSV',
            });
          default:
            return t('background-tasks.export-ticket-csv-in-progress', {
              defaultValue: 'Exporting ticket data as .CSV',
            });
        }
      }
      case BackgroundTaskType.LoopThroughSleekflowContact: {
        break;
      }
      default:
        return exhaustiveGuard(taskType);
    }
  };

  return {
    getBackgroundTaskSettledActions,
    getBackgroundTaskMessage,
    getBackgroundTaskSuccessActions,
  };
};

export default useBackgroundTasksUtils;
