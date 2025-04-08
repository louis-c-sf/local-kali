import { useInjection } from 'inversify-react';
import { useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useRouteWithLocale } from '@/hooks/useRouteWithLocale/useRouteWithLocale';
import { PushNotificationsService } from '@/services/push-notifications/push-notifications.service';
import { TravisBackendWebPushNotification } from '@/services/signal-r/signal-r.service';

export default function PushNotification() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const routeTo = useRouteWithLocale();
  const navigate = useNavigate();
  const pushNotificationsService = useInjection(PushNotificationsService);
  const {
    i18n: { language },
  } = useTranslation();
  async function notifyNewMessage(data: TravisBackendWebPushNotification) {
    await pushNotificationsService.addNativeNotification({
      title: data.title,
      message: data.body,
      icon: `${window.location.origin}/favicon/android-chrome-192x192.png`,
      onClick: () => {
        // TODO: This is a temporary solution to open the conversation window idk why navigate is not working. It will strip the searchParams?
        window.open(
          `${window.location.origin}/${language}/inbox?conversationId=${data.conversationId}`,
          '_self',
        );
      },
    });
    playSound();
  }

  useMemo(() => {
    pushNotificationsService.setup({
      onNewMessage: async (data) => {
        await notifyNewMessage(data);
      },
      onNote: async (data) => {
        await notifyNewMessage(data);
      },
      onAssignment: async (data) => {
        await notifyNewMessage(data);
      },
    });
  }, [navigate, pushNotificationsService, routeTo]);

  function playSound() {
    if (audioRef.current) {
      audioRef.current.muted = false;
      audioRef.current.volume = 1;
      audioRef.current.play().catch(() => {
        // Chrome throws error if audio is played without user interaction
        // https://developer.chrome.com/blog/autoplay/
      });
    }
  }

  return (
    <audio ref={audioRef} hidden muted>
      <source
        src="https://s3-ap-southeast-1.amazonaws.com/app.sleekflow.io/static/audio/chat_sound.mp3"
        type="audio/mp3"
      />
      <track kind="captions" />
    </audio>
  );
}
