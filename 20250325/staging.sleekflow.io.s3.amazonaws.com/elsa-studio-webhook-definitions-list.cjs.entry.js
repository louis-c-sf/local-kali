'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const index = require('./index-915b0bc2.js');
require('./index-635081da.js');
const i18nLoader = require('./i18n-loader-00eaf44a.js');
const intlMessage = require('./intl-message-8802ac57.js');
const dashboard = require('./dashboard-04b50b47.js');
require('./state-tunnel-786a62ce.js');

const resources = {
  'en': {
    default: {
      'Title': 'Webhook Definitions',
      'CreateButton': 'Create Webhook'
    }
  },
  'zh-CN': {
    default: {
      'Title': 'Webhook的定义',
      'CreateButton': '创建 Webhook'
    }
  },
  'nl-NL': {
    default: {
      'Title': 'Webhook Definitie',
      'CreateButton': 'Maak Webhook'
    }
  }
};

let ElsaStudioWebhookDefinitionsList = class {
  constructor(hostRef) {
    index.registerInstance(this, hostRef);
  }
  async componentWillLoad() {
    this.i18next = await i18nLoader.loadTranslations(this.culture, resources);
  }
  render() {
    const basePath = this.basePath;
    const IntlMessage = intlMessage.GetIntlMessage(this.i18next);
    return (index.h("div", null, index.h("div", { class: "elsa-border-b elsa-border-gray-200 elsa-px-4 elsa-py-4 sm:elsa-flex sm:elsa-items-center sm:elsa-justify-between sm:elsa-px-6 lg:elsa-px-8 elsa-bg-white" }, index.h("div", { class: "elsa-flex-1 elsa-min-w-0" }, index.h("h1", { class: "elsa-text-lg elsa-font-medium elsa-leading-6 elsa-text-gray-900 sm:elsa-truncate" }, index.h(IntlMessage, { label: "Title" }))), index.h("div", { class: "elsa-mt-4 elsa-flex sm:elsa-mt-0 sm:elsa-ml-4" }, index.h("stencil-route-link", { url: `${basePath}/webhook-definitions/new`, class: "elsa-order-0 elsa-inline-flex elsa-items-center elsa-px-4 elsa-py-2 elsa-border elsa-border-transparent elsa-shadow-sm elsa-text-sm elsa-font-medium elsa-rounded-md elsa-text-white elsa-bg-blue-600 hover:elsa-bg-blue-700 focus:elsa-outline-none focus:elsa-ring-2 focus:elsa-ring-offset-2 focus:elsa-ring-blue-500 sm:elsa-order-1 sm:elsa-ml-3" }, index.h(IntlMessage, { label: "CreateButton" })))), index.h("elsa-webhook-definitions-list-screen", null)));
  }
};
dashboard.Tunnel.injectProps(ElsaStudioWebhookDefinitionsList, ['culture', 'basePath']);

exports.elsa_studio_webhook_definitions_list = ElsaStudioWebhookDefinitionsList;
