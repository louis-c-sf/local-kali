'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const index = require('./index-915b0bc2.js');
const i18nLoader = require('./i18n-loader-00eaf44a.js');

const resources = {
  'en': {
    default: {
      'Title': 'Workflow Instances'
    }
  },
  'zh-CN': {
    default: {
      'Title': '工作流实例'
    }
  },
  'nl-NL': {
    default: {
      'Title': 'Workflow Instanties'
    }
  }
};

let ElsaStudioWorkflowInstancesList = class {
  constructor(hostRef) {
    index.registerInstance(this, hostRef);
  }
  async componentWillLoad() {
    this.i18next = await i18nLoader.loadTranslations(this.culture, resources);
  }
  render() {
    const t = x => this.i18next.t(x);
    return (index.h("div", null, index.h("div", { class: "elsa-border-b elsa-border-gray-200 elsa-px-4 elsa-py-4 sm:elsa-flex sm:elsa-items-center sm:elsa-justify-between sm:elsa-px-6 lg:elsa-px-8 elsa-bg-white" }, index.h("div", { class: "elsa-flex-1 elsa-min-w-0" }, index.h("h1", { class: "elsa-text-lg elsa-font-medium elsa-leading-6 elsa-text-gray-900 sm:elsa-truncate" }, t('Title')))), index.h("elsa-workflow-instance-list-screen", null)));
  }
};

exports.elsa_studio_workflow_instances_list = ElsaStudioWorkflowInstancesList;
