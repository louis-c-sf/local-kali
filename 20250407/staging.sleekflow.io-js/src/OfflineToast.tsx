import { onlineManager } from '@tanstack/react-query';
import { useInjection } from 'inversify-react';
import { useObservable, useSubscription } from 'observable-hooks';
import { useCallback, useEffect } from 'react';
import toast from 'react-hot-toast/headless';
import { useTranslation } from 'react-i18next';
import { combineLatest, map, switchMap, take, timer } from 'rxjs';

import { PersistentToast } from './components/PersistentToast';
import { ReliableSignalRService } from './services/signal-r/reliable-signal-r.service';
import { SignalRService } from './services/signal-r/signal-r.service';

const OFFLINE_TOAST_ID = 'offline-toast';
const INITIAL_DELAY_MS = 6000;

export const OfflineToast = () => {
  const { t } = useTranslation();
  const signalRService = useInjection(SignalRService);
  const reliableSignalRService = useInjection(ReliableSignalRService);

  const isConnected$ = useObservable(() =>
    combineLatest({
      main: signalRService.getConnected$(),
      reliable: reliableSignalRService.getConnected$(),
    }).pipe(map((connected) => connected.main && connected.reliable)),
  );

  const onSignalRConnectionChange$ = useObservable(() =>
    timer(INITIAL_DELAY_MS).pipe(switchMap(() => isConnected$)),
  );

  const displayOfflineToast = useCallback(
    (params: { title?: string; description?: string } = {}) =>
      toast(
        (_t) => (
          <PersistentToast
            data-testid={OFFLINE_TOAST_ID}
            borderColor="orange.90"
            title={
              params.title || t('offline-toast.title', 'No internet connection')
            }
            description={
              params.description ||
              t(
                'offline-toast.description',
                'You are currently offline. Some features may be unavailable. Please refresh the page once you’re back online.',
              )
            }
            closeButtonProps={{
              'data-testid': 'offline-toast-close-button',
              onClick: () => toast.dismiss(_t.id),
            }}
            actionButtonProps={{
              color: 'mustard',
              onClick: () => window.location.reload(),
              children: t('offline-toast.refresh-button', 'Refresh'),
            }}
          />
        ),
        {
          duration: Infinity,
          id: OFFLINE_TOAST_ID,
        },
      ),
    [t],
  );

  const displayConnectingToast = useCallback(
    () =>
      displayOfflineToast({
        title: t('offline-toast.signalr-connecting-title', 'Connecting...'),
        description: t(
          'offline-toast.signalr-connecting-description',
          'Some features may be temporarily unavailable. Please wait or refresh the page.',
        ),
      }),
    [displayOfflineToast, t],
  );

  const handleConnectionChange = useCallback(
    () =>
      isConnected$.pipe(take(1)).subscribe((isConnected) => {
        const isOnline = onlineManager.isOnline();

        if (isConnected && isOnline) {
          toast.dismiss(OFFLINE_TOAST_ID);
          return;
        }

        if (!isConnected && isOnline) {
          displayConnectingToast();
          return;
        }

        displayOfflineToast();
      }),
    [displayConnectingToast, displayOfflineToast, isConnected$],
  );

  useSubscription(onSignalRConnectionChange$, handleConnectionChange);

  useEffect(() => {
    const unsubscribe = onlineManager.subscribe(handleConnectionChange);
    return () => unsubscribe();
  }, [handleConnectionChange]);

  return null;
};
