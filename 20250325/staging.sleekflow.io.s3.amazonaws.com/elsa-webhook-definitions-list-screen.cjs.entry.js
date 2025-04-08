'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const index = require('./index-915b0bc2.js');
const collection = require('./collection-724169f5.js');
const elsaClient = require('./elsa-client-8ceb2a34.js');
const dashboard = require('./dashboard-04b50b47.js');
require('./_commonjsHelpers-a5111d61.js');
require('./index-a2f6d9eb.js');
require('./axios-middleware.esm-f337c7ad.js');
require('./event-bus-8066af27.js');
require('./domain-b01b4a53.js');
require('./state-tunnel-786a62ce.js');

let ElsaWebhookDefinitionsListScreen = class {
  constructor(hostRef) {
    index.registerInstance(this, hostRef);
    this.webhookDefinitions = { items: [], page: 1, pageSize: 50, totalCount: 0 };
  }
  async componentWillLoad() {
    await this.loadWebhookDefinitions();
  }
  async onDeleteClick(e, webhookDefinition) {
    const result = await this.confirmDialog.show('Delete Webhook Definition', 'Are you sure you wish to permanently delete this webhook?');
    if (!result)
      return;
    const elsaClient$1 = elsaClient.createElsaWebhooksClient(this.serverUrl);
    await elsaClient$1.webhookDefinitionsApi.delete(webhookDefinition.id);
    await this.loadWebhookDefinitions();
  }
  async loadWebhookDefinitions() {
    const elsaClient$1 = elsaClient.createElsaWebhooksClient(this.serverUrl);
    const page = 0;
    const pageSize = 50;
    this.webhookDefinitions = await elsaClient$1.webhookDefinitionsApi.list(page, pageSize);
  }
  render() {
    const webhookDefinitions = this.webhookDefinitions;
    const list = collection.collection.orderBy(webhookDefinitions, 'name');
    const basePath = this.basePath;
    return (index.h("div", null, index.h("div", { class: "elsa-align-middle elsa-inline-block elsa-min-w-full elsa-border-b elsa-border-gray-200" }, index.h("table", { class: "elsa-min-w-full" }, index.h("thead", null, index.h("tr", { class: "elsa-border-t elsa-border-gray-200" }, index.h("th", { class: "elsa-px-6 elsa-py-3 elsa-border-b elsa-border-gray-200 elsa-bg-gray-50 elsa-text-left elsa-text-xs elsa-leading-4 elsa-font-medium elsa-text-gray-500 elsa-uppercase elsa-tracking-wider" }, index.h("span", { class: "lg:elsa-pl-2" }, "Name")), index.h("th", { class: "elsa-px-6 elsa-py-3 elsa-border-b elsa-border-gray-200 elsa-bg-gray-50 elsa-text-left elsa-text-xs elsa-leading-4 elsa-font-medium elsa-text-gray-500 elsa-uppercase elsa-tracking-wider" }, "Path"), index.h("th", { class: "elsa-px-6 elsa-py-3 elsa-border-b elsa-border-gray-200 elsa-bg-gray-50 elsa-text-left elsa-text-xs elsa-leading-4 elsa-font-medium elsa-text-gray-500 elsa-uppercase elsa-tracking-wider" }, "Payload Type Name"), index.h("th", { class: "elsa-px-6 elsa-py-3 elsa-border-b elsa-border-gray-200 elsa-bg-gray-50 elsa-text-left elsa-text-xs elsa-leading-4 elsa-font-medium elsa-text-gray-500 elsa-uppercase elsa-tracking-wider" }, "Enabled"), index.h("th", { class: "elsa-pr-6 elsa-py-3 elsa-border-b elsa-border-gray-200 elsa-bg-gray-50 elsa-text-right elsa-text-xs elsa-leading-4 elsa-font-medium elsa-text-gray-500 elsa-uppercase elsa-tracking-wider" }))), index.h("tbody", { class: "elsa-bg-white elsa-divide-y elsa-divide-gray-100" }, collection.collection.map(list, item => {
      const webhookDefinition = item;
      let webhookDisplayName = webhookDefinition.name;
      if (!webhookDisplayName || webhookDisplayName.trim().length == 0)
        webhookDisplayName = webhookDefinition.name;
      if (!webhookDisplayName || webhookDisplayName.trim().length == 0)
        webhookDisplayName = 'Untitled';
      const editUrl = `${basePath}/webhook-definitions/${webhookDefinition.id}`;
      const editIcon = (index.h("svg", { class: "elsa-h-5 elsa-w-5 elsa-text-gray-500", width: "24", height: "24", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, index.h("path", { d: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" }), index.h("path", { d: "M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" })));
      const deleteIcon = (index.h("svg", { class: "elsa-h-5 elsa-w-5 elsa-text-gray-500", width: "24", height: "24", viewBox: "0 0 24 24", "stroke-width": "2", stroke: "currentColor", fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round" }, index.h("path", { stroke: "none", d: "M0 0h24v24H0z" }), index.h("line", { x1: "4", y1: "7", x2: "20", y2: "7" }), index.h("line", { x1: "10", y1: "11", x2: "10", y2: "17" }), index.h("line", { x1: "14", y1: "11", x2: "14", y2: "17" }), index.h("path", { d: "M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" }), index.h("path", { d: "M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" })));
      return (index.h("tr", null, index.h("td", { class: "elsa-px-6 elsa-py-3 elsa-whitespace-no-wrap elsa-text-sm elsa-leading-5 elsa-font-medium elsa-text-gray-900" }, index.h("div", { class: "elsa-flex elsa-items-center elsa-space-x-3 lg:elsa-pl-2" }, index.h("stencil-route-link", { url: editUrl, anchorClass: "elsa-truncate hover:elsa-text-gray-600" }, index.h("span", null, webhookDisplayName)))), index.h("td", { class: "elsa-px-6 elsa-py-3 elsa-text-sm elsa-leading-5 elsa-text-gray-500 elsa-font-medium" }, index.h("div", { class: "elsa-flex elsa-items-center elsa-space-x-3 lg:elsa-pl-2" }, webhookDefinition.path)), index.h("td", { class: "elsa-px-6 elsa-py-3 elsa-text-sm elsa-leading-5 elsa-text-gray-500 elsa-font-medium" }, index.h("div", { class: "elsa-flex elsa-items-center elsa-space-x-3 lg:elsa-pl-2" }, webhookDefinition.payloadTypeName)), index.h("td", { class: "elsa-px-6 elsa-py-3 elsa-text-sm elsa-leading-5 elsa-text-gray-500 elsa-font-medium" }, index.h("div", { class: "elsa-flex elsa-items-center elsa-space-x-3 lg:elsa-pl-2" }, true == webhookDefinition.isEnabled ? 'Yes' : 'No')), index.h("td", { class: "elsa-pr-6" }, index.h("elsa-context-menu", { history: this.history, menuItems: [
          { text: 'Edit', anchorUrl: editUrl, icon: editIcon },
          { text: 'Delete', clickHandler: e => this.onDeleteClick(e, webhookDefinition), icon: deleteIcon }
        ] }))));
    })))), index.h("elsa-confirm-dialog", { ref: el => this.confirmDialog = el })));
  }
};
dashboard.Tunnel.injectProps(ElsaWebhookDefinitionsListScreen, ['serverUrl', 'culture', 'basePath']);

exports.elsa_webhook_definitions_list_screen = ElsaWebhookDefinitionsListScreen;
