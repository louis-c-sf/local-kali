'use strict';

const eventBus = require('./event-bus-8066af27.js');
require('./domain-b01b4a53.js');
const axiosMiddleware_esm = require('./axios-middleware.esm-f337c7ad.js');

class ConfirmDialogService {
  show(caption, message) {
    const context = { caption, message, promise: null };
    eventBus.eventBus.emit(axiosMiddleware_esm.EventTypes.ShowConfirmDialog, this, context);
    return context.promise;
  }
  hide() {
    eventBus.eventBus.emit(axiosMiddleware_esm.EventTypes.HideConfirmDialog, this);
  }
}
const confirmDialogService = new ConfirmDialogService();

exports.ConfirmDialogService = ConfirmDialogService;
exports.confirmDialogService = confirmDialogService;
