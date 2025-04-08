'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const index = require('./index-915b0bc2.js');
const eventBus = require('./event-bus-8066af27.js');
const events = require('./events-e94254a3.js');

let ElsaWebhookEditorNotifications = class {
  constructor(hostRef) {
    index.registerInstance(this, hostRef);
    this.onWebhookSaved = async (webhookDefinition) => await this.toastNotificationElement.show({
      autoCloseIn: 1500,
      title: 'Webhook Saved',
      message: `Webhook successfully saved with name ${webhookDefinition.name}.`
    });
  }
  connectedCallback() {
    eventBus.eventBus.on(events.EventTypes.WebhookSaved, this.onWebhookSaved);
  }
  disconnectedCallback() {
    eventBus.eventBus.detach(events.EventTypes.WebhookSaved, this.onWebhookSaved);
  }
  render() {
    return (index.h(index.Host, { class: "elsa-block" }, index.h("elsa-toast-notification", { ref: el => this.toastNotificationElement = el })));
  }
};

exports.elsa_webhook_definition_editor_notifications = ElsaWebhookEditorNotifications;
