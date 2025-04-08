import { Container } from 'inversify';

import { PushNotificationsService } from '@/services/push-notifications/push-notifications.service';

function loadDeps(container: Container) {
  container
    .bind(PushNotificationsService)
    .to(PushNotificationsService)
    .inSingletonScope();
}

export const PushNotifications = {
  loadDeps,
};
