import { useCallback, useEffect } from 'react';
import toast from 'react-hot-toast/headless';
import { useTranslation } from 'react-i18next';
// eslint-disable-next-line import/no-unresolved
import { useRegisterSW } from 'virtual:pwa-register/react';

import { testIds } from '@/playwright/lib/test-ids';

import { PersistentToast } from './components/PersistentToast';

export default function AppVersionUpdateToast() {
  const { t } = useTranslation();
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW: useCallback(
      (swUrl: string, r: ServiceWorkerRegistration | undefined) => {
        console.log('SW Registered: ' + swUrl);
        if (r) {
          setInterval(
            async () => {
              console.log('SW polling update: ', { ...r });
              if (!(!r.installing && navigator)) return;
              // Don't check for updates if the user is offline
              if ('connection' in navigator && !navigator.onLine) return;
              // Check if service worker exists
              const resp = await fetch(swUrl, {
                cache: 'no-store',
                headers: {
                  cache: 'no-store',
                  'cache-control': 'no-cache',
                },
              });

              if (resp?.status === 200) {
                await r.update();
              }
              // Check for updates every 15 minutes
            },
            15 * 60 * 1000,
          );
        }
      },
      [],
    ),
    onRegisterError(error) {
      console.error('SW registration error', error);
    },
  });

  useEffect(() => {
    if (needRefresh) {
      toast(
        (_t) => (
          <PersistentToast
            data-testid={testIds.appUpdateDialog}
            title={t('app-update.title', {
              defaultValue: 'New App Version Available',
            })}
            description={t('app-update.description', {
              defaultValue:
                'A new version of the app is available. Please reload the page to get the latest version.',
            })}
            closeButtonProps={{
              'data-testid': testIds.appUpdateDialogCloseButton,
              onClick: () => {
                setNeedRefresh(false);
                toast.dismiss(_t.id);
              },
            }}
            actionButtonProps={{
              onClick: () => {
                try {
                  updateServiceWorker(true);
                  setNeedRefresh(false);
                } catch {
                  console.error('Failed to update service worker');
                }
              },
              children: t('app-update.reload-button', {
                defaultValue: 'Reload',
              }),
            }}
          />
        ),
        {
          duration: Infinity,
          id: 'app-update',
        },
      );

      return () => {
        toast.dismiss('app-update');
        setNeedRefresh(false);
      };
    }
  }, [needRefresh, setNeedRefresh, t, updateServiceWorker]);

  return null;
}
