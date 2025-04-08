import { e as eventBus } from './event-bus-be6948e5.js';
import './domain-a7b2c384.js';
import { E as EventTypes } from './axios-middleware.esm-b5e3eb44.js';

class ToastNotificationService {
  show(title, message, autoCloseIn) {
    const options = { title, message, autoCloseIn };
    eventBus.emit(EventTypes.ShowToastNotification, this, options);
  }
  hide() {
    eventBus.emit(EventTypes.HideToastNotification, this);
  }
}
const toastNotificationService = new ToastNotificationService();

export { ToastNotificationService as T, toastNotificationService as t };
