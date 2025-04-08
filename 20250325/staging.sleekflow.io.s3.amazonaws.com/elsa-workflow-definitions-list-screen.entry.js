import { r as registerInstance, h } from './index-28e0f8fb.js';
import './domain-a7b2c384.js';
import { a as createElsaClient } from './elsa-client-d55095c1.js';
import { b as parseQuery } from './utils-823f97c1.js';
import './index-f1836928.js';
import './cronstrue-69b0e3b3.js';
import { i as injectHistory } from './injectHistory-67aecf6c.js';
import { l as loadTranslations } from './i18n-loader-0c9b01c7.js';
import { G as GetIntlMessage } from './intl-message-ad298684.js';
import { T as Tunnel } from './dashboard-c6e2b698.js';
import './index-b5781c88.js';
import './axios-middleware.esm-b5e3eb44.js';
import './collection-89937abc.js';
import './_commonjsHelpers-4ed75ef8.js';
import './event-bus-be6948e5.js';
import './active-router-3a675f01.js';
import './state-tunnel-04c0b67a.js';
import './index-fe375cc0.js';

const resources = {
  'en': {
    'default': {
      'Name': 'Name',
      'Instances': 'Instances',
      'LatestVersion': 'Latest Version',
      'PublishedVersion': 'Published Version',
      'Edit': 'Edit',
      'Delete': 'Delete',
      'DeleteConfirmationModel': {
        'Title': 'Delete Workflow Definition',
        'Message': 'Are you sure you wish to permanently delete this workflow, including all of its workflow instances?'
      }
    }
  },
  'zh-CN': {
    'default': {
      'Name': '名称',
      'Instances': '实例',
      'LatestVersion': '最新版本',
      'PublishedVersion': '发布版本',
      'Edit': '编辑',
      'Delete': '删除',
      'DeleteConfirmationModel': {
        'Title': '删除工作流程定义',
        'Message': '你确定要永久删除这个工作流程，包括它的所有工作流程实例？'
      }
    }
  },
  'nl-NL': {
    'default': {
      'Name': 'Naam',
      'Instances': 'Instanties',
      'LatestVersion': 'Laatste Versie',
      'PublishedVersion': 'Gepubliceerde Versie',
      'Edit': 'Bewerken',
      'Delete': 'Verwijderen',
      'DeleteConfirmationModel': {
        'Title': 'Verwijder Workflow Definitie',
        'Message': 'Weet je zeker dat je deze workflow permanent wilt verwijderen, inclusief alle bijbehorende workflow instanties?'
      }
    }
  }
};

