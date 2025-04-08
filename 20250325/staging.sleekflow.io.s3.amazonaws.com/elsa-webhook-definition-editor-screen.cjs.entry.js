'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const index = require('./index-915b0bc2.js');
const eventBus = require('./event-bus-8066af27.js');
const events = require('./events-e94254a3.js');
const elsaClient = require('./elsa-client-8ceb2a34.js');
const forms = require('./forms-64b39def.js');
const dashboard = require('./dashboard-04b50b47.js');
require('./index-a2f6d9eb.js');
require('./axios-middleware.esm-f337c7ad.js');
require('./domain-b01b4a53.js');
require('./state-tunnel-786a62ce.js');

let ElsaWebhookDefinitionEditorScreen = class {
  constructor(hostRef) {
    index.registerInstance(this, hostRef);
  }
  async getServerUrl() {
    return this.serverUrl;
  }
  async getWebhookId() {
    return this.webhookDefinitionInternal.id;
  }
  async webhookDefinitionChangedHandler(newValue) {
    this.webhookDefinitionInternal = Object.assign({}, newValue);
    this.formContext = new forms.FormContext(this.webhookDefinitionInternal, newValue => this.webhookDefinitionInternal = newValue);
  }
  async webhookIdChangedHandler(newValue) {
    const webhookId = newValue;
    let webhookDefinition = ElsaWebhookDefinitionEditorScreen.createWebhookDefinition();
    webhookDefinition.id = webhookId;
    const client = elsaClient.createElsaWebhooksClient(this.serverUrl);
    if (webhookId && webhookId.length > 0) {
      try {
        webhookDefinition = await client.webhookDefinitionsApi.getByWebhookId(webhookId);
      }
      catch (_a) {
        console.warn(`The specified webhook definition does not exist. Creating a new one.`);
      }
    }
    else {
      webhookDefinition.isEnabled = true;
    }
    this.updateWebhookDefinition(webhookDefinition);
  }
  async serverUrlChangedHandler(newValue) {
  }
  async componentWillLoad() {
    await this.serverUrlChangedHandler(this.serverUrl);
    await this.webhookDefinitionChangedHandler(this.webhookDefinition);
    await this.webhookIdChangedHandler(this.webhookId);
  }
  async saveWebhook() {
    if (!this.serverUrl || this.serverUrl.length == 0)
      return;
    const client = elsaClient.createElsaWebhooksClient(this.serverUrl);
    let webhookDefinition = this.webhookDefinitionInternal;
    const request = {
      id: webhookDefinition.id || this.webhookId,
      name: webhookDefinition.name,
      path: webhookDefinition.path,
      description: webhookDefinition.description,
      payloadTypeName: webhookDefinition.payloadTypeName,
      isEnabled: webhookDefinition.isEnabled,
    };
    this.saving = true;
    try {
      if (request.id == null)
        webhookDefinition = await client.webhookDefinitionsApi.save(request);
      else
        webhookDefinition = await client.webhookDefinitionsApi.update(request);
      this.saving = false;
      this.saved = true;
      setTimeout(() => this.saved = false, 500);
    }
    catch (e) {
      console.error(e);
      this.saving = false;
      this.saved = false;
      this.networkError = e.message;
      setTimeout(() => this.networkError = null, 10000);
    }
  }
  updateWebhookDefinition(value) {
    this.webhookDefinition = value;
  }
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  navigate(path) {
    if (this.history) {
      this.history.push(path);
      return;
    }
    document.location.pathname = path;
  }
  async onSaveClicked(e) {
    e.preventDefault();
    await this.saveWebhook();
    eventBus.eventBus.emit(events.EventTypes.WebhookSaved, this, this.webhookDefinitionInternal);
    this.sleep(1000).then(() => {
      this.navigate(`/webhook-definitions`);
    });
  }
  render() {
    return (index.h(index.Host, { class: "elsa-flex elsa-flex-col elsa-w-full", ref: el => this.el = el }, index.h("form", { onSubmit: e => this.onSaveClicked(e) }, index.h("div", { class: "elsa-px-8 mb-8" }, index.h("div", { class: "elsa-border-b elsa-border-gray-200" })), this.renderWebhookFields(), this.renderCanvas())));
  }
  renderWebhookFields() {
    const webhookDefinition = this.webhookDefinitionInternal;
    const formContext = this.formContext;
    return (index.h("main", { class: "elsa-max-w-7xl elsa-mx-auto elsa-pb-10 lg:elsa-py-12 lg:elsa-px-8" }, index.h("div", { class: "lg:elsa-grid lg:elsa-grid-cols-12 lg:elsa-gap-x-5" }, index.h("aside", { class: "elsa-py-6 elsa-px-2 sm:elsa-px-6 lg:elsa-py-0 lg:elsa-px-0 lg:elsa-col-span-2" }), index.h("div", { class: "elsa-space-y-6 sm:elsa-px-6 lg:elsa-px-0 lg:elsa-col-span-9" }, index.h("section", { "aria-labelledby": "payment_details_heading" }, index.h("div", { class: "elsa-shadow sm:elsa-rounded-md sm:elsa-overflow-hidden" }, index.h("div", { class: "elsa-bg-white elsa-py-6 elsa-px-4 sm:elsa-p-6" }, index.h("div", null, index.h("h1", { class: "elsa-text-lg elsa-leading-6 elsa-font-medium elsa-text-gray-900" }, null == webhookDefinition.id ? "Create Webhook Definition" : "Edit Webhook Definition")), index.h("div", { class: "elsa-mt-6 elsa-grid elsa-grid-cols-4 elsa-gap-6" }, index.h("div", { class: "elsa-col-span-4" }, forms.textInput(formContext, 'name', 'Name', webhookDefinition.name, 'The name of the webhook.', 'webhookName')), index.h("div", { class: "elsa-col-span-4" }, forms.textInput(formContext, 'path', 'Path', webhookDefinition.path, 'The path of the webhook.', 'webhookPath')), index.h("div", { class: "elsa-col-span-4" }, forms.textArea(formContext, 'description', 'Description', webhookDefinition.description, null, 'webhookDescription')), index.h("div", { class: "elsa-col-span-4" }, forms.textInput(formContext, 'payloadTypeName', 'Payload Type Name', webhookDefinition.payloadTypeName, 'The payload type name of the webhook.', 'webhookPayloadTypeName')), index.h("div", { class: "elsa-col-span-4" }, forms.checkBox(formContext, 'isEnabled', 'Enabled', webhookDefinition.isEnabled, null)))), index.h("div", { class: "elsa-px-4 elsa-py-3 elsa-bg-gray-50 elsa-text-right sm:px-6" }, index.h("button", { type: "submit", class: "elsa-ml-0 elsa-w-full elsa-inline-flex elsa-justify-center elsa-rounded-md elsa-border elsa-border-transparent elsa-shadow-sm elsa-px-4 elsa-py-2 elsa-bg-blue-600 elsa-text-base elsa-font-medium elsa-text-white hover:elsa-bg-blue-700 focus:elsa-outline-none focus:elsa-ring-2 focus:elsa-ring-offset-2 focus:elsa-ring-blue-500 sm:elsa-ml-3 sm:elsa-w-auto sm:elsa-text-sm" }, "Save"))))))));
  }
  renderCanvas() {
    return (index.h("div", { class: "elsa-flex-1 elsa-flex elsa-relative" }, index.h("elsa-webhook-definition-editor-notifications", null), index.h("div", { class: "elsa-fixed elsa-bottom-10 elsa-right-12" }, index.h("div", { class: "elsa-flex elsa-items-center elsa-space-x-4" }, this.renderSavingIndicator(), this.renderNetworkError()))));
  }
  renderSavingIndicator() {
    const message = this.saving ? 'Saving...' : this.saved ? 'Saved'
      : null;
    if (!message)
      return undefined;
    return (index.h("div", null, index.h("span", { class: "elsa-text-gray-400 elsa-text-sm" }, message)));
  }
  renderNetworkError() {
    if (!this.networkError)
      return undefined;
    return (index.h("div", null, index.h("span", { class: "elsa-text-rose-400 elsa-text-sm" }, "An error occurred: ", this.networkError)));
  }
  static createWebhookDefinition() {
    return {
      id: null,
    };
  }
  static get watchers() { return {
    "webhookDefinition": ["webhookDefinitionChangedHandler"],
    "webhookId": ["webhookIdChangedHandler"],
    "serverUrl": ["serverUrlChangedHandler"]
  }; }
};
dashboard.Tunnel.injectProps(ElsaWebhookDefinitionEditorScreen, ['serverUrl', 'culture']);

exports.elsa_webhook_definition_editor_screen = ElsaWebhookDefinitionEditorScreen;
