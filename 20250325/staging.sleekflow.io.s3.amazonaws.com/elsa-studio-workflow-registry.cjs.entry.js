'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const index = require('./index-915b0bc2.js');
const i18nLoader = require('./i18n-loader-00eaf44a.js');
const dashboard = require('./dashboard-04b50b47.js');
require('./state-tunnel-786a62ce.js');

const resources = {
  'en': {
    default: {
      'Title': 'Workflow Registry',
      'CreateButton': 'Create Workflow'
    }
  },
  'zh-CN': {
    default: {
      'Title': '工作流程注册表',
      'CreateButton': '创建工作流程'
    }
  },
  'nl-NL': {
    default: {
      'Title': 'Workflow Register',
      'CreateButton': 'Nieuwe Workflow'
    }
  }
};

let ElsaStudioWorkflowRegistry = class {
  constructor(hostRef) {
    index.registerInstance(this, hostRef);
  }
  async componentWillLoad() {
    this.i18next = await i18nLoader.loadTranslations(this.culture, resources);
  }
  render() {
    const basePath = this.basePath;
    const t = x => this.i18next.t(x);
    return (index.h("div", null, index.h("div", { class: "elsa-border-b elsa-border-gray-200 elsa-px-4 elsa-py-4 sm:elsa-flex sm:elsa-items-center sm:elsa-justify-between sm:elsa-px-6 lg:elsa-px-8 elsa-bg-white" }, index.h("div", { class: "elsa-flex-1 elsa-min-w-0" }, index.h("h1", { class: "elsa-text-lg elsa-font-medium elsa-leading-6 elsa-text-gray-900 sm:elsa-truncate" }, t('Title'))), index.h("div", { class: "elsa-mt-4 elsa-flex sm:elsa-mt-0 sm:elsa-ml-4" }, index.h("stencil-route-link", { url: `${basePath}/workflow-definitions/new`, class: "elsa-order-0 elsa-inline-flex elsa-items-center elsa-px-4 elsa-py-2 elsa-border elsa-border-transparent elsa-shadow-sm elsa-text-sm elsa-font-medium elsa-rounded-md elsa-text-white elsa-bg-blue-600 hover:elsa-bg-blue-700 focus:elsa-outline-none focus:elsa-ring-2 focus:elsa-ring-offset-2 focus:elsa-ring-blue-500 sm:elsa-order-1 sm:elsa-ml-3" }, t('CreateButton')))), index.h("elsa-workflow-registry-list-screen", null)));
  }
};
dashboard.Tunnel.injectProps(ElsaStudioWorkflowRegistry, ['culture', 'basePath']);

exports.elsa_studio_workflow_registry = ElsaStudioWorkflowRegistry;
