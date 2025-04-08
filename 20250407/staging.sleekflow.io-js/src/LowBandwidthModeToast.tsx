import { useCallback, useState, useEffect } from 'react';
import toast from 'react-hot-toast/headless';
import { useTranslation } from 'react-i18next';
import { PersistentToast } from './components/PersistentToast';
import { useBackgroundTaskStore } from './signalr/BackgroundTaskManager/useBackgroundTaskStore';
import { BackgroundTaskType } from './api/types';
import {
  FEATURE_FLAG_NAMES,
  useIsCompanyFeatureFlagEnabled,
} from './api/featureFlag';
import dayjs from 'dayjs';
import { useInjection } from 'inversify-react';
import { SignalRService } from './services/signal-r/signal-r.service';
import { useSubscription } from 'observable-hooks';

const LOW_BANDWIDTH_MODE = 'low-bandwidth-mode-toast';
const ImportContactsToListTaskTypes = [
  BackgroundTaskType.ImportContacts,
  BackgroundTaskType.AddContactsToList,
  BackgroundTaskType.BulkUpdateContactsCustomFields,
  BackgroundTaskType.BulkImportContacts,
];

export const LowBandwidthModeToast = () => {
  const { t } = useTranslation();
  const { backgroundTasks } = useBackgroundTaskStore();
  const signalRService = useInjection(SignalRService);
  const { isLoading: isFeatureFlagLoading, data: isLowBandwidthModeEnabled } =
    useIsCompanyFeatureFlagEnabled(FEATURE_FLAG_NAMES.LOW_BANDWIDTH_MODE);
  const [isToastDisplayed, setIsToastDisplayed] = useState(false);

  // Check if there are any background tasks in progress
  const hasProcessingTasks = backgroundTasks.data?.some(
    (task) =>
      ImportContactsToListTaskTypes.some((x) => x == task.taskType) &&
      task.isCompleted === false &&
      task.errorMessage === null &&
      task.createdAt &&
      dayjs(task.createdAt).isAfter(dayjs().subtract(2, 'weeks')),
  );

  const displayLowBandwidthModeToast = useCallback(
    (params: { title?: string; description?: string } = {}) => {
      return toast(
        (_t) => (
          <PersistentToast
            data-testid={LOW_BANDWIDTH_MODE}
            borderColor="orange.90"
            title={
              params.title ||
              t(
                'low-bandwidth-mode-toast.long-running-task-title',
                'Long running tasks in progress',
              )
            }
            description={
              params.description ||
              t(
                'low-bandwidth-mode-toast.long-running-task-description',
                'Import contact or broadcast is in progress. Some features may not be available in real time. Please refresh the page after completion.',
              )
            }
            closeButtonProps={{
              'data-testid': 'low-bandwidth-mode-toast-close-button',
              onClick: () => {
                toast.dismiss(_t.id);
              },
            }}
            actionButtonProps={{
              color: 'mustard',
              onClick: () => window.location.reload(),
              children: t('low-bandwidth-mode-toast.refresh-button', 'Refresh'),
            }}
          />
        ),
        {
          duration: Infinity,
          id: LOW_BANDWIDTH_MODE,
        },
      );
    },
    [t],
  );

  // Combined handler for both background tasks and broadcast campaign sending
  const handleLowBandwidthMode = useCallback(
    (isBroadcastSending = false) => {
      if (isFeatureFlagLoading || !isLowBandwidthModeEnabled) {
        return;
      }

      // If there are no processing tasks and it's not a broadcast sending event, dismiss the toast
      if (!hasProcessingTasks && !isBroadcastSending && isToastDisplayed) {
        displayLowBandwidthModeToast({
          title: t(
            'low-bandwidth-mode-toast.completed-title',
            'Task completed',
          ),
          description: t(
            'low-bandwidth-mode-toast.completed-description',
            'Import contact or broadcast has finished. Please refresh the page to see the latest updates.',
          ),
        });
        setIsToastDisplayed(false);
        return;
      }

      // Show toast for background tasks / broadcast sending event
      if (hasProcessingTasks || isBroadcastSending) {
        displayLowBandwidthModeToast();
        setIsToastDisplayed(true);
      }
    },
    [
      displayLowBandwidthModeToast,
      hasProcessingTasks,
      isFeatureFlagLoading,
      isLowBandwidthModeEnabled,
      isToastDisplayed,
      t,
    ],
  );

  useEffect(() => {
    handleLowBandwidthMode();
  }, [hasProcessingTasks, handleLowBandwidthMode]);

  // Subscribe to broadcast campaign events
  useSubscription(signalRService.getOnBroadcastCampaignSending$(), () =>
    handleLowBandwidthMode(true),
  );

  useSubscription(signalRService.getOnBroadcastCampaignSent$(), () =>
    handleLowBandwidthMode(),
  );

  return null;
};
