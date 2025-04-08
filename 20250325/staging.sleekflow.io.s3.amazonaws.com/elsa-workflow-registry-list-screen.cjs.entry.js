'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const index = require('./index-915b0bc2.js');
const collection = require('./collection-724169f5.js');
const eventBus = require('./event-bus-8066af27.js');
require('./domain-b01b4a53.js');
const axiosMiddleware_esm = require('./axios-middleware.esm-f337c7ad.js');
const elsaClient = require('./elsa-client-e99f1b35.js');
const utils = require('./utils-5d19a660.js');
require('./index-1eae61b2.js');
require('./cronstrue-62722667.js');
const injectHistory = require('./injectHistory-468c0e3d.js');
const dashboard = require('./dashboard-04b50b47.js');
const models = require('./models-90b8025e.js');
require('./_commonjsHelpers-a5111d61.js');
require('./index-a2f6d9eb.js');
require('./active-router-381b3b9a.js');
require('./state-tunnel-786a62ce.js');

let ElsaWorkflowRegistryListScreen = class {
  constructor(hostRef) {
    index.registerInstance(this, hostRef);
    this.currentProviderName = "ProgrammaticWorkflowProvider";
    this.workflowProviders = [];
    this.workflowBlueprints = { items: [], page: 1, pageSize: 50, totalCount: 0 };
    this.currentPage = 0;
    this.currentPageSize = ElsaWorkflowRegistryListScreen.DEFAULT_PAGE_SIZE;
    this.workflowRegistryColumns = {
      data: null
    };
    this.onPaged = async (e) => {
      this.currentPage = e.detail.page;
      await this.loadWorkflowBlueprints();
    };
  }
  async componentWillLoad() {
    await this.loadWorkflowProviders();
    if (!!this.history)
      this.applyQueryString(this.history.location.search);
    await this.loadWorkflowBlueprints();
    await eventBus.eventBus.emit(axiosMiddleware_esm.EventTypes.WorkflowRegistryLoadingColumns, this, this.workflowRegistryColumns);
  }
  connectedCallback() {
    if (!!this.history)
      this.unlistenRouteChanged = this.history.listen(e => this.routeChanged(e));
    eventBus.eventBus.on(axiosMiddleware_esm.EventTypes.WorkflowUpdated, this.onLoadWorkflowBlueprints);
    eventBus.eventBus.on(axiosMiddleware_esm.EventTypes.WorkflowRegistryUpdated, this.onLoadWorkflowBlueprints);
  }
  disconnectedCallback() {
    if (!!this.unlistenRouteChanged)
      this.unlistenRouteChanged();
    eventBus.eventBus.detach(axiosMiddleware_esm.EventTypes.WorkflowUpdated, this.onLoadWorkflowBlueprints);
    eventBus.eventBus.detach(axiosMiddleware_esm.EventTypes.WorkflowRegistryUpdated, this.onLoadWorkflowBlueprints);
  }
  applyQueryString(queryString) {
    const query = utils.parseQuery(queryString);
    if (!!query.provider)
      this.currentProviderName = query.provider;
    this.currentPage = !!query.page ? parseInt(query.page) : 0;
    this.currentPage = isNaN(this.currentPage) ? ElsaWorkflowRegistryListScreen.START_PAGE : this.currentPage;
    this.currentPageSize = !!query.pageSize ? parseInt(query.pageSize) : ElsaWorkflowRegistryListScreen.DEFAULT_PAGE_SIZE;
    this.currentPageSize = isNaN(this.currentPageSize) ? ElsaWorkflowRegistryListScreen.DEFAULT_PAGE_SIZE : this.currentPageSize;
    this.currentPageSize = Math.max(Math.min(this.currentPageSize, ElsaWorkflowRegistryListScreen.MAX_PAGE_SIZE), ElsaWorkflowRegistryListScreen.MIN_PAGE_SIZE);
  }
  async routeChanged(e) {
    if (!e.pathname.toLowerCase().endsWith('workflow-registry'))
      return;
    this.applyQueryString(e.search);
    await this.loadWorkflowBlueprints();
  }
  async onDisableWorkflowClick(e, workflowBlueprintId) {
    const result = await this.confirmDialog.show('Disable Workflow', 'Are you sure you wish to disable this workflow?');
    if (!result)
      return;
    await this.updateFeature(workflowBlueprintId, 'disabled', 'true');
  }
  async onEnableWorkflowClick(e, workflowBlueprintId) {
    const result = await this.confirmDialog.show('Enable Workflow', 'Are you sure you wish to enable this workflow?');
    if (!result)
      return;
    await this.updateFeature(workflowBlueprintId, 'disabled', 'false');
  }
  async updateFeature(workflowBlueprintId, key, value) {
    const workflowRegistryUpdating = {
      params: [workflowBlueprintId, key, value]
    };
    await eventBus.eventBus.emit(axiosMiddleware_esm.EventTypes.WorkflowRegistryUpdating, this, workflowRegistryUpdating);
  }
  async onLoadWorkflowBlueprints() {
    await this.loadWorkflowBlueprints();
  }
  async onWorkflowProviderChanged(value) {
    this.currentProviderName = value;
    this.currentPage = 0;
    await this.loadWorkflowBlueprints();
  }
  async loadWorkflowProviders() {
    const elsaClient = await this.createClient();
    this.workflowProviders = await elsaClient.workflowProvidersApi.list();
    this.currentProviderName = this.workflowProviders.length > 0 ? this.workflowProviders[0].name : undefined;
  }
  async loadWorkflowBlueprints() {
    const elsaClient = await this.createClient();
    const page = this.currentPage;
    const pageSize = this.currentPageSize;
    const versionOptions = { isLatest: true };
    const providerName = this.currentProviderName;
    this.workflowBlueprints = await elsaClient.workflowRegistryApi.list(providerName, page, pageSize, versionOptions);
  }
  createClient() {
    return elsaClient.createElsaClient(this.serverUrl);
  }
  render() {
    const workflowBlueprints = this.workflowBlueprints.items;
    const totalCount = this.workflowBlueprints.totalCount;
    const groupings = collection.collection.groupBy(workflowBlueprints, 'id');
    const basePath = this.basePath;
    let headers = this.workflowRegistryColumns.data != null ? this.workflowRegistryColumns.data.headers : [];
    let hasFeatureContextItems = this.workflowRegistryColumns.data != null ? this.workflowRegistryColumns.data.hasContextItems : false;
    const renderFeatureHeader = (item) => {
      return (index.h("th", { class: "hidden md:elsa-table-cell elsa-px-6 elsa-py-3 elsa-border-b elsa-border-gray-200 elsa-bg-gray-50 elsa-text-xs elsa-leading-4 elsa-font-medium elsa-text-gray-500 elsa-text-right elsa-uppercase elsa-tracking-wider" }, item[0]));
    };
    const renderFeatureColumn = (item, isWorkflowBlueprintDisabled) => {
      return (index.h("td", { class: "hidden md:elsa-table-cell elsa-px-6 elsa-py-3 elsa-whitespace-no-wrap elsa-text-sm elsa-leading-5 elsa-text-gray-500 elsa-text-right" }, isWorkflowBlueprintDisabled ? 'No' : 'Yes'));
    };
    const renderContextMenu = (workflowBlueprintId, isWorkflowBlueprintDisabled, history, editUrl, editIcon, enableIcon, disableIcon) => {
      let menuItems = [];
      menuItems = [...menuItems, ...[{ text: 'Edit', anchorUrl: editUrl, icon: editIcon }]];
      if (hasFeatureContextItems) {
        if (isWorkflowBlueprintDisabled)
          menuItems = [...menuItems, ...[{
                text: 'Enable',
                clickHandler: e => this.onEnableWorkflowClick(e, workflowBlueprintId),
                icon: enableIcon
              }]];
        else
          menuItems = [...menuItems, ...[{
                text: 'Disable',
                clickHandler: e => this.onDisableWorkflowClick(e, workflowBlueprintId),
                icon: disableIcon
              }]];
      }
      return (index.h("td", { class: "elsa-pr-6" }, index.h("elsa-context-menu", { history: history, menuItems: menuItems })));
    };
    return (index.h("div", null, index.h("div", { class: "elsa-p-8 elsa-flex elsa-content-end elsa-justify-right elsa-bg-white elsa-space-x-4" }, index.h("div", { class: "elsa-flex-shrink-0" }, this.renderWorkflowProviderFilter())), index.h("div", { class: "elsa-align-middle elsa-inline-block elsa-min-w-full elsa-border-b elsa-border-gray-200" }, index.h("table", { class: "elsa-min-w-full" }, index.h("thead", null, index.h("tr", { class: "elsa-border-t elsa-border-gray-200" }, index.h("th", { class: "elsa-px-6 elsa-py-3 elsa-border-b elsa-border-gray-200 elsa-bg-gray-50 elsa-text-left elsa-text-xs elsa-leading-4 elsa-font-medium elsa-text-gray-500 elsa-text-left elsa-uppercase elsa-tracking-wider" }, index.h("span", { class: "lg:elsa-pl-2" }, "Name")), index.h("th", { class: "elsa-px-6 elsa-py-3 elsa-border-b elsa-border-gray-200 elsa-bg-gray-50 elsa-text-left elsa-text-xs elsa-leading-4 elsa-font-medium elsa-text-gray-500 elsa-text-left elsa-uppercase elsa-tracking-wider" }, "Instances"), index.h("th", { class: "hidden md:elsa-table-cell elsa-px-6 elsa-py-3 elsa-border-b elsa-border-gray-200 elsa-bg-gray-50 elsa-text-xs elsa-leading-4 elsa-font-medium elsa-text-gray-500 elsa-text-right elsa-uppercase elsa-tracking-wider" }, "Latest Version"), index.h("th", { class: "hidden md:elsa-table-cell elsa-px-6 elsa-py-3 elsa-border-b elsa-border-gray-200 elsa-bg-gray-50 elsa-text-xs elsa-leading-4 elsa-font-medium elsa-text-gray-500 elsa-text-right elsa-uppercase elsa-tracking-wider" }, "Published Version"), headers.map(item => renderFeatureHeader(item)), index.h("th", { class: "elsa-pr-6 elsa-py-3 elsa-border-b elsa-border-gray-200 elsa-bg-gray-50 elsa-text-xs elsa-leading-4 elsa-font-medium elsa-text-gray-500 elsa-text-left elsa-uppercase elsa-tracking-wider" }))), index.h("tbody", { class: "elsa-bg-white elsa-divide-y elsa-divide-gray-100" }, collection.collection.map(groupings, group => {
      const versions = collection.collection.orderBy(group, 'version', 'desc');
      const workflowBlueprint = versions[0];
      const latestVersionNumber = workflowBlueprint.version;
      const publishedVersion = versions.find(x => x.isPublished);
      const publishedVersionNumber = !!publishedVersion ? publishedVersion.version : '-';
      let workflowDisplayName = workflowBlueprint.displayName;
      if (!workflowDisplayName || workflowDisplayName.trim().length == 0)
        workflowDisplayName = workflowBlueprint.name;
      if (!workflowDisplayName || workflowDisplayName.trim().length == 0)
        workflowDisplayName = '(Untitled)';
      const editUrl = `${basePath}/workflow-registry/${workflowBlueprint.id}`;
      const instancesUrl = `${basePath}/workflow-instances?workflow=${workflowBlueprint.id}`;
      const editIcon = (index.h("svg", { class: "elsa-h-5 elsa-w-5 elsa-text-gray-500", width: "24", height: "24", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }, index.h("path", { d: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" }), index.h("path", { d: "M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" })));
      const enableIcon = (index.h("svg", { class: "elsa-h-5 elsa-w-5 elsa-text-gray-500", width: "24", height: "24", viewBox: "0 0 24 24", "stroke-width": "2", stroke: "currentColor", fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round" }, index.h("path", { stroke: "none", d: "M0 0h24v24H0z" }), index.h("path", { d: "M5 12l5 5l10 -10" })));
      const disableIcon = (index.h("svg", { class: "elsa-h-5 elsa-w-5 elsa-text-gray-500", width: "24", height: "24", viewBox: "0 0 24 24", "stroke-width": "2", stroke: "currentColor", fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round" }, index.h("path", { stroke: "none", d: "M0 0h24v24H0z" }), index.h("circle", { cx: "12", cy: "12", r: "9" }), index.h("line", { x1: "5.7", y1: "5.7", x2: "18.3", y2: "18.3" })));
      return (index.h("tr", null, index.h("td", { class: "elsa-px-6 elsa-py-3 elsa-whitespace-no-wrap elsa-text-sm elsa-leading-5 elsa-font-medium elsa-text-gray-900" }, index.h("div", { class: "elsa-flex elsa-items-center elsa-space-x-3 lg:elsa-pl-2" }, index.h("stencil-route-link", { url: editUrl, anchorClass: "elsa-truncate hover:elsa-text-gray-600" }, index.h("span", null, workflowDisplayName)))), index.h("td", { class: "elsa-px-6 elsa-py-3 elsa-text-sm elsa-leading-5 elsa-text-gray-500 elsa-font-medium" }, index.h("div", { class: "elsa-flex elsa-items-center elsa-space-x-3 lg:elsa-pl-2" }, index.h("stencil-route-link", { url: instancesUrl, anchorClass: "elsa-truncate hover:elsa-text-gray-600" }, "Instances"))), index.h("td", { class: "hidden md:elsa-table-cell elsa-px-6 elsa-py-3 elsa-whitespace-no-wrap elsa-text-sm elsa-leading-5 elsa-text-gray-500 elsa-text-right" }, latestVersionNumber), index.h("td", { class: "hidden md:elsa-table-cell elsa-px-6 elsa-py-3 elsa-whitespace-no-wrap elsa-text-sm elsa-leading-5 elsa-text-gray-500 elsa-text-right" }, publishedVersionNumber), headers.map(item => renderFeatureColumn(item, workflowBlueprint.isDisabled)), renderContextMenu(workflowBlueprint.id, workflowBlueprint.isDisabled, this.history, editUrl, editIcon, enableIcon, disableIcon)));
    }))), index.h("elsa-pager", { page: this.currentPage, pageSize: this.currentPageSize, totalCount: totalCount, history: this.history, onPaged: this.onPaged, culture: this.culture })), index.h("elsa-confirm-dialog", { ref: el => this.confirmDialog = el })));
  }
  renderWorkflowProviderFilter() {
    const items = this.workflowProviders.map(x => ({ text: x.displayName, value: x.name }));
    const selectedProvider = this.workflowProviders.find(x => x.name == this.currentProviderName);
    const selectedProviderText = (selectedProvider === null || selectedProvider === void 0 ? void 0 : selectedProvider.displayName) || '';
    const renderIcon = function () {
      return index.h("svg", { class: "elsa-mr-3 elsa-h-5 elsa-w-5 elsa-text-gray-400", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, index.h("path", { stroke: "none", d: "M0 0h24v24H0z" }), index.h("rect", { x: "4", y: "4", width: "6", height: "6", rx: "1" }), index.h("rect", { x: "14", y: "4", width: "6", height: "6", rx: "1" }), index.h("rect", { x: "4", y: "14", width: "6", height: "6", rx: "1" }), index.h("rect", { x: "14", y: "14", width: "6", height: "6", rx: "1" }));
    };
    return index.h("elsa-dropdown-button", { text: selectedProviderText, items: items, icon: renderIcon(), origin: models.DropdownButtonOrigin.TopRight, onItemSelected: e => this.onWorkflowProviderChanged(e.detail.value) });
  }
};
ElsaWorkflowRegistryListScreen.DEFAULT_PAGE_SIZE = 5;
ElsaWorkflowRegistryListScreen.MIN_PAGE_SIZE = 5;
ElsaWorkflowRegistryListScreen.MAX_PAGE_SIZE = 100;
ElsaWorkflowRegistryListScreen.START_PAGE = 0;
dashboard.Tunnel.injectProps(ElsaWorkflowRegistryListScreen, ['serverUrl', 'culture', 'basePath']);
injectHistory.injectHistory(ElsaWorkflowRegistryListScreen);

exports.elsa_workflow_registry_list_screen = ElsaWorkflowRegistryListScreen;
