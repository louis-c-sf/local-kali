'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const index = require('./index-915b0bc2.js');
const collection = require('./collection-724169f5.js');
const moment = require('./moment-62ee6873.js');
const domain = require('./domain-b01b4a53.js');
const activityIconProvider = require('./activity-icon-provider-d8c65e4d.js');
const elsaClient = require('./elsa-client-e99f1b35.js');
const utils = require('./utils-5d19a660.js');
require('./_commonjsHelpers-a5111d61.js');
require('./index-a2f6d9eb.js');
require('./axios-middleware.esm-f337c7ad.js');
require('./event-bus-8066af27.js');

let ElsaWorkflowInstanceJournal = class {
  constructor(hostRef) {
    index.registerInstance(this, hostRef);
    this.recordSelected = index.createEvent(this, "recordSelected", 7);
    this.activityDescriptors = [];
    this.isVisible = true;
    this.records = { items: [], totalCount: 0 };
    this.filteredRecords = [];
    this.selectedTabId = 'journal';
    this.renderJournalTab = () => {
      const items = this.filteredRecords;
      const allItems = this.records.items;
      const activityDescriptors = this.activityDescriptors;
      const workflowBlueprint = this.workflowBlueprint;
      const activityBlueprints = workflowBlueprint.activities || [];
      const selectedRecordId = this.selectedRecordId;
      const renderRecord = (record, index$1) => {
        var prevItemReverseIndex = allItems
          .slice(0, allItems.indexOf(items[index$1]))
          .reverse()
          .findIndex((e) => {
          return (e.activityId == record.activityId);
        });
        const prevItem = allItems[allItems.indexOf(items[index$1]) - (prevItemReverseIndex + 1)];
        const currentTimestamp = moment.hooks(record.timestamp);
        const prevTimestamp = moment.hooks(prevItem.timestamp);
        const deltaTime = moment.hooks.duration(currentTimestamp.diff(prevTimestamp));
        const activityType = record.activityType;
        const activityIcon = activityIconProvider.activityIconProvider.getIcon(activityType);
        const activityDescriptor = activityDescriptors.find(x => x.type === activityType) || {
          displayName: null,
          type: null
        };
        const activityBlueprint = activityBlueprints.find(x => x.id === record.activityId) || {
          name: null,
          displayName: null
        };
        const activityName = activityBlueprint.displayName || activityBlueprint.name || activityDescriptor.displayName || activityDescriptor.type || '(Not Found): ' + activityType;
        const eventName = record.eventName;
        const eventColor = this.getEventColor(eventName);
        const recordClass = record.id === selectedRecordId ? 'elsa-border-blue-600' : 'hover:elsa-bg-gray-100 elsa-border-transparent';
        const recordData = record.data || {};
        const filteredRecordData = {};
        const wellKnownDataKeys = { State: true, Input: null, Outcomes: true, Exception: true };
        for (const key in recordData) {
          if (!recordData.hasOwnProperty(key))
            continue;
          if (!!wellKnownDataKeys[key])
            continue;
          const value = recordData[key];
          if (!value && value != 0)
            continue;
          let valueText = null;
          if (typeof value == 'string')
            valueText = value;
          else if (typeof value == 'object')
            valueText = JSON.stringify(value, null, 1);
          else if (typeof value == 'undefined')
            valueText = null;
          else
            valueText = value.toString();
          filteredRecordData[key] = valueText;
        }
        const deltaTimeText = utils.durationToString(deltaTime);
        const outcomes = !!recordData.Outcomes ? recordData.Outcomes || [] : [];
        const exception = !!recordData.Exception ? recordData.Exception : null;
        const renderExceptionMessage = (exception) => {
          return (index.h("div", null, index.h("div", { class: "elsa-mb-4" }, index.h("strong", { class: "elsa-block elsa-font-bold" }, exception.Type), exception.Message), !!exception.InnerException ?
            index.h("div", { class: "elsa-ml-4" }, renderExceptionMessage(exception.InnerException)) : undefined));
        };
        return (index.h("li", null, index.h("div", { onClick: () => this.onRecordClick(record), class: `${recordClass} elsa-border-2 elsa-cursor-pointer elsa-p-4 elsa-rounded` }, index.h("div", { class: "elsa-relative elsa-pb-10" }, index.h("div", { class: "elsa-flex elsa-absolute top-8 elsa-left-4 -elsa-ml-px elsa-h-full elsa-w-0.5" }, index.h("div", { class: "elsa-flex elsa-flex-1 elsa-items-center elsa-relative elsa-right-10" }, index.h("span", { class: "elsa-flex-1 elsa-text-sm elsa-text-gray-500 elsa-w-max elsa-bg-white elsa-p-1 elsa-ml-1 elsa-rounded-r" }, deltaTimeText))), index.h("div", { class: "elsa-relative elsa-flex elsa-space-x-3" }, index.h("div", null, index.h("span", { class: "elsa-h-8 elsa-w-8 elsa-rounded-full elsa-bg-green-500 elsa-flex elsa-items-center elsa-justify-center elsa-ring-8 elsa-ring-white elsa-mr-1", innerHTML: activityIcon })), index.h("div", { class: "elsa-min-w-0 elsa-flex-1 elsa-pt-1.5 elsa-flex elsa-justify-between elsa-space-x-4" }, index.h("div", null, index.h("h3", { class: "elsa-text-lg elsa-leading-6 elsa-font-medium elsa-text-gray-900" }, activityName)), index.h("div", null, index.h("span", { class: "elsa-relative elsa-inline-flex elsa-items-center elsa-rounded-full elsa-border elsa-border-gray-300 elsa-px-3 elsa-py-0.5 elsa-text-sm" }, index.h("span", { class: "elsa-absolute elsa-flex-shrink-0 elsa-flex elsa-items-center elsa-justify-center" }, index.h("span", { class: `elsa-h-1.5 elsa-w-1.5 elsa-rounded-full elsa-bg-${eventColor}-500`, "aria-hidden": "true" })), index.h("span", { class: "elsa-ml-3.5 elsa-font-medium elsa-text-gray-900" }, eventName))), index.h("div", { class: "elsa-text-right elsa-text-sm elsa-whitespace-nowrap elsa-text-gray-500" }, index.h("span", null, currentTimestamp.format('DD-MM-YYYY HH:mm:ss'))))), index.h("div", { class: "elsa-ml-12 elsa-mt-2" }, index.h("dl", { class: "sm:elsa-divide-y sm:elsa-divide-gray-200" }, index.h("div", { class: "elsa-grid elsa-grid-cols-2 elsa-gap-x-4 elsa-gap-y-8 sm:elsa-grid-cols-2" }, index.h("div", { class: "sm:elsa-col-span-2" }, index.h("dt", { class: "elsa-text-sm elsa-font-medium elsa-text-gray-500" }, index.h("span", null, "Activity ID"), index.h("elsa-copy-button", { value: record.activityId })), index.h("dd", { class: "elsa-mt-1 elsa-text-sm elsa-text-gray-900 elsa-mb-2" }, record.activityId)), outcomes.length > 0 ? (index.h("div", { class: "sm:elsa-col-span-2" }, index.h("dt", { class: "elsa-text-sm elsa-font-medium elsa-text-gray-500" }, index.h("span", null, "Outcomes"), index.h("elsa-copy-button", { value: outcomes.join(', ') })), index.h("dd", { class: "elsa-mt-1 elsa-text-sm elsa-text-gray-900 elsa-mb-2" }, index.h("div", { class: "elsa-flex elsa-flex-col elsa-space-y-4 sm:elsa-space-y-0 sm:elsa-flex-row sm:elsa-space-x-4" }, outcomes.map(outcome => (index.h("span", { class: "elsa-inline-flex elsa-items-center elsa-px-3 elsa-py-0.5 elsa-rounded-full elsa-text-sm elsa-font-medium elsa-bg-blue-100 elsa-text-blue-800" }, outcome))))))) : undefined, !!record.message && !exception ? (index.h("div", { class: "sm:elsa-col-span-2" }, index.h("dt", { class: "elsa-text-sm elsa-font-medium elsa-text-gray-500" }, index.h("span", null, "Message"), index.h("elsa-copy-button", { value: record.message })), index.h("dd", { class: "elsa-mt-1 elsa-text-sm elsa-text-gray-900" }, record.message))) : undefined, !!exception ? ([index.h("div", { class: "sm:elsa-col-span-2" }, index.h("dt", { class: "elsa-text-sm elsa-font-medium elsa-text-gray-500" }, index.h("span", null, "Exception"), index.h("elsa-copy-button", { value: exception.Type + '\n' + exception.Message })), index.h("dd", { class: "elsa-mt-1 elsa-text-sm elsa-text-gray-900" }, renderExceptionMessage(exception))), index.h("div", { class: "sm:elsa-col-span-2" }, index.h("dt", { class: "elsa-text-sm elsa-font-medium elsa-text-gray-500" }, index.h("span", null, "Exception Details"), index.h("elsa-copy-button", { value: JSON.stringify(exception, null, 1) })), index.h("dd", { class: "elsa-mt-1 elsa-text-sm elsa-text-gray-900 elsa-overflow-x-auto" }, index.h("pre", { onClick: e => utils.clip(e.currentTarget) }, JSON.stringify(exception, null, 1))))]) : undefined, collection.collection.map(filteredRecordData, (v, k) => (index.h("div", { class: "sm:elsa-col-span-2" }, index.h("dt", { class: "elsa-text-sm elsa-font-medium elsa-text-gray-500 elsa-capitalize" }, index.h("span", null, k), index.h("elsa-copy-button", { value: v })), index.h("dd", { class: "elsa-mt-1 elsa-text-sm elsa-text-gray-900 elsa-mb-2 elsa-overflow-x-auto" }, index.h("pre", { onClick: e => utils.clip(e.currentTarget) }, v))))))))))));
      };
      return (index.h("div", { class: "flow-root elsa-mt-4" }, index.h("ul", { class: "-elsa-mb-8" }, items.map(renderRecord))));
    };
    this.renderActivityStateTab = () => {
      const activityModel = !!this.workflowModel && this.selectedActivityId ? this.workflowModel.activities.find(x => x.activityId === this.selectedActivityId) : null;
      if (!activityModel)
        return index.h("p", { class: "elsa-mt-4" }, "No activity selected");
      // Hide expressions field from properties so that we only display the evaluated value.
      const model = Object.assign(Object.assign({}, activityModel), { properties: activityModel.properties.map(x => ({ name: x.name, value: x.value })) });
      return (index.h("div", { class: "elsa-mt-4" }, index.h("pre", null, JSON.stringify(model, null, 2))));
    };
    this.renderGeneralTab = () => {
      const { workflowInstance, workflowBlueprint } = this;
      const { finishedAt, lastExecutedAt, faultedAt } = workflowInstance;
      const format = 'DD-MM-YYYY HH:mm:ss';
      const eventColor = this.getStatusColor(workflowInstance.workflowStatus);
      return (index.h("dl", { class: "elsa-border-b elsa-border-gray-200 elsa-divide-y elsa-divide-gray-200" }, index.h("div", { class: "elsa-py-3 elsa-flex elsa-justify-between elsa-text-sm elsa-font-medium" }, index.h("dt", { class: "elsa-text-gray-500" }, "Workflow Name"), index.h("dd", { class: "elsa-text-gray-900" }, workflowBlueprint.name)), index.h("div", { class: "elsa-py-3 elsa-flex elsa-justify-between elsa-text-sm elsa-font-medium" }, index.h("dt", { class: "elsa-text-gray-500" }, "Instance Name"), index.h("dd", { class: "elsa-text-gray-900" }, workflowInstance.name || '-')), index.h("div", { class: "elsa-py-3 elsa-flex elsa-justify-between elsa-text-sm elsa-font-medium" }, index.h("dt", { class: "elsa-text-gray-500" }, "Id"), index.h("dd", { class: "elsa-text-gray-900" }, workflowInstance.id)), index.h("div", { class: "elsa-py-3 elsa-flex elsa-justify-between elsa-text-sm elsa-font-medium" }, index.h("dt", { class: "elsa-text-gray-500" }, "Correlation id"), index.h("dd", { class: "elsa-text-gray-900" }, workflowInstance.correlationId)), index.h("div", { class: "elsa-py-3 elsa-flex elsa-justify-between elsa-text-sm elsa-font-medium" }, index.h("dt", { class: "elsa-text-gray-500" }, "Version"), index.h("dd", { class: "elsa-text-gray-900 elsa-break-all" }, workflowInstance.version || '-')), index.h("div", { class: "elsa-py-3 elsa-flex elsa-justify-between elsa-text-sm elsa-font-medium" }, index.h("dt", { class: "elsa-text-gray-500" }, "Workflow Status"), index.h("dd", { class: "elsa-text-gray-900 elsa-break-all" }, index.h("span", { class: "elsa-relative elsa-inline-flex elsa-items-center elsa-rounded-full" }, index.h("span", { class: "elsa-flex-shrink-0 elsa-flex elsa-items-center elsa-justify-center" }, index.h("span", { class: `elsa-w-2-5 elsa-h-2-5 elsa-rounded-full elsa-bg-${eventColor}-500`, "aria-hidden": "true" })), index.h("span", { class: "elsa-ml-3.5" }, workflowInstance.workflowStatus || '-')))), index.h("div", { class: "elsa-py-3 elsa-flex elsa-justify-between elsa-text-sm elsa-font-medium" }, index.h("dt", { class: "elsa-text-gray-500" }, "Created"), index.h("dd", { class: "elsa-text-gray-900 elsa-break-all" }, moment.hooks(workflowInstance.createdAt).format(format) || '-')), index.h("div", { class: "elsa-py-3 elsa-flex elsa-justify-between elsa-text-sm elsa-font-medium" }, index.h("dt", { class: "elsa-text-gray-500" }, "Finished"), index.h("dd", { class: "elsa-text-gray-900 elsa-break-all" }, finishedAt ? moment.hooks(finishedAt).format(format) : '-')), index.h("div", { class: "elsa-py-3 elsa-flex elsa-justify-between elsa-text-sm elsa-font-medium" }, index.h("dt", { class: "elsa-text-gray-500" }, "Last Executed"), index.h("dd", { class: "elsa-text-gray-900 elsa-break-all" }, lastExecutedAt ? moment.hooks(lastExecutedAt).format(format) : '-')), index.h("div", { class: "elsa-py-3 elsa-flex elsa-justify-between elsa-text-sm elsa-font-medium" }, index.h("dt", { class: "elsa-text-gray-500" }, "Faulted"), index.h("dd", { class: "elsa-text-gray-900 elsa-break-all" }, faultedAt ? moment.hooks(faultedAt).format(format) : '-'))));
    };
    this.renderVariablesTab = () => {
      const { workflowInstance, workflowBlueprint } = this;
      const { variables } = workflowInstance;
      return (index.h("dl", { class: "elsa-border-b elsa-border-gray-200 elsa-divide-y elsa-divide-gray-200" }, index.h("div", { class: "elsa-py-3 elsa-text-sm elsa-font-medium" }, (variables === null || variables === void 0 ? void 0 : variables.data) ? index.h("pre", null, JSON.stringify(variables === null || variables === void 0 ? void 0 : variables.data, null, 2)) : '-')));
    };
  }
  async selectActivityRecord(activityId) {
    const record = !!activityId ? this.filteredRecords.find(x => x.activityId == activityId) : null;
    this.selectActivityRecordInternal(record);
    await this.flyoutPanel.selectTab('journal', true);
  }
  async workflowInstanceIdChangedHandler(newValue) {
    const workflowInstanceId = newValue;
    const client = await elsaClient.createElsaClient(this.serverUrl);
    if (workflowInstanceId && workflowInstanceId.length > 0) {
      try {
        this.records = await client.workflowExecutionLogApi.get(workflowInstanceId);
        this.filteredRecords = this.records.items.filter(x => x.eventName != 'Executing' && x.eventName != 'Resuming');
      }
      catch (_a) {
        console.warn('The specified workflow instance does not exist.');
      }
    }
  }
  async componentWillLoad() {
    await this.workflowInstanceIdChangedHandler(this.workflowInstanceId);
  }
  selectActivityRecordInternal(record) {
    const activity = !!record ? this.workflowBlueprint.activities.find(x => x.id === record.activityId) : null;
    this.selectedRecordId = !!record ? record.id : null;
    this.selectedActivityId = activity != null ? !!activity.parentId && activity.parentId != this.workflowBlueprint.id ? activity.parentId : activity.id : null;
  }
  getEventColor(eventName) {
    const map = {
      'Executing': 'blue',
      'Executed': 'green',
      'Faulted': 'rose',
      'Warning': 'yellow',
      'Information': 'blue',
    };
    return map[eventName] || 'gray';
  }
  getStatusColor(status) {
    switch (status) {
      default:
      case domain.WorkflowStatus.Idle:
        return 'gray';
      case domain.WorkflowStatus.Running:
        return 'rose';
      case domain.WorkflowStatus.Suspended:
        return 'blue';
      case domain.WorkflowStatus.Finished:
        return 'green';
      case domain.WorkflowStatus.Faulted:
        return 'red';
      case domain.WorkflowStatus.Cancelled:
        return 'yellow';
    }
  }
  onRecordClick(record) {
    this.selectActivityRecordInternal(record);
    this.recordSelected.emit(record);
  }
  render() {
    return (index.h(index.Host, null, this.renderPanel(), index.h("elsa-workflow-definition-editor-notifications", null)));
  }
  renderPanel() {
    return (index.h("elsa-flyout-panel", { ref: el => this.flyoutPanel = el }, index.h("elsa-tab-header", { tab: "general", slot: "header" }, "General"), index.h("elsa-tab-content", { tab: "general", slot: "content" }, this.renderGeneralTab()), index.h("elsa-tab-header", { tab: "journal", slot: "header" }, "Journal"), index.h("elsa-tab-content", { tab: "journal", slot: "content" }, this.renderJournalTab()), index.h("elsa-tab-header", { tab: "activityState", slot: "header" }, "Activity State"), index.h("elsa-tab-content", { tab: "activityState", slot: "content" }, this.renderActivityStateTab()), index.h("elsa-tab-header", { tab: "variables", slot: "header" }, "Variables"), index.h("elsa-tab-content", { tab: "variables", slot: "content" }, this.renderVariablesTab())));
  }
  static get watchers() { return {
    "workflowInstanceId": ["workflowInstanceIdChangedHandler"]
  }; }
};

exports.elsa_workflow_instance_journal = ElsaWorkflowInstanceJournal;
