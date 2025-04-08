import { Component, Host, h } from '@stencil/core';
import { eventBus } from '../../../../../../services/event-bus';
import { EventTypes } from "../../../../models";
export class ElsaWebhookEditorNotifications {
  constructor() {
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
    return (h(Host, { class: "elsa-block" },
      h("elsa-toast-notification", { ref: el => this.toastNotificationElement = el })));
  }
  static get is() { return "elsa-webhook-definition-editor-notifications"; }
}