let ElsaWorkflowDefinitionsListScreen = class {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.workflowDefinitions = { items: [], page: 1, pageSize: 50, totalCount: 0 };
    this.publishedWorkflowDefinitions = [];
    this.currentPage = 0;
    this.currentPageSize = ElsaWorkflowDefinitionsListScreen.DEFAULT_PAGE_SIZE;
    this.onPaged = async (e) => {
      this.currentPage = e.detail.page;
      await this.loadWorkflowDefinitions();
    };
  }
  connectedCallback() {
    if (!!this.history)
      this.clearRouteChangedListeners = this.history.listen(e => this.routeChanged(e));
  }
  disconnectedCallback() {
    if (!!this.clearRouteChangedListeners)
      this.clearRouteChangedListeners();
  }
  async componentWillLoad() {
    this.i18next = await loadTranslations(this.culture, resources);
    if (!!this.history)
      this.applyQueryString(this.history.location.search);
    await this.loadWorkflowDefinitions();
  }
  applyQueryString(queryString) {
    const query = parseQuery(queryString);
    this.currentPage = !!query.page ? parseInt(query.page) : 0;
    this.currentPage = isNaN(this.currentPage) ? ElsaWorkflowDefinitionsListScreen.START_PAGE : this.currentPage;
    this.currentPageSize = !!query.pageSize ? parseInt(query.pageSize) : ElsaWorkflowDefinitionsListScreen.DEFAULT_PAGE_SIZE;
    this.currentPageSize = isNaN(this.currentPageSize) ? ElsaWorkflowDefinitionsListScreen.DEFAULT_PAGE_SIZE : this.currentPageSize;
    this.currentPageSize = Math.max(Math.min(this.currentPageSize, ElsaWorkflowDefinitionsListScreen.MAX_PAGE_SIZE), ElsaWorkflowDefinitionsListScreen.MIN_PAGE_SIZE);
  }
  async onPublishClick(e, workflowDefinition) {
    const elsaClient = await this.createClient();
    await elsaClient.workflowDefinitionsApi.publish(workflowDefinition.definitionId);
    await this.loadWorkflowDefinitions();
  }
  async onUnPublishClick(e, workflowDefinition) {
    const elsaClient = await this.createClient();
    await elsaClient.workflowDefinitionsApi.retract(workflowDefinition.definitionId);
    await this.loadWorkflowDefinitions();
  }
  async onDeleteClick(e, workflowDefinition) {
    const t = x => this.i18next.t(x);
    const result = await this.confirmDialog.show(t('DeleteConfirmationModel.Title'), t('DeleteConfirmationModel.Message'));
    if (!result)
      return;
    const elsaClient = await this.createClient();
    await elsaClient.workflowDefinitionsApi.delete(workflowDefinition.definitionId, { allVersions: true });
    await this.loadWorkflowDefinitions();
  }
  async routeChanged(e) {
    if (!e.pathname.toLowerCase().endsWith('workflow-definitions'))
      return;
    this.applyQueryString(e.search);
    await this.loadWorkflowDefinitions();
  }
  async loadWorkflowDefinitions() {
    const elsaClient = await this.createClient();
    const page = this.currentPage;
    const pageSize = this.currentPageSize;
    const latestVersionOptions = { isLatest: true };
    const publishedVersionOptions = { isPublished: true };
    const latestWorkflowDefinitions = await elsaClient.workflowDefinitionsApi.list(page, pageSize, latestVersionOptions);
    const publishedWorkflowDefinitionIds = latestWorkflowDefinitions.items.filter(x => x.isPublished).map(x => x.definitionId);
    this.publishedWorkflowDefinitions = await elsaClient.workflowDefinitionsApi.getMany(publishedWorkflowDefinitionIds, publishedVersionOptions);
    this.workflowDefinitions = latestWorkflowDefinitions;
  }
  createClient() {
    return createElsaClient(this.serverUrl);
  }
  render() {
    const workflowDefinitions = this.workflowDefinitions.items;
    const totalCount = this.workflowDefinitions.totalCount;
    const i18next = this.i18next;
    const IntlMessage = GetIntlMessage(i18next);
    const basePath = this.basePath;
    return (h("div", null, h("div", { class: "elsa-align-middle elsa-inline-block elsa-min-w-full elsa-border-b elsa-border-gray-200" }, h("table", { class: "elsa-min-w-full" }, h("thead", null, h("tr", { class: "elsa-border-t elsa-border-gray-200" }, h("th", { class: "elsa-px-6 elsa-py-3 elsa-border-b elsa-border-gray-200 elsa-bg-gray-50 elsa-text-left elsa-text-xs elsa-leading-4 elsa-font-medium elsa-text-gray-500 elsa-uppercase elsa-tracking-wider" }, h("span", { class: "lg:elsa-pl-2" }, h(IntlMessage, { label: "Name" }))), h("th", { class: "elsa-px-6 elsa-py-3 elsa-border-b elsa-border-gray-200 elsa-bg-gray-50 elsa-text-left elsa-text-xs elsa-leading-4 elsa-font-medium elsa-text-gray-500 elsa-uppercase elsa-tracking-wider" }, h(IntlMessage, { label: "Instances" })), h("th", { class: "hidden md:elsa-table-cell elsa-px-6 elsa-py-3 elsa-border-b elsa-border-gray-200 elsa-bg-gray-50 elsa-text-right elsa-text-xs elsa-leading-4 elsa-font-medium elsa-text-gray-500 elsa-uppercase elsa-tracking-wider" }, h(IntlMessage, { label: "LatestVersion" })), h("th", { class: "hidden md:elsa-table-cell elsa-px-6 elsa-py-3 elsa-border-b elsa-border-gray-200 elsa-bg-gray-50 elsa-text-right elsa-text-xs elsa-leading-4 elsa-font-medium elsa-text-gray-500 elsa-uppercase elsa-tracking-wider" }, h(IntlMessage, { label: "PublishedVersion" })), h("th", { class: "elsa-pr-6 elsa-py-3 elsa-border-b elsa-border-gray-200 elsa-bg-gray-50 elsa-text-right elsa-text-xs elsa-leading-4 elsa-font-medium elsa-text-gray-500 elsa-uppercase elsa-tracking-wider" }))), h("tbody", { class: "elsa-bg-white elsa-divide-y elsa-divide-gray-100" }, workflowDefinitions.map(workflowDefinition => {
      const latestVersionNumber = workflowDefinition.version;
      const { isPublished } = workflowDefinition;
      const publishedVersion = isPublished ? workflowDefinition : this.publishedWorkflowDefinitions.find(x => x.definitionId == workflowDefinition.definitionId);
      const publishedVersionNumber = !!publishedVersion ? publishedVersion.version : '-';
      let workflowDisplayName = workflowDefinition.displayName;
      if (!workflowDisplayName || workflowDisplayName.trim().length == 0)
        workflowDisplayName = workflowDefinition.name;
      if (!workflowDisplayName || workflowDisplayName.trim().length == 0)
        workflowDisplayName = 'Untitled';
      const editUrl = `${basePath}/workflow-definitions/${workflowDefinition.definitionId}`;
      const instancesUrl = `${basePath}/workflow-instances?workflow=${workflowDefinition.definitionId}`;
      const editIcon = (h("svg", { class: "elsa-h-5 elsa-w-5 elsa-text-gray-500", width: "24", height: "24", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, h("path", { d: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" }), h("path", { d: "M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" })));
      const deleteIcon = (h("svg", { class: "elsa-h-5 elsa-w-5 elsa-text-gray-500", width: "24", height: "24", viewBox: "0 0 24 24", "stroke-width": "2", stroke: "currentColor", fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round" }, h("path", { stroke: "none", d: "M0 0h24v24H0z" }), h("line", { x1: "4", y1: "7", x2: "20", y2: "7" }), h("line", { x1: "10", y1: "11", x2: "10", y2: "17" }), h("line", { x1: "14", y1: "11", x2: "14", y2: "17" }), h("path", { d: "M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" }), h("path", { d: "M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" })));
      const publishIcon = (h("svg", { xmlns: "http://www.w3.org/2000/svg", class: "elsa-h-5 elsa-w-5 elsa-text-gray-500", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, h("path", { "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-width": "2", d: "M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" })));
      const unPublishIcon = (h("svg", { xmlns: "http://www.w3.org/2000/svg", class: "elsa-h-5 elsa-w-5 elsa-text-gray-500", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, h("path", { "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-width": "2", d: "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" })));
      return (h("tr", null, h("td", { class: "elsa-px-6 elsa-py-3 elsa-whitespace-no-wrap elsa-text-sm elsa-leading-5 elsa-font-medium elsa-text-gray-900" }, h("div", { class: "elsa-flex elsa-items-center elsa-space-x-3 lg:elsa-pl-2" }, h("stencil-route-link", { url: editUrl, anchorClass: "elsa-truncate hover:elsa-text-gray-600" }, h("span", null, workflowDisplayName)))), h("td", { class: "elsa-px-6 elsa-py-3 elsa-text-sm elsa-leading-5 elsa-text-gray-500 elsa-font-medium" }, h("div", { class: "elsa-flex elsa-items-center elsa-space-x-3 lg:elsa-pl-2" }, h("stencil-route-link", { url: instancesUrl, anchorClass: "elsa-truncate hover:elsa-text-gray-600" }, h(IntlMessage, { label: "Instances" })))), h("td", { class: "hidden md:elsa-table-cell elsa-px-6 elsa-py-3 elsa-whitespace-no-wrap elsa-text-sm elsa-leading-5 elsa-text-gray-500 elsa-text-right" }, latestVersionNumber), h("td", { class: "hidden md:elsa-table-cell elsa-px-6 elsa-py-3 elsa-whitespace-no-wrap elsa-text-sm elsa-leading-5 elsa-text-gray-500 elsa-text-right" }, publishedVersionNumber), h("td", { class: "elsa-pr-6" }, h("elsa-context-menu", { history: this.history, menuItems: [
          { text: i18next.t('Edit'), anchorUrl: editUrl, icon: editIcon },
          isPublished ? { text: i18next.t('Unpublish'), clickHandler: e => this.onUnPublishClick(e, workflowDefinition), icon: unPublishIcon } : {
            text: i18next.t('Publish'),
            clickHandler: e => this.onPublishClick(e, workflowDefinition),
            icon: publishIcon
          },
          { text: i18next.t('Delete'), clickHandler: e => this.onDeleteClick(e, workflowDefinition), icon: deleteIcon }
        ] }))));
    }))), h("elsa-pager", { page: this.currentPage, pageSize: this.currentPageSize, totalCount: totalCount, history: this.history, onPaged: this.onPaged, culture: this.culture })), h("elsa-confirm-dialog", { ref: el => this.confirmDialog = el, culture: this.culture })));
  }
};
ElsaWorkflowDefinitionsListScreen.DEFAULT_PAGE_SIZE = 15;
ElsaWorkflowDefinitionsListScreen.MIN_PAGE_SIZE = 5;
ElsaWorkflowDefinitionsListScreen.MAX_PAGE_SIZE = 100;
ElsaWorkflowDefinitionsListScreen.START_PAGE = 0;
Tunnel.injectProps(ElsaWorkflowDefinitionsListScreen, ['serverUrl', 'culture', 'basePath']);
injectHistory(ElsaWorkflowDefinitionsListScreen);

export { ElsaWorkflowDefinitionsListScreen as elsa_workflow_definitions_list_screen };
