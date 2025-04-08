import { Component, h, Method, Prop, State, Watch } from '@stencil/core';
import { injectHistory } from "@stencil/router";
import * as collection from 'lodash/collection';
import * as array from 'lodash/array';
import { confirmDialogService, createElsaClient, eventBus } from "../../../../services";
import { EventTypes, OrderBy, WorkflowStatus } from "../../../../models";
import { DropdownButtonOrigin } from "../../../controls/elsa-dropdown-button/models";
import { parseQuery } from '../../../../utils/utils';
import moment from "moment";
import { resources } from "./localizations";
import { loadTranslations } from "../../../i18n/i18n-loader";
import Tunnel from "../../../../data/dashboard";
export class ElsaWorkflowInstanceListScreen {
  constructor() {
    this.orderBy = OrderBy.Started;
    this.workflowBlueprints = [];
    this.workflowInstances = { items: [], page: 1, pageSize: 50, totalCount: 0 };
    this.selectedOrderByState = OrderBy.Started;
    this.selectedWorkflowInstanceIds = [];
    this.currentPage = 0;
    this.currentPageSize = ElsaWorkflowInstanceListScreen.DEFAULT_PAGE_SIZE;
    this.t = (key, options) => this.i18next.t(key, options);
    this.getSelectAllState = () => {
      const { items } = this.workflowInstances;
      for (let i = 0; i < items.length; i++) {
        if (!this.selectedWorkflowInstanceIds.includes(items[i].id)) {
          return false;
        }
      }
      return true;
    };
    this.setSelectAllIndeterminateState = () => {
      if (this.selectAllCheckboxEl) {
        const selectedItems = this.workflowInstances.items.filter(item => this.selectedWorkflowInstanceIds.includes(item.id));
        this.selectAllCheckboxEl.indeterminate = selectedItems.length != 0 && selectedItems.length != this.workflowInstances.items.length;
      }
    };
    this.onPaged = async (e) => {
      this.currentPage = e.detail.page;
      await this.loadWorkflowInstances();
    };
  }
  connectedCallback() {
    if (!!this.history)
      this.unlistenRouteChanged = this.history.listen(e => this.routeChanged(e));
  }
  disconnectedCallback() {
    if (!!this.unlistenRouteChanged)
      this.unlistenRouteChanged();
  }
  async componentWillLoad() {
    this.i18next = await loadTranslations(this.culture, resources);
    this.selectedWorkflowId = this.workflowId;
    this.selectedCorrelationId = this.correlationId;
    this.selectedWorkflowStatus = this.workflowStatus;
    this.selectedOrderByState = this.orderBy;
    if (!!this.history)
      this.applyQueryString(this.history.location.search);
    await this.loadWorkflowBlueprints();
    await this.loadWorkflowInstances();
    const t = this.t;
    let bulkActions = [{
        text: t('BulkActions.Actions.Cancel'),
        name: 'Cancel',
      }, {
        text: t('BulkActions.Actions.Delete'),
        name: 'Delete',
      }, {
        text: t('BulkActions.Actions.Retry'),
        name: 'Retry',
      }];
    await eventBus.emit(EventTypes.WorkflowInstanceBulkActionsLoading, this, { sender: this, bulkActions });
    this.bulkActions = bulkActions;
  }
  async getSelectedWorkflowInstanceIds() {
    return this.selectedWorkflowInstanceIds;
  }
  async refresh() {
    await this.loadWorkflowInstances();
    this.updateSelectAllChecked();
  }
  async handleWorkflowIdChanged(value) {
    this.selectedWorkflowId = value;
    await this.loadWorkflowInstances();
  }
  async handleCorrelationIdChanged(value) {
    this.selectedCorrelationId = value;
    await this.loadWorkflowInstances();
  }
  async handleWorkflowStatusChanged(value) {
    this.selectedWorkflowStatus = value;
    await this.loadWorkflowInstances();
  }
  async handlePageSizeChanged(value) {
    this.currentPageSize = value;
    this.currentPageSize = isNaN(this.currentPageSize) ? ElsaWorkflowInstanceListScreen.DEFAULT_PAGE_SIZE : this.currentPageSize;
    this.currentPageSize = Math.max(Math.min(this.currentPageSize, ElsaWorkflowInstanceListScreen.MAX_PAGE_SIZE), ElsaWorkflowInstanceListScreen.MIN_PAGE_SIZE);
    await this.loadWorkflowInstances();
  }
  async handleOrderByChanged(value) {
    this.selectedOrderByState = value;
    await this.loadWorkflowInstances();
  }
  applyQueryString(queryString) {
    var _a;
    const query = parseQuery(queryString);
    this.selectedWorkflowId = query.workflow;
    this.correlationId = query.correlationId;
    this.selectedWorkflowStatus = query.status;
    this.selectedOrderByState = (_a = query.orderBy) !== null && _a !== void 0 ? _a : OrderBy.Started;
    this.currentPage = !!query.page ? parseInt(query.page) : 0;
    this.currentPage = isNaN(this.currentPage) ? ElsaWorkflowInstanceListScreen.START_PAGE : this.currentPage;
    this.currentPageSize = !!query.pageSize ? parseInt(query.pageSize) : ElsaWorkflowInstanceListScreen.DEFAULT_PAGE_SIZE;
    this.currentPageSize = isNaN(this.currentPageSize) ? ElsaWorkflowInstanceListScreen.DEFAULT_PAGE_SIZE : this.currentPageSize;
    this.currentPageSize = Math.max(Math.min(this.currentPageSize, ElsaWorkflowInstanceListScreen.MAX_PAGE_SIZE), ElsaWorkflowInstanceListScreen.MIN_PAGE_SIZE);
  }
  async loadWorkflowBlueprints() {
    const elsaClient = await this.createClient();
    this.workflowBlueprints = await elsaClient.workflowRegistryApi.listAll({ allVersions: true });
  }
  async loadWorkflowInstances() {
    this.currentPage = isNaN(this.currentPage) ? ElsaWorkflowInstanceListScreen.START_PAGE : this.currentPage;
    this.currentPage = Math.max(this.currentPage, ElsaWorkflowInstanceListScreen.START_PAGE);
    this.currentPageSize = isNaN(this.currentPageSize) ? ElsaWorkflowInstanceListScreen.DEFAULT_PAGE_SIZE : this.currentPageSize;
    const elsaClient = await this.createClient();
    this.workflowInstances = await elsaClient.workflowInstancesApi.list(this.currentPage, this.currentPageSize, this.selectedWorkflowId, this.selectedWorkflowStatus, this.selectedOrderByState, this.currentSearchTerm, this.correlationId);
    const maxPage = Math.floor(this.workflowInstances.totalCount / this.currentPageSize);
    if (this.currentPage > maxPage) {
      this.currentPage = maxPage;
      this.workflowInstances = await elsaClient.workflowInstancesApi.list(this.currentPage, this.currentPageSize, this.selectedWorkflowId, this.selectedWorkflowStatus, this.selectedOrderByState, this.currentSearchTerm, this.correlationId);
    }
    this.setSelectAllIndeterminateState();
  }
  createClient() {
    return createElsaClient(this.serverUrl);
  }
  getLatestWorkflowBlueprintVersions() {
    const groups = collection.groupBy(this.workflowBlueprints, 'id');
    return collection.map(groups, x => array.first(collection.orderBy(x, 'version', 'desc')));
  }
  buildFilterUrl(workflowId, workflowStatus, orderBy, pageSize, correlationId) {
    const filters = {};
    if (!!correlationId)
      filters['correlationId'] = correlationId;
    if (!!workflowId)
      filters['workflow'] = workflowId;
    if (!!workflowStatus)
      filters['status'] = workflowStatus;
    if (!!orderBy)
      filters['orderBy'] = orderBy;
    if (!!this.currentPage)
      filters['page'] = this.currentPage.toString();
    let newPageSize = !!pageSize ? pageSize : this.currentPageSize;
    newPageSize = Math.max(Math.min(newPageSize, 100), ElsaWorkflowInstanceListScreen.MIN_PAGE_SIZE);
    filters['pageSize'] = newPageSize.toString();
    if (newPageSize != this.currentPageSize)
      filters['page'] = Math.floor(this.currentPage * this.currentPageSize / newPageSize).toString();
    const queryString = collection.map(filters, (v, k) => `${k}=${v}`).join('&');
    return `${this.basePath}/workflow-instances?${queryString}`;
  }
  getStatusColor(status) {
    switch (status) {
      default:
      case WorkflowStatus.Idle:
        return "gray";
      case WorkflowStatus.Running:
        return "rose";
      case WorkflowStatus.Suspended:
        return "blue";
      case WorkflowStatus.Finished:
        return "green";
      case WorkflowStatus.Faulted:
        return "red";
      case WorkflowStatus.Cancelled:
        return "yellow";
    }
  }
  updateSelectAllChecked() {
    if (this.workflowInstances.items.length == 0) {
      this.selectAllChecked = false;
      return;
    }
    this.selectAllChecked = this.workflowInstances.items.findIndex(x => this.selectedWorkflowInstanceIds.findIndex(id => id == x.id) < 0) < 0;
  }
  async routeChanged(e) {
    if (!e.pathname.toLowerCase().endsWith('workflow-instances'))
      return;
    this.applyQueryString(e.search);
    await this.loadWorkflowInstances();
  }
  onSelectAllCheckChange(e) {
    const checkBox = e.target;
    const isChecked = checkBox.checked;
    this.selectAllChecked = isChecked;
    if (isChecked) {
      let itemsToAdd = [];
      this.workflowInstances.items.forEach(item => {
        if (!this.selectedWorkflowInstanceIds.includes(item.id)) {
          itemsToAdd.push(item.id);
        }
      });
      if (itemsToAdd.length > 0) {
        this.selectedWorkflowInstanceIds = this.selectedWorkflowInstanceIds.concat(itemsToAdd);
      }
    }
    else {
      const currentItems = this.workflowInstances.items.map(x => x.id);
      this.selectedWorkflowInstanceIds = this.selectedWorkflowInstanceIds.filter(item => {
        return !currentItems.includes(item);
      });
    }
  }
  onWorkflowInstanceCheckChange(e, workflowInstance) {
    const checkBox = e.target;
    const isChecked = checkBox.checked;
    if (isChecked)
      this.selectedWorkflowInstanceIds = [...this.selectedWorkflowInstanceIds, workflowInstance.id];
    else
      this.selectedWorkflowInstanceIds = this.selectedWorkflowInstanceIds.filter(x => x != workflowInstance.id);
    this.setSelectAllIndeterminateState();
  }
  async onCancelClick(e, workflowInstance) {
    const t = this.t;
    const result = await confirmDialogService.show(t('CancelDialog.Title'), t('CancelDialog.Message'));
    if (!result)
      return;
    const elsaClient = await this.createClient();
    await elsaClient.workflowInstancesApi.cancel(workflowInstance.id);
    await this.loadWorkflowInstances();
  }
  async onDeleteClick(e, workflowInstance) {
    const t = this.t;
    const result = await confirmDialogService.show(t('DeleteDialog.Title'), t('DeleteDialog.Message'));
    if (!result)
      return;
    const elsaClient = await this.createClient();
    await elsaClient.workflowInstancesApi.delete(workflowInstance.id);
    await this.loadWorkflowInstances();
  }
  async onRetryClick(e, workflowInstance) {
    const t = this.t;
    const result = await confirmDialogService.show(t('RetryDialog.Title'), t('RetryDialog.Message'));
    if (!result)
      return;
    const elsaClient = await this.createClient();
    await elsaClient.workflowInstancesApi.retry(workflowInstance.id);
    await this.loadWorkflowInstances();
  }
  async onBulkCancel() {
    const t = this.t;
    const result = await confirmDialogService.show(t('BulkCancelDialog.Title'), t('BulkCancelDialog.Message'));
    if (!result)
      return;
    const elsaClient = await this.createClient();
    await elsaClient.workflowInstancesApi.bulkCancel({ workflowInstanceIds: this.selectedWorkflowInstanceIds });
    this.selectedWorkflowInstanceIds = [];
    await this.loadWorkflowInstances();
    this.currentPage = 0;
  }
  async onBulkDelete() {
    const t = this.t;
    const result = await confirmDialogService.show(t('BulkDeleteDialog.Title'), t('BulkDeleteDialog.Message'));
    if (!result)
      return;
    const elsaClient = await this.createClient();
    await elsaClient.workflowInstancesApi.bulkDelete({ workflowInstanceIds: this.selectedWorkflowInstanceIds });
    this.selectedWorkflowInstanceIds = [];
    await this.loadWorkflowInstances();
    this.currentPage = 0;
  }
  async onBulkRetry() {
    const t = this.t;
    const result = await confirmDialogService.show(t('BulkRetryDialog.Title'), t('BulkRetryDialog.Message'));
    if (!result)
      return;
    const elsaClient = await this.createClient();
    await elsaClient.workflowInstancesApi.bulkRetry({ workflowInstanceIds: this.selectedWorkflowInstanceIds });
    this.selectedWorkflowInstanceIds = [];
    await this.loadWorkflowInstances();
    this.currentPage = 0;
  }
  async onBulkActionSelected(e) {
    const action = e.detail;
    switch (action.name) {
      case 'Cancel':
        await this.onBulkCancel();
        break;
      case 'Delete':
        await this.onBulkDelete();
        break;
      case 'Retry':
        await this.onBulkRetry();
        break;
      default:
        action.handler();
    }
    this.updateSelectAllChecked();
  }
  async onSearch(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const searchTerm = formData.get('searchTerm');
    this.currentSearchTerm = searchTerm.toString();
    await this.loadWorkflowInstances();
  }
  render() {
    const basePath = this.basePath;
    const workflowInstances = this.workflowInstances.items;
    const workflowBlueprints = this.workflowBlueprints;
    const totalCount = this.workflowInstances.totalCount;
    const t = this.t;
    const renderViewIcon = function () {
      return (h("svg", { class: "elsa-h-5 elsa-w-5 elsa-text-gray-500", width: "24", height: "24", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" },
        h("path", { d: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" }),
        h("path", { d: "M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" })));
    };
    const renderCancelIcon = function () {
      return (h("svg", { class: "elsa-h-5 elsa-w-5 elsa-text-gray-500", width: "24", height: "24", viewBox: "0 0 24 24", "stroke-width": "2", stroke: "currentColor", fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round" },
        h("path", { "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-width": "2", d: "M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }),
        h("path", { "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-width": "2", d: "M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" })));
    };
    const renderDeleteIcon = function () {
      return (h("svg", { class: "elsa-h-5 elsa-w-5 elsa-text-gray-500", width: "24", height: "24", viewBox: "0 0 24 24", "stroke-width": "2", stroke: "currentColor", fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round" },
        h("path", { stroke: "none", d: "M0 0h24v24H0z" }),
        h("line", { x1: "4", y1: "7", x2: "20", y2: "7" }),
        h("line", { x1: "10", y1: "11", x2: "10", y2: "17" }),
        h("line", { x1: "14", y1: "11", x2: "14", y2: "17" }),
        h("path", { d: "M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" }),
        h("path", { d: "M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" })));
    };
    const renderRetryIcon = function () {
      return (h("svg", { class: "elsa-h-5 w-5 elsa-text-gray-500", width: "24", height: "24", viewBox: "0 0 24 24", "stroke-width": "2", stroke: "currentColor", fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round" },
        h("path", { stroke: "none", d: "M0 0h24v24H0z" }),
        h("path", { d: "M12 17l-2 2l2 2m-2 -2h9a2 2 0 0 0 1.75 -2.75l-.55 -1" }),
        h("path", { d: "M12 17l-2 2l2 2m-2 -2h9a2 2 0 0 0 1.75 -2.75l-.55 -1", transform: "rotate(120 12 13)" }),
        h("path", { d: "M12 17l-2 2l2 2m-2 -2h9a2 2 0 0 0 1.75 -2.75l-.55 -1", transform: "rotate(240 12 13)" })));
    };
    return (h("div", null,
      h("div", { class: "elsa-relative elsa-z-10 elsa-flex-shrink-0 elsa-flex elsa-h-16 elsa-bg-white elsa-border-b elsa-border-gray-200" },
        h("div", { class: "elsa-flex-1 elsa-px-4 elsa-flex elsa-justify-between sm:elsa-px-6 lg:elsa-px-8" },
          h("div", { class: "elsa-flex-1 elsa-flex" },
            h("form", { class: "elsa-w-full elsa-flex md:ml-0", onSubmit: e => this.onSearch(e) },
              h("label", { htmlFor: "search_field", class: "elsa-sr-only" }, "Search"),
              h("div", { class: "elsa-relative elsa-w-full elsa-text-gray-400 focus-within:elsa-text-gray-600" },
                h("div", { class: "elsa-absolute elsa-inset-y-0 elsa-left-0 elsa-flex elsa-items-center elsa-pointer-events-none" },
                  h("svg", { class: "elsa-h-5 elsa-w-5", fill: "currentColor", viewBox: "0 0 20 20" },
                    h("path", { "fill-rule": "evenodd", "clip-rule": "evenodd", d: "M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" }))),
                h("input", { name: "searchTerm", class: "elsa-block elsa-w-full elsa-h-full elsa-pl-8 elsa-pr-3 elsa-py-2 elsa-rounded-md elsa-text-gray-900 elsa-placeholder-gray-500 focus:elsa-placeholder-gray-400 sm:elsa-text-sm elsa-border-0 focus:elsa-outline-none focus:elsa-ring-0", placeholder: t('Search'), type: "search" })))))),
      h("div", { class: "elsa-p-8 elsa-flex elsa-content-end elsa-justify-right elsa-bg-white elsa-space-x-4" },
        h("div", { class: "elsa-flex-shrink-0" }, this.renderBulkActions()),
        h("div", { class: "elsa-flex-1" }, "\u00A0"),
        this.renderPageSizeFilter(),
        this.renderWorkflowFilter(),
        this.renderStatusFilter(),
        this.renderOrderByFilter()),
      h("div", { class: "elsa-mt-8 sm:elsa-block" },
        h("div", { class: "elsa-align-middle elsa-inline-block elsa-min-w-full elsa-border-b elsa-border-gray-200" },
          h("table", { class: "elsa-min-w-full" },
            h("thead", null,
              h("tr", { class: "elsa-border-t elsa-border-gray-200" },
                h("th", { class: "elsa-px-6 elsa-py-3 elsa-border-b elsa-border-gray-200 elsa-bg-gray-50 elsa-text-left elsa-text-xs elsa-leading-4 elsa-font-medium elsa-text-gray-500 elsa-uppercase elsa-tracking-wider" },
                  h("input", { type: "checkbox", value: "true", checked: this.getSelectAllState(), onChange: e => this.onSelectAllCheckChange(e), ref: el => this.selectAllCheckboxEl = el, class: "focus:elsa-ring-blue-500 elsa-h-4 elsa-w-4 elsa-text-blue-600 elsa-border-gray-300 elsa-rounded" })),
                h("th", { class: "elsa-px-6 elsa-py-3 elsa-border-b elsa-border-gray-200 elsa-bg-gray-50 elsa-text-left elsa-text-xs elsa-leading-4 elsa-font-medium elsa-text-gray-500 elsa-uppercase elsa-tracking-wider" }, t('Table.Id')),
                h("th", { class: "hidden md:elsa-table-cell elsa-px-6 elsa-py-3 elsa-border-b elsa-border-gray-200 elsa-bg-gray-50 elsa-text-left elsa-text-xs elsa-leading-4 elsa-font-medium elsa-text-gray-500 elsa-uppercase elsa-tracking-wider" }, t('Table.CorrelationId')),
                h("th", { class: "elsa-px-6 elsa-py-3 elsa-border-b elsa-border-gray-200 elsa-bg-gray-50 elsa-text-left elsa-text-xs elsa-leading-4 elsa-font-medium elsa-text-gray-500 elsa-uppercase elsa-tracking-wider" }, t('Table.Workflow')),
                h("th", { class: "hidden md:elsa-table-cell elsa-px-6 elsa-py-3 elsa-border-b elsa-border-gray-200 elsa-bg-gray-50 elsa-text-right elsa-text-xs elsa-leading-4 elsa-font-medium elsa-text-gray-500 elsa-uppercase elsa-tracking-wider" }, t('Table.Version')),
                h("th", { class: "elsa-px-6 elsa-py-3 elsa-border-b elsa-border-gray-200 elsa-bg-gray-50 elsa-text-left elsa-text-xs elsa-leading-4 elsa-font-medium elsa-text-gray-500 elsa-uppercase elsa-tracking-wider" }, t('Table.InstanceName')),
                h("th", { class: "elsa-px-6 elsa-py-3 elsa-border-b elsa-border-gray-200 elsa-bg-gray-50 elsa-text-left elsa-text-xs elsa-leading-4 elsa-font-medium elsa-text-gray-500 elsa-uppercase elsa-tracking-wider" }, t('Table.Status')),
                h("th", { class: "elsa-px-6 elsa-py-3 elsa-border-b elsa-border-gray-200 elsa-bg-gray-50 elsa-text-left elsa-text-xs elsa-leading-4 elsa-font-medium elsa-text-gray-500 elsa-uppercase elsa-tracking-wider" }, t('Table.Created')),
                h("th", { class: "elsa-px-6 elsa-py-3 elsa-border-b elsa-border-gray-200 elsa-bg-gray-50 elsa-text-left elsa-text-xs elsa-leading-4 elsa-font-medium elsa-text-gray-500 elsa-uppercase elsa-tracking-wider" }, t('Table.Finished')),
                h("th", { class: "elsa-px-6 elsa-py-3 elsa-border-b elsa-border-gray-200 elsa-bg-gray-50 elsa-text-left elsa-text-xs elsa-leading-4 elsa-font-medium elsa-text-gray-500 elsa-uppercase elsa-tracking-wider" }, t('Table.LastExecuted')),
                h("th", { class: "elsa-px-6 elsa-py-3 elsa-border-b elsa-border-gray-200 elsa-bg-gray-50 elsa-text-left elsa-text-xs elsa-leading-4 elsa-font-medium elsa-text-gray-500 elsa-uppercase elsa-tracking-wider" }, t('Table.Faulted')),
                h("th", { class: "elsa-pr-6 elsa-py-3 elsa-border-b elsa-border-gray-200 elsa-bg-gray-50 elsa-text-xs elsa-leading-4 elsa-font-medium elsa-text-gray-500 elsa-uppercase elsa-tracking-wider" }))),
            h("tbody", { class: "elsa-bg-white elsa-divide-y elsa-divide-gray-100" }, workflowInstances.map(workflowInstance => {
              var _a;
              const workflowBlueprint = (_a = workflowBlueprints.find(x => x.versionId == workflowInstance.definitionVersionId)) !== null && _a !== void 0 ? _a : {
                name: 'Not Found',
                displayName: '(Workflow definition not found)'
              };
              const displayName = workflowBlueprint.displayName || workflowBlueprint.name || '(Untitled)';
              const statusColor = this.getStatusColor(workflowInstance.workflowStatus);
              const instanceViewUrl = `${basePath}/workflow-instances/${workflowInstance.id}`;
              const correlationId = !!workflowInstance.correlationId ? workflowInstance.correlationId : '';
              const correlationListViewUrl = `${basePath}/workflow-instances?correlationId=${correlationId}`;
              const blueprintViewUrl = `${basePath}/workflow-registry/${workflowInstance.definitionId}`;
              const instanceName = !workflowInstance.name ? '' : workflowInstance.name;
              const isSelected = this.selectedWorkflowInstanceIds.findIndex(x => x === workflowInstance.id) >= 0;
              const createdAt = moment(workflowInstance.createdAt);
              const finishedAt = !!workflowInstance.finishedAt ? moment(workflowInstance.finishedAt) : null;
              const lastExecutedAt = !!workflowInstance.lastExecutedAt ? moment(workflowInstance.lastExecutedAt) : null;
              const faultedAt = !!workflowInstance.faultedAt ? moment(workflowInstance.faultedAt) : null;
              const isFaulted = workflowInstance.workflowStatus == WorkflowStatus.Faulted;
              const contextMenuItems = [
                { text: t('Table.ContextMenu.View'), anchorUrl: instanceViewUrl, icon: renderViewIcon() },
                {
                  text: t('Table.ContextMenu.Cancel'),
                  clickHandler: e => this.onCancelClick(e, workflowInstance),
                  icon: renderCancelIcon()
                },
                ...[isFaulted ? {
                    text: t('Table.ContextMenu.Retry'),
                    clickHandler: e => this.onRetryClick(e, workflowInstance),
                    icon: renderRetryIcon()
                  } : null],
                {
                  text: t('Table.ContextMenu.Delete'),
                  clickHandler: e => this.onDeleteClick(e, workflowInstance),
                  icon: renderDeleteIcon()
                }
              ].filter(x => x != null);
              return h("tr", null,
                h("td", { class: "elsa-px-6 elsa-py-3 elsa-whitespace-no-wrap elsa-text-sm elsa-leading-5 elsa-font-medium elsa-text-gray-900" },
                  h("input", { type: "checkbox", value: workflowInstance.id, checked: isSelected, onChange: e => this.onWorkflowInstanceCheckChange(e, workflowInstance), class: "focus:elsa-ring-blue-500 elsa-h-4 elsa-w-4 elsa-text-blue-600 elsa-border-gray-300 elsa-rounded" })),
                h("td", { class: "elsa-px-6 elsa-py-3 elsa-whitespace-no-wrap elsa-text-sm elsa-leading-5 elsa-font-medium elsa-text-gray-900" },
                  h("stencil-route-link", { url: instanceViewUrl, anchorClass: "elsa-truncate hover:elsa-text-gray-600" }, workflowInstance.id)),
                h("td", { class: "elsa-px-6 elsa-py-3 elsa-whitespace-no-wrap elsa-text-sm elsa-leading-5 elsa-font-medium elsa-text-gray-900" },
                  h("stencil-route-link", { url: correlationListViewUrl, anchorClass: "elsa-truncate hover:elsa-text-gray-600" }, correlationId)),
                h("td", { class: "elsa-px-6 elsa-py-3 elsa-whitespace-no-wrap elsa-text-sm elsa-leading-5 elsa-font-medium elsa-text-gray-900 elsa-text-left" },
                  h("stencil-route-link", { url: blueprintViewUrl, anchorClass: "elsa-truncate hover:elsa-text-gray-600" }, displayName)),
                h("td", { class: "hidden md:elsa-table-cell elsa-px-6 elsa-py-3 elsa-whitespace-no-wrap elsa-text-right elsa-text-sm elsa-leading-5 elsa-text-gray-500 elsa-uppercase" }, workflowInstance.version),
                h("td", { class: "elsa-px-6 elsa-py-3 elsa-whitespace-no-wrap elsa-text-sm elsa-leading-5 elsa-font-medium elsa-text-gray-900 elsa-text-left" },
                  h("stencil-route-link", { url: instanceViewUrl, anchorClass: "elsa-truncate hover:elsa-text-gray-600" }, instanceName)),
                h("td", { class: "hidden md:elsa-table-cell elsa-px-6 elsa-py-3 elsa-whitespace-no-wrap elsa-text-sm elsa-leading-5 elsa-text-gray-500 elsa-text-right" },
                  h("div", { class: "elsa-flex elsa-items-center elsa-space-x-3 lg:elsa-pl-2" },
                    h("div", { class: `flex-shrink-0 elsa-w-2-5 elsa-h-2-5 elsa-rounded-full elsa-bg-${statusColor}-600` }),
                    h("span", null, workflowInstance.workflowStatus))),
                h("td", { class: "hidden md:elsa-table-cell elsa-px-6 elsa-py-3 elsa-whitespace-no-wrap elsa-text-sm elsa-leading-5 elsa-text-gray-500 elsa-text-left" }, createdAt.format('DD-MM-YYYY HH:mm:ss')),
                h("td", { class: "hidden md:elsa-table-cell elsa-px-6 elsa-py-3 elsa-whitespace-no-wrap elsa-text-sm elsa-leading-5 elsa-text-gray-500 elsa-text-left" }, !!finishedAt ? finishedAt.format('DD-MM-YYYY HH:mm:ss') : '-'),
                h("td", { class: "hidden md:elsa-table-cell elsa-px-6 elsa-py-3 elsa-whitespace-no-wrap elsa-text-sm elsa-leading-5 elsa-text-gray-500 elsa-text-left" }, !!lastExecutedAt ? lastExecutedAt.format('DD-MM-YYYY HH:mm:ss') : '-'),
                h("td", { class: "hidden md:elsa-table-cell elsa-px-6 elsa-py-3 elsa-whitespace-no-wrap elsa-text-sm elsa-leading-5 elsa-text-gray-500 elsa-text-left" }, !!faultedAt ? faultedAt.format('DD-MM-YYYY HH:mm:ss') : '-'),
                h("td", { class: "elsa-pr-6" },
                  h("elsa-context-menu", { history: this.history, menuItems: contextMenuItems })));
            }))),
          h("elsa-pager", { page: this.currentPage, pageSize: this.currentPageSize, totalCount: totalCount, history: this.history, onPaged: this.onPaged, culture: this.culture })))));
  }
  renderBulkActions() {
    const bulkActionIcon = h("svg", { class: "elsa-mr-3 elsa-h-5 elsa-w-5 elsa-text-gray-400", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" },
      h("path", { "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-width": "1", d: "M13 10V3L4 14h7v7l9-11h-7z" }));
    const t = this.t;
    const actions = this.bulkActions;
    return h("elsa-dropdown-button", { text: t('BulkActions.Title'), items: actions, icon: bulkActionIcon, origin: DropdownButtonOrigin.TopLeft, onItemSelected: e => this.onBulkActionSelected(e) });
  }
  renderWorkflowFilter() {
    const t = this.t;
    const latestWorkflowBlueprints = this.getLatestWorkflowBlueprintVersions();
    const selectedCorrelationId = this.selectedCorrelationId;
    const selectedWorkflowId = this.selectedWorkflowId;
    const selectedWorkflow = latestWorkflowBlueprints.find(x => x.id == selectedWorkflowId);
    const selectedWorkflowText = !selectedWorkflowId ? t('Filters.Workflow.Label') : !!selectedWorkflow && (selectedWorkflow.name || selectedWorkflow.displayName) ? (selectedWorkflow.displayName || selectedWorkflow.name) : t('Untitled');
    const selectedWorkflowStatus = this.selectedWorkflowStatus;
    const selectedOrderBy = this.selectedOrderByState;
    const history = this.history;
    let items = latestWorkflowBlueprints.map(x => {
      const displayName = !!x.displayName && x.displayName.length > 0 ? x.displayName : x.name || t('Untitled');
      const item = { text: displayName, value: x.id, isSelected: x.id == selectedWorkflowId };
      if (!!history)
        item.url = this.buildFilterUrl(x.id, selectedWorkflowStatus, selectedOrderBy, null, selectedCorrelationId);
      return item;
    });
    const allItem = { text: t('Filters.Workflow.All'), value: null, isSelected: !selectedWorkflowId };
    if (!!history)
      allItem.url = this.buildFilterUrl(null, selectedWorkflowStatus, selectedOrderBy, null, selectedCorrelationId);
    items = [allItem, ...items];
    const renderIcon = function () {
      return h("svg", { class: "elsa-mr-3 elsa-h-5 elsa-w-5 elsa-text-gray-400", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" },
        h("path", { stroke: "none", d: "M0 0h24v24H0z" }),
        h("rect", { x: "4", y: "4", width: "6", height: "6", rx: "1" }),
        h("rect", { x: "14", y: "4", width: "6", height: "6", rx: "1" }),
        h("rect", { x: "4", y: "14", width: "6", height: "6", rx: "1" }),
        h("rect", { x: "14", y: "14", width: "6", height: "6", rx: "1" }));
    };
    return h("elsa-dropdown-button", { text: selectedWorkflowText, items: items, icon: renderIcon(), origin: DropdownButtonOrigin.TopRight, onItemSelected: e => this.handleWorkflowIdChanged(e.detail.value) });
  }
  renderStatusFilter() {
    const t = this.t;
    const selectedCorrelationId = this.correlationId;
    const selectedWorkflowStatus = this.selectedWorkflowStatus;
    const selectedWorkflowStatusText = !!selectedWorkflowStatus ? selectedWorkflowStatus : t('Filters.Status.Label');
    const statuses = [null, WorkflowStatus.Running, WorkflowStatus.Suspended, WorkflowStatus.Finished, WorkflowStatus.Faulted, WorkflowStatus.Cancelled, WorkflowStatus.Idle];
    const history = this.history;
    const items = statuses.map(x => {
      const text = x !== null && x !== void 0 ? x : t('Filters.Status.All');
      const item = { text: text, isSelected: x == selectedWorkflowStatus, value: x };
      if (!!history)
        item.url = this.buildFilterUrl(this.selectedWorkflowId, x, this.selectedOrderByState, null, selectedCorrelationId);
      return item;
    });
    const renderIcon = function () {
      return h("svg", { class: "elsa-mr-3 elsa-h-5 elsa-w-5 elsa-text-gray-400", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" },
        h("circle", { cx: "12", cy: "12", r: "10" }),
        h("polygon", { points: "10 8 16 12 10 16 10 8" }));
    };
    return h("elsa-dropdown-button", { text: selectedWorkflowStatusText, items: items, icon: renderIcon(), origin: DropdownButtonOrigin.TopRight, onItemSelected: e => this.handleWorkflowStatusChanged(e.detail.value) });
  }
  renderPageSizeFilter() {
    const t = this.t;
    const selectedCorrelationId = this.correlationId;
    const currentPageSize = this.currentPageSize;
    const currentPageSizeText = t('Filters.PageSize.SelectedLabel', { Size: currentPageSize });
    const pageSizes = [5, 10, 15, 20, 30, 50, 100];
    const history = this.history;
    const items = pageSizes.map(x => {
      const text = "" + x;
      const item = { text: text, isSelected: x == currentPageSize, value: x };
      if (!!history)
        item.url = this.buildFilterUrl(this.selectedWorkflowId, this.selectedWorkflowStatus, this.selectedOrderByState, x, selectedCorrelationId);
      return item;
    });
    const renderIcon = function () {
      return h("svg", { class: "elsa-h-5 elsa-w-5 elsa-text-gray-400 elsa-mr-2", width: "24", height: "24", viewBox: "0 0 24 24", "stroke-width": "2", stroke: "currentColor", fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round" },
        h("path", { stroke: "none", d: "M0 0h24v24H0z" }),
        h("line", { x1: "9", y1: "6", x2: "20", y2: "6" }),
        h("line", { x1: "9", y1: "12", x2: "20", y2: "12" }),
        h("line", { x1: "9", y1: "18", x2: "20", y2: "18" }),
        h("line", { x1: "5", y1: "6", x2: "5", y2: "6.01" }),
        h("line", { x1: "5", y1: "12", x2: "5", y2: "12.01" }),
        h("line", { x1: "5", y1: "18", x2: "5", y2: "18.01" }));
    };
    return h("elsa-dropdown-button", { text: currentPageSizeText, items: items, icon: renderIcon(), origin: DropdownButtonOrigin.TopRight, onItemSelected: e => this.handlePageSizeChanged(e.detail.value) });
  }
  renderOrderByFilter() {
    const t = this.t;
    const selectedCorrelationId = this.correlationId;
    const selectedOrderBy = this.selectedOrderByState;
    const selectedOrderByText = !!selectedOrderBy ? t('Filters.Sort.SelectedLabel', { Key: selectedOrderBy }) : t('Filters.Sort.Label');
    const orderByValues = [OrderBy.Finished, OrderBy.LastExecuted, OrderBy.Started];
    const history = this.history;
    const items = orderByValues.map(x => {
      const item = { text: x, value: x, isSelected: x == selectedOrderBy };
      if (!!history)
        item.url = this.buildFilterUrl(this.selectedWorkflowId, this.selectedWorkflowStatus, x, null, selectedCorrelationId);
      return item;
    });
    const renderIcon = function () {
      return h("svg", { class: "elsa-mr-3 elsa-h-5 elsa-w-5 elsa-text-gray-400", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" },
        h("path", { "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-width": "2", d: "M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" }));
    };
    return h("elsa-dropdown-button", { text: selectedOrderByText, items: items, icon: renderIcon(), origin: DropdownButtonOrigin.TopRight, onItemSelected: e => this.handleOrderByChanged(e.detail.value) });
  }
  static get is() { return "elsa-workflow-instance-list-screen"; }
  static get properties() { return {
    "history": {
      "type": "unknown",
      "mutable": false,
      "complexType": {
        "original": "RouterHistory",
        "resolved": "RouterHistory",
        "references": {
          "RouterHistory": {
            "location": "import",
            "path": "@stencil/router"
          }
        }
      },
      "required": false,
      "optional": true,
      "docs": {
        "tags": [],
        "text": ""
      }
    },
    "serverUrl": {
      "type": "string",
      "mutable": false,
      "complexType": {
        "original": "string",
        "resolved": "string",
        "references": {}
      },
      "required": false,
      "optional": false,
      "docs": {
        "tags": [],
        "text": ""
      },
      "attribute": "server-url",
      "reflect": false
    },
    "basePath": {
      "type": "string",
      "mutable": false,
      "complexType": {
        "original": "string",
        "resolved": "string",
        "references": {}
      },
      "required": false,
      "optional": false,
      "docs": {
        "tags": [],
        "text": ""
      },
      "attribute": "base-path",
      "reflect": false
    },
    "workflowId": {
      "type": "string",
      "mutable": false,
      "complexType": {
        "original": "string",
        "resolved": "string",
        "references": {}
      },
      "required": false,
      "optional": true,
      "docs": {
        "tags": [],
        "text": ""
      },
      "attribute": "workflow-id",
      "reflect": false
    },
    "correlationId": {
      "type": "string",
      "mutable": false,
      "complexType": {
        "original": "string",
        "resolved": "string",
        "references": {}
      },
      "required": false,
      "optional": true,
      "docs": {
        "tags": [],
        "text": ""
      },
      "attribute": "correlation-id",
      "reflect": false
    },
    "workflowStatus": {
      "type": "string",
      "mutable": false,
      "complexType": {
        "original": "WorkflowStatus",
        "resolved": "WorkflowStatus.Cancelled | WorkflowStatus.Faulted | WorkflowStatus.Finished | WorkflowStatus.Idle | WorkflowStatus.Running | WorkflowStatus.Suspended",
        "references": {
          "WorkflowStatus": {
            "location": "import",
            "path": "../../../../models"
          }
        }
      },
      "required": false,
      "optional": true,
      "docs": {
        "tags": [],
        "text": ""
      },
      "attribute": "workflow-status",
      "reflect": false
    },
    "orderBy": {
      "type": "string",
      "mutable": false,
      "complexType": {
        "original": "OrderBy",
        "resolved": "OrderBy.Finished | OrderBy.LastExecuted | OrderBy.Started",
        "references": {
          "OrderBy": {
            "location": "import",
            "path": "../../../../models"
          }
        }
      },
      "required": false,
      "optional": true,
      "docs": {
        "tags": [],
        "text": ""
      },
      "attribute": "order-by",
      "reflect": false,
      "defaultValue": "OrderBy.Started"
    },
    "culture": {
      "type": "string",
      "mutable": false,
      "complexType": {
        "original": "string",
        "resolved": "string",
        "references": {}
      },
      "required": false,
      "optional": false,
      "docs": {
        "tags": [],
        "text": ""
      },
      "attribute": "culture",
      "reflect": false
    }
  }; }
  static get states() { return {
    "bulkActions": {},
    "workflowBlueprints": {},
    "workflowInstances": {},
    "selectedWorkflowId": {},
    "selectedCorrelationId": {},
    "selectedWorkflowStatus": {},
    "selectedOrderByState": {},
    "selectedWorkflowInstanceIds": {},
    "selectAllChecked": {},
    "currentPage": {},
    "currentPageSize": {},
    "currentSearchTerm": {}
  }; }
  static get methods() { return {
    "getSelectedWorkflowInstanceIds": {
      "complexType": {
        "signature": "() => Promise<string[]>",
        "parameters": [],
        "references": {
          "Promise": {
            "location": "global"
          }
        },
        "return": "Promise<string[]>"
      },
      "docs": {
        "text": "",
        "tags": []
      }
    },
    "refresh": {
      "complexType": {
        "signature": "() => Promise<void>",
        "parameters": [],
        "references": {
          "Promise": {
            "location": "global"
          }
        },
        "return": "Promise<void>"
      },
      "docs": {
        "text": "",
        "tags": []
      }
    }
  }; }
  static get watchers() { return [{
      "propName": "workflowId",
      "methodName": "handleWorkflowIdChanged"
    }, {
      "propName": "correlationId",
      "methodName": "handleCorrelationIdChanged"
    }, {
      "propName": "workflowStatus",
      "methodName": "handleWorkflowStatusChanged"
    }, {
      "propName": "currentPageSize",
      "methodName": "handlePageSizeChanged"
    }, {
      "propName": "orderBy",
      "methodName": "handleOrderByChanged"
    }]; }
}
ElsaWorkflowInstanceListScreen.DEFAULT_PAGE_SIZE = 15;
ElsaWorkflowInstanceListScreen.MIN_PAGE_SIZE = 5;
ElsaWorkflowInstanceListScreen.MAX_PAGE_SIZE = 100;
ElsaWorkflowInstanceListScreen.START_PAGE = 0;
Tunnel.injectProps(ElsaWorkflowInstanceListScreen, ['serverUrl', 'culture', 'basePath']);
injectHistory(ElsaWorkflowInstanceListScreen);
