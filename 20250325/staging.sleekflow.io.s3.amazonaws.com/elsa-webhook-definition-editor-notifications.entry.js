import { r as registerInstance, h, H as Host } from './index-28e0f8fb.js';
import { e as eventBus } from './event-bus-be6948e5.js';
import { E as EventTypes } from './events-0e467ef6.js';

let ElsaWebhookEditorNotifications = class {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.onWebhookSaved = async (webhookDefinition) => await this.toastNotificationElement.show({
      autoCloseIn: 1500,
      title: 'Webhook Saved',
      message: `Webhook successfully saved with name ${webhookDefinition.name}.`
    });
  }
  connectedCallback() {
    eventBus.on(EventTypes.WebhookSaved, this.onWebhookSaved);
  }
  disconnectedCallback() {
    eventBus.detach(EventTypes.WebhookSaved, this.onWebhookSaved);
  }
  render() {
    return (h(Host, { class: "elsa-block" }, h("elsa-toast-notification", { ref: el => this.toastNotificationElement = el })));
  }
};

export { ElsaWebhookEditorNotifications as elsa_webhook_definition_editor_notifications };
