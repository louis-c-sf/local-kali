import { r as registerInstance, h, H as Host } from './index-28e0f8fb.js';
import { l as loadTranslations } from './i18n-loader-0c9b01c7.js';
import './domain-a7b2c384.js';
import { a as createElsaClient } from './elsa-client-d55095c1.js';
import './utils-823f97c1.js';
import './index-f1836928.js';
import './cronstrue-69b0e3b3.js';
import { T as Tunnel } from './dashboard-c6e2b698.js';
import './index-b5781c88.js';
import './axios-middleware.esm-b5e3eb44.js';
import './collection-89937abc.js';
import './_commonjsHelpers-4ed75ef8.js';
import './event-bus-be6948e5.js';
import './state-tunnel-04c0b67a.js';

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
    registerInstance(this, hostRef);
  }
  async workflowIdChangedHandler(newWorkflowId) {
    await this.loadWorkflowBlueprint(newWorkflowId);
    await this.loadPublishedVersion();
  }
  async componentWillLoad() {
    this.i18next = await loadTranslations(this.culture, resources);
    await this.loadWorkflowBlueprint();
    await this.loadPublishedVersion();
  }
  render() {
    const t = (x, params) => this.i18next.t(x, params);
    const { workflowBlueprint } = this;
    const name = workflowBlueprint.name || this.i18next.t("Untitled");
    const { isPublished } = workflowBlueprint;
    return (h(Host, null, h("dl", { class: "elsa-border-b elsa-border-gray-200 elsa-divide-y elsa-divide-gray-200" }, h("div", { class: "elsa-py-3 elsa-flex elsa-justify-between elsa-text-sm elsa-font-medium" }, h("dt", { class: "elsa-text-gray-500" }, t('Name')), h("dd", { class: "elsa-text-gray-900" }, name)), h("div", { class: "elsa-py-3 elsa-flex elsa-justify-between elsa-text-sm elsa-font-medium" }, h("dt", { class: "elsa-text-gray-500" }, t('Id')), h("dd", { class: "elsa-text-gray-900 elsa-break-all" }, workflowBlueprint.id || '-')), h("div", { class: "elsa-py-3 elsa-flex elsa-justify-between elsa-text-sm elsa-font-medium" }, h("dt", { class: "elsa-text-gray-500" }, t('Version')), h("dd", { class: "elsa-text-gray-900" }, workflowBlueprint.version)), h("div", { class: "elsa-py-3 elsa-flex elsa-justify-between elsa-text-sm elsa-font-medium" }, h("dt", { class: "elsa-text-gray-500" }, t('PublishedVersion')), h("dd", { class: "elsa-text-gray-900" }, this.publishedVersion || '-')), h("div", { class: "elsa-py-3 elsa-flex elsa-justify-between elsa-text-sm elsa-font-medium" }, h("dt", { class: "elsa-text-gray-500" }, t('Status')), h("dd", { class: `${isPublished ? 'elsa-text-green-600' : 'elsa-text-yellow-700'}` }, isPublished ? t('Published') : t('Draft'))))));
  }
  createClient() {
    return createElsaClient(this.serverUrl);
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
Tunnel.injectProps(ElsaWorkflowBlueprintPropertiesPanel, ['serverUrl', 'culture']);

export { ElsaWorkflowBlueprintPropertiesPanel as elsa_workflow_blueprint_properties_panel };
