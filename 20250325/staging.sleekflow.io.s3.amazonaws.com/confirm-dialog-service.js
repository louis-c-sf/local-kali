import { eventBus } from './event-bus';
import { EventTypes } from "../models";
export class ConfirmDialogService {
  show(caption, message) {
    const context = { caption, message, promise: null };
    eventBus.emit(EventTypes.ShowConfirmDialog, this, context);
    return context.promise;
  }
  hide() {
    eventBus.emit(EventTypes.HideConfirmDialog, this);
  }
}
export const confirmDialogService = new ConfirmDialogService();
