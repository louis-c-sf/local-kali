import { eventBus } from './event-bus';
import { EventTypes } from "../models";
export class ToastNotificationService {
  show(title, message, autoCloseIn) {
    const options = { title, message, autoCloseIn };
    eventBus.emit(EventTypes.ShowToastNotification, this, options);
  }
  hide() {
    eventBus.emit(EventTypes.HideToastNotification, this);
  }
}
export const toastNotificationService = new ToastNotificationService();
