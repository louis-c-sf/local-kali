import { inject, injectable } from 'inversify';
import { combineLatest, filter, map, take } from 'rxjs';

import { ClassicRealTimeService } from '@/services/signal-r/classic-real-time.service';
import { TravisBackendWebPushNotification } from '@/services/signal-r/signal-r.service';

import { CompanyService } from '../companies/company.service';

@injectable()
export class PushNotificationsService {
  private onNewMessage: (data: TravisBackendWebPushNotification) => void = () =>
    null;
  private onAssignment: (data: TravisBackendWebPushNotification) => void = () =>
    null;
  private onNote: (data: TravisBackendWebPushNotification) => void = () => null;

  constructor(
    @inject(ClassicRealTimeService)
    private classicRealtimeService: ClassicRealTimeService,
    @inject(CompanyService) private companyService: CompanyService,
  ) {
    combineLatest([
      this.companyService.getDisplayableMessageChannels$(),
      this.classicRealtimeService.getOnPushNotification$(),
      this.companyService.getIsLoadingDisplayableMessageChannels$().pipe(
        filter((isLoading) => !isLoading),
        take(1),
      ),
    ])
      .pipe(
        filter(([channels, messages]) =>
          channels.some(
            (c) =>
              (c.channelType === messages.channelType &&
                c.channelIdentityId === messages.channelIdentityId) ||
              c.channelType === 'note' ||
              c.channelType === 'web',
          ),
        ),
        map(([, messages]) => messages),
      )
      .subscribe(async (value) => {
        switch (value.event) {
          case 'NewMessage': {
            this.onNewMessage(value);
            break;
          }
          case 'Assignment': {
            this.onAssignment(value);
            break;
          }
          case 'Note': {
            this.onNote(value);
            break;
          }
        }
      });
  }

  public setup(
    options: {
      onNewMessage?: (data: TravisBackendWebPushNotification) => void;
      onAssignment?: (data: TravisBackendWebPushNotification) => void;
      onNote?: (data: TravisBackendWebPushNotification) => void;
    } = {},
  ) {
    if (options.onNewMessage) {
      this.onNewMessage = options.onNewMessage;
    }
    if (options.onAssignment) {
      this.onAssignment = options.onAssignment;
    }
    if (options.onNote) {
      this.onNote = options.onNote;
    }
  }

  public async addNativeNotification(options: {
    title: string;
    subtitle?: string;
    message?: string;
    onClick?: () => void;
    duration?: number;
    icon?: string;
    vibrate?: number | number[];
    silent?: boolean;
    tag?: string;
  }): Promise<void> {
    const {
      title,
      subtitle = '',
      message = '',
      duration,
      icon = `${window.location.origin}/favicon/android-chrome-192x192.png`,
      vibrate = 0,
      silent = false,
      onClick,
      tag = `${title}-${Date.now()}`,
    } = options;

    if (!Notification || !('serviceWorker' in navigator)) {
      // Not support Push notification
      return;
    }

    if (
      Notification.permission === 'default' ||
      Notification.permission === 'denied'
    ) {
      await Notification.requestPermission();
    }
    if (Notification.permission === 'granted') {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, {
        body: message,
        data: subtitle,
        icon,
        // @ts-expect-error -- `vibrate` is experimental
        vibrate,
        silent,
        tag,
      });

      const notifications = await registration.getNotifications({ tag });
      notifications.forEach((notification) => {
        notification.onclick = onClick || null;
        if (duration) {
          setTimeout(notification.close.bind(notification), duration);
        }
      });
    }
  }
}
