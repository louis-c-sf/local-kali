'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const index = require('./index-915b0bc2.js');
const i18nLoader = require('./i18n-loader-00eaf44a.js');
require('./domain-b01b4a53.js');
const elsaClient = require('./elsa-client-e99f1b35.js');
require('./utils-5d19a660.js');
require('./index-1eae61b2.js');
require('./cronstrue-62722667.js');
const dashboard = require('./dashboard-04b50b47.js');
require('./index-a2f6d9eb.js');
require('./axios-middleware.esm-f337c7ad.js');
require('./collection-724169f5.js');
require('./_commonjsHelpers-a5111d61.js');
require('./event-bus-8066af27.js');
require('./state-tunnel-786a62ce.js');

const resources = {
  'en': {
    default: {
      'Name': 'Name',
      'Untitled': 'Untitled',
      'Id': 'Id',
      'Version': 'Latest Version',
      'PublishedVersion': 'Published Version',
      'Status': 'Status',
      'Published': 'Published',
      'Draft': 'Draft',
      'Properties': '{{name}} Properties'
    }
  },
  'zh-CN': {
    default: {
      'Name': '名称',
      'Untitled': '无题',
      'Id': 'Id',
      'Version': '最新版本',
      'PublishedVersion': '发布版本',
      'Status': '状态',
      'Published': '已发布',
      'Draft': '草稿',
      'Properties': '{{name}} 属性'
    }
  },
  'nl-NL': {
    default: {
      'Name': 'Naam',
      'Untitled': 'Untitled',
      'Id': 'Id',
      'Version': 'Laatste Versie',
      'PublishedVersion': 'Gepubliceerde Versie',
      'Status': 'Status',
      'Published': 'Published',
      'Draft': 'Draft',
      'Properties': '{{name}} Properties'
    }
  }
};

let ElsaWorkflowBlueprintPropertiesPanel = class {
  constructor(hostRef) {
    index.registerInstance(this, hostRef);
  }
  async workflowIdChangedHandler(newWorkflowId) {
    await this.loadWorkflowBlueprint(newWorkflowId);
    await this.loadPublishedVersion();
  }
  async componentWillLoad() {
    this.i18next = await i18nLoader.loadTranslations(this.culture, resources);
    await this.loadWorkflowBlueprint();
    await this.loadPublishedVersion();
  }
  render() {
    const t = (x, params) => this.i18next.t(x, params);
    const { workflowBlueprint } = this;
    const name = workflowBlueprint.name || this.i18next.t("Untitled");
    const { isPublished } = workflowBlueprint;
    return (index.h(index.Host, null, index.h("dl", { class: "elsa-border-b elsa-border-gray-200 elsa-divide-y elsa-divide-gray-200" }, index.h("div", { class: "elsa-py-3 elsa-flex elsa-justify-between elsa-text-sm elsa-font-medium" }, index.h("dt", { class: "elsa-text-gray-500" }, t('Name')), index.h("dd", { class: "elsa-text-gray-900" }, name)), index.h("div", { class: "elsa-py-3 elsa-flex elsa-justify-between elsa-text-sm elsa-font-medium" }, index.h("dt", { class: "elsa-text-gray-500" }, t('Id')), index.h("dd", { class: "elsa-text-gray-900 elsa-break-all" }, workflowBlueprint.id || '-')), index.h("div", { class: "elsa-py-3 elsa-flex elsa-justify-between elsa-text-sm elsa-font-medium" }, index.h("dt", { class: "elsa-text-gray-500" }, t('Version')), index.h("dd", { class: "elsa-text-gray-900" }, workflowBlueprint.version)), index.h("div", { class: "elsa-py-3 elsa-flex elsa-justify-between elsa-text-sm elsa-font-medium" }, index.h("dt", { class: "elsa-text-gray-500" }, t('PublishedVersion')), index.h("dd", { class: "elsa-text-gray-900" }, this.publishedVersion || '-')), index.h("div", { class: "elsa-py-3 elsa-flex elsa-justify-between elsa-text-sm elsa-font-medium" }, index.h("dt", { class: "elsa-text-gray-500" }, t('Status')), index.h("dd", { class: `${isPublished ? 'elsa-text-green-600' : 'elsa-text-yellow-700'}` }, isPublished ? t('Published') : t('Draft'))))));
  }
  createClient() {
    return elsaClient.createElsaClient(this.serverUrl);
  }
  async loadPublishedVersion() {
    const elsaClient = await this.createClient();
    const { workflowBlueprint } = this;
    if (workflowBlueprint.isPublished) {
      const publishedWorkflowDefinitions = await elsaClient.workflowDefinitionsApi.getMany([workflowBlueprint.id], { isPublished: true });
      const publishedDefinition = workflowBlueprint.isPublished ? workflowBlueprint : publishedWorkflowDefinitions.find(x => x.definitionId == workflowBlueprint.id);
      if (publishedDefinition) {
        this.publishedVersion = publishedDefinition.version;
      }
    }
    else {
      this.publishedVersion = 0;
    }
  }
  async loadWorkflowBlueprint(workflowId = this.workflowId) {
    const elsaClient = await this.createClient();
    this.workflowBlueprint = await elsaClient.workflowRegistryApi.get(workflowId, { isLatest: true });
  }
  static get watchers() { return {
    "workflowId": ["workflowIdChangedHandler"]
  }; }
};
dashboard.Tunnel.injectProps(ElsaWorkflowBlueprintPropertiesPanel, ['serverUrl', 'culture']);

exports.elsa_workflow_blueprint_properties_panel = ElsaWorkflowBlueprintPropertiesPanel;
