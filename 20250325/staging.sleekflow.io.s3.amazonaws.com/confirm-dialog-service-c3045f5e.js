import { e as eventBus } from './event-bus-be6948e5.js';
import './domain-a7b2c384.js';
import { E as EventTypes } from './axios-middleware.esm-b5e3eb44.js';

class ConfirmDialogService {
  show(caption, message) {
    const context = { caption, message, promise: null };
    eventBus.emit(EventTypes.ShowConfirmDialog, this, context);
    return context.promise;
  }
  hide() {
    eventBus.emit(EventTypes.HideConfirmDialog, this);
  }
}
const confirmDialogService = new ConfirmDialogService();

export { ConfirmDialogService as C, confirmDialogService as c };
