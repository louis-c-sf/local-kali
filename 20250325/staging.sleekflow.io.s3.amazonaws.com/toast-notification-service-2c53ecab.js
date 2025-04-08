'use strict';

const eventBus = require('./event-bus-8066af27.js');
require('./domain-b01b4a53.js');
const axiosMiddleware_esm = require('./axios-middleware.esm-f337c7ad.js');

class ToastNotificationService {
  show(title, message, autoCloseIn) {
    const options = { title, message, autoCloseIn };
    eventBus.eventBus.emit(axiosMiddleware_esm.EventTypes.ShowToastNotification, this, options);
  }
  hide() {
    eventBus.eventBus.emit(axiosMiddleware_esm.EventTypes.HideToastNotification, this);
  }
}
const toastNotificationService = new ToastNotificationService();

exports.ToastNotificationService = ToastNotificationService;
exports.toastNotificationService = toastNotificationService;
