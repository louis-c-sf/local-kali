'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const index = require('./index-915b0bc2.js');
require('./domain-b01b4a53.js');
const elsaClient = require('./elsa-client-e99f1b35.js');
const utils = require('./utils-5d19a660.js');
require('./index-1eae61b2.js');
require('./cronstrue-62722667.js');
const injectHistory = require('./injectHistory-468c0e3d.js');
const i18nLoader = require('./i18n-loader-00eaf44a.js');
const intlMessage = require('./intl-message-8802ac57.js');
const dashboard = require('./dashboard-04b50b47.js');
require('./index-a2f6d9eb.js');
require('./axios-middleware.esm-f337c7ad.js');
require('./collection-724169f5.js');
require('./_commonjsHelpers-a5111d61.js');
require('./event-bus-8066af27.js');
require('./active-router-381b3b9a.js');
require('./state-tunnel-786a62ce.js');
require('./index-635081da.js');

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
    index.registerInstance(this, hostRef);
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
    this.i18next = await i18nLoader.loadTranslations(this.culture, resources);
    if (!!this.history)
      this.applyQueryString(this.history.location.search);
    await this.loadWorkflowDefinitions();
  }
  applyQueryString(queryString) {
    const query = utils.parseQuery(queryString);
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
    return elsaClient.createElsaClient(this.serverUrl);
  }
  render() {
    const workflowDefinitions = this.workflowDefinitions.items;
    const totalCount = this.workflowDefinitions.totalCount;
    const i18next = this.i18next;
    const IntlMessage = intlMessage.GetIntlMessage(i18next);
    const basePath = this.basePath;
    return (index.h("div", null, index.h("div", { class: "elsa-align-middle elsa-inline-block elsa-min-w-full elsa-border-b elsa-border-gray-200" }, index.h("table", { class: "elsa-min-w-full" }, index.h("thead", null, index.h("tr", { class: "elsa-border-t elsa-border-gray-200" }, index.h("th", { class: "elsa-px-6 elsa-py-3 elsa-border-b elsa-border-gray-200 elsa-bg-gray-50 elsa-text-left elsa-text-xs elsa-leading-4 elsa-font-medium elsa-text-gray-500 elsa-uppercase elsa-tracking-wider" }, index.h("span", { class: "lg:elsa-pl-2" }, index.h(IntlMessage, { label: "Name" }))), index.h("th", { class: "elsa-px-6 elsa-py-3 elsa-border-b elsa-border-gray-200 elsa-bg-gray-50 elsa-text-left elsa-text-xs elsa-leading-4 elsa-font-medium elsa-text-gray-500 elsa-uppercase elsa-tracking-wider" }, index.h(IntlMessage, { label: "Instances" })), index.h("th", { class: "hidden md:elsa-table-cell elsa-px-6 elsa-py-3 elsa-border-b elsa-border-gray-200 elsa-bg-gray-50 elsa-text-right elsa-text-xs elsa-leading-4 elsa-font-medium elsa-text-gray-500 elsa-uppercase elsa-tracking-wider" }, index.h(IntlMessage, { label: "LatestVersion" })), index.h("th", { class: "hidden md:elsa-table-cell elsa-px-6 elsa-py-3 elsa-border-b elsa-border-gray-200 elsa-bg-gray-50 elsa-text-right elsa-text-xs elsa-leading-4 elsa-font-medium elsa-text-gray-500 elsa-uppercase elsa-tracking-wider" }, index.h(IntlMessage, { label: "PublishedVersion" })), index.h("th", { class: "elsa-pr-6 elsa-py-3 elsa-border-b elsa-border-gray-200 elsa-bg-gray-50 elsa-text-right elsa-text-xs elsa-leading-4 elsa-font-medium elsa-text-gray-500 elsa-uppercase elsa-tracking-wider" }))), index.h("tbody", { class: "elsa-bg-white elsa-divide-y elsa-divide-gray-100" }, workflowDefinitions.map(workflowDefinition => {
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
      const editIcon = (index.h("svg", { class: "elsa-h-5 elsa-w-5 elsa-text-gray-500", width: "24", height: "24", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, index.h("path", { d: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" }), index.h("path", { d: "M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" })));
      const deleteIcon = (index.h("svg", { class: "elsa-h-5 elsa-w-5 elsa-text-gray-500", width: "24", height: "24", viewBox: "0 0 24 24", "stroke-width": "2", stroke: "currentColor", fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round" }, index.h("path", { stroke: "none", d: "M0 0h24v24H0z" }), index.h("line", { x1: "4", y1: "7", x2: "20", y2: "7" }), index.h("line", { x1: "10", y1: "11", x2: "10", y2: "17" }), index.h("line", { x1: "14", y1: "11", x2: "14", y2: "17" }), index.h("path", { d: "M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" }), index.h("path", { d: "M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" })));
      const publishIcon = (index.h("svg", { xmlns: "http://www.w3.org/2000/svg", class: "elsa-h-5 elsa-w-5 elsa-text-gray-500", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, index.h("path", { "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-width": "2", d: "M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" })));
      const unPublishIcon = (index.h("svg", { xmlns: "http://www.w3.org/2000/svg", class: "elsa-h-5 elsa-w-5 elsa-text-gray-500", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, index.h("path", { "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-width": "2", d: "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" })));
      return (index.h("tr", null, index.h("td", { class: "elsa-px-6 elsa-py-3 elsa-whitespace-no-wrap elsa-text-sm elsa-leading-5 elsa-font-medium elsa-text-gray-900" }, index.h("div", { class: "elsa-flex elsa-items-center elsa-space-x-3 lg:elsa-pl-2" }, index.h("stencil-route-link", { url: editUrl, anchorClass: "elsa-truncate hover:elsa-text-gray-600" }, index.h("span", null, workflowDisplayName)))), index.h("td", { class: "elsa-px-6 elsa-py-3 elsa-text-sm elsa-leading-5 elsa-text-gray-500 elsa-font-medium" }, index.h("div", { class: "elsa-flex elsa-items-center elsa-space-x-3 lg:elsa-pl-2" }, index.h("stencil-route-link", { url: instancesUrl, anchorClass: "elsa-truncate hover:elsa-text-gray-600" }, index.h(IntlMessage, { label: "Instances" })))), index.h("td", { class: "hidden md:elsa-table-cell elsa-px-6 elsa-py-3 elsa-whitespace-no-wrap elsa-text-sm elsa-leading-5 elsa-text-gray-500 elsa-text-right" }, latestVersionNumber), index.h("td", { class: "hidden md:elsa-table-cell elsa-px-6 elsa-py-3 elsa-whitespace-no-wrap elsa-text-sm elsa-leading-5 elsa-text-gray-500 elsa-text-right" }, publishedVersionNumber), index.h("td", { class: "elsa-pr-6" }, index.h("elsa-context-menu", { history: this.history, menuItems: [
          { text: i18next.t('Edit'), anchorUrl: editUrl, icon: editIcon },
          isPublished ? { text: i18next.t('Unpublish'), clickHandler: e => this.onUnPublishClick(e, workflowDefinition), icon: unPublishIcon } : {
            text: i18next.t('Publish'),
            clickHandler: e => this.onPublishClick(e, workflowDefinition),
            icon: publishIcon
          },
          { text: i18next.t('Delete'), clickHandler: e => this.onDeleteClick(e, workflowDefinition), icon: deleteIcon }
        ] }))));
    }))), index.h("elsa-pager", { page: this.currentPage, pageSize: this.currentPageSize, totalCount: totalCount, history: this.history, onPaged: this.onPaged, culture: this.culture })), index.h("elsa-confirm-dialog", { ref: el => this.confirmDialog = el, culture: this.culture })));
  }
};
ElsaWorkflowDefinitionsListScreen.DEFAULT_PAGE_SIZE = 15;
ElsaWorkflowDefinitionsListScreen.MIN_PAGE_SIZE = 5;
ElsaWorkflowDefinitionsListScreen.MAX_PAGE_SIZE = 100;
ElsaWorkflowDefinitionsListScreen.START_PAGE = 0;
dashboard.Tunnel.injectProps(ElsaWorkflowDefinitionsListScreen, ['serverUrl', 'culture', 'basePath']);
injectHistory.injectHistory(ElsaWorkflowDefinitionsListScreen);

exports.elsa_workflow_definitions_list_screen = ElsaWorkflowDefinitionsListScreen;
