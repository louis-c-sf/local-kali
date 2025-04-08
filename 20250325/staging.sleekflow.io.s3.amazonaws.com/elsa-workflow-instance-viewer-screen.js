import { Component, h, Host, Listen, Method, Prop, State, Watch } from '@stencil/core';
import { eventBus } from '../../../../services/event-bus';
import * as collection from 'lodash/collection';
import { EventTypes, SyntaxNames, WorkflowPersistenceBehavior, WorkflowStatus } from "../../../../models";
import { createElsaClient } from "../../../../services/elsa-client";
import state from '../../../../utils/store';
import { LayoutDirection, WorkflowDesignerMode } from "../../../designers/tree/elsa-designer-tree/models";
import Tunnel from "../../../../data/dashboard";
import { featuresDataManager } from "../../../../services";
export class ElsaWorkflowInstanceViewerScreen {
  constructor() {
    this.activityContextMenuState = {
      shown: false,
      x: 0,
      y: 0,
      activity: null,
    };
    this.layoutDirection = LayoutDirection.TopBottom;
    this.getActivityBorderColor = (activity) => {
      const workflowInstance = this.workflowInstance;
      const workflowFault = !!workflowInstance ? workflowInstance.fault : null;
      const activityData = workflowInstance.activityData[activity.activityId] || {};
      const lifecycle = activityData['_Lifecycle'] || {};
      const executing = !!lifecycle.executing;
      const executed = !!lifecycle.executed;
      if (!!workflowFault && workflowFault.faultedActivityId == activity.activityId)
        return 'red';
      if (executed)
        return 'green';
      if (executing)
        return 'blue';
      return null;
    };
    this.renderActivityStatsButton = (activity) => {
      const workflowInstance = this.workflowInstance;
      const workflowFault = !!workflowInstance ? workflowInstance.fault : null;
      const activityData = workflowInstance.activityData[activity.activityId] || {};
      const lifecycle = activityData['_Lifecycle'] || {};
      const executing = !!lifecycle.executing;
      const executed = !!lifecycle.executed;
      let icon;
      if (!!workflowFault && workflowFault.faultedActivityId == activity.activityId) {
        icon = `<svg class="elsa-flex-shrink-0 elsa-h-6 elsa-w-6 elsa-text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>`;
      }
      else if (executed) {
        icon = `<svg class="elsa-h-6 elsa-w-6 elsa-text-green-500"  viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>`;
      }
      else if (executing) {
        icon = `<svg class="elsa-h-6 elsa-w-6 elsa-text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>`;
      }
      else {
        icon = `<svg class="h-6 w-6 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>`;
      }
      return `<div class="context-menu-wrapper elsa-flex-shrink-0">
            <button aria-haspopup="true"
                    class="elsa-w-8 elsa-h-8 elsa-inline-flex elsa-items-center elsa-justify-center elsa-text-gray-400 elsa-rounded-full elsa-bg-transparent hover:elsa-text-gray-500 focus:elsa-outline-none focus:elsa-text-gray-500 focus:elsa-bg-gray-100 elsa-transition elsa-ease-in-out elsa-duration-150">
              ${icon}
            </button>
          </div>`;
    };
    this.renderActivityPerformanceMenu = () => {
      const activityStats = this.activityStats;
      const renderFault = () => {
        if (!activityStats.fault)
          return;
        return h("elsa-workflow-fault-information", { workflowFault: this.workflowInstance.fault, faultedAt: this.workflowInstance.faultedAt });
      };
      const renderPerformance = () => {
        if (!!activityStats.fault)
          return;
        return h("elsa-workflow-performance-information", { activityStats: activityStats });
      };
      const renderStats = function () {
        return (h("div", null,
          h("div", null,
            h("table", { class: "elsa-min-w-full elsa-divide-y elsa-divide-gray-200 elsa-border-b elsa-border-gray-200" },
              h("thead", { class: "elsa-bg-gray-50" },
                h("tr", null,
                  h("th", { scope: "col", class: "elsa-px-6 elsa-py-3 elsa-text-left elsa-text-xs elsa-font-medium elsa-text-gray-500 elsa-text-right elsa-tracking-wider" }, "Event"),
                  h("th", { scope: "col", class: "elsa-px-6 elsa-py-3 elsa-text-left elsa-text-xs elsa-font-medium elsa-text-gray-500 elsa-text-right elsa-tracking-wider" }, "Count"))),
              h("tbody", { class: "elsa-bg-white elsa-divide-y elsa-divide-gray-200" }, activityStats.eventCounts.length > 0 ? activityStats.eventCounts.map(eventCount => (h("tr", null,
                h("td", { class: "elsa-px-6 elsa-py-4 elsa-whitespace-nowrap elsa-text-sm elsa-font-medium elsa-text-gray-900" }, eventCount.eventName),
                h("td", { class: "elsa-px-6 elsa-py-4 elsa-whitespace-nowrap elsa-text-sm elsa-text-gray-500" }, eventCount.count)))) : h("tr", null,
                h("td", { colSpan: 2, class: "elsa-px-6 elsa-py-4 elsa-whitespace-nowrap elsa-text-sm elsa-font-medium elsa-text-gray-900" }, "No events record for this activity."))))),
          activityStats.eventCounts.length > 0 ? (h("div", { class: "elsa-relative elsa-grid elsa-gap-6 elsa-bg-white px-5 elsa-py-6 sm:elsa-gap-8 sm:elsa-p-8" },
            renderFault(),
            renderPerformance())) : undefined));
      };
      const renderLoader = function () {
        return h("div", { class: "elsa-p-6 elsa-bg-white" }, "Loading...");
      };
      return h("div", { "data-transition-enter": "elsa-transition elsa-ease-out elsa-duration-100", "data-transition-enter-start": "elsa-transform elsa-opacity-0 elsa-scale-95", "data-transition-enter-end": "elsa-transform elsa-opacity-100 elsa-scale-100", "data-transition-leave": "elsa-transition elsa-ease-in elsa-duration-75", "data-transition-leave-start": "elsa-transform elsa-opacity-100 elsa-scale-100", "data-transition-leave-end": "elsa-transform elsa-opacity-0 elsa-scale-95", class: `${this.activityContextMenuState.shown ? '' : 'hidden'} elsa-absolute elsa-z-10 elsa-mt-3 elsa-px-2 elsa-w-screen elsa-max-w-xl sm:elsa-px-0`, style: { left: `${this.activityContextMenuState.x + 64}px`, top: `${this.activityContextMenuState.y - 256}px` }, ref: el => this.contextMenu = el },
        h("div", { class: "elsa-rounded-lg elsa-shadow-lg elsa-ring-1 elsa-ring-black elsa-ring-opacity-5 elsa-overflow-hidden" }, !!activityStats ? renderStats() : renderLoader()));
    };
  }
  async getServerUrl() {
    return this.serverUrl;
  }
  async workflowInstanceIdChangedHandler(newValue) {
    const workflowInstanceId = newValue;
    let workflowInstance = {
      id: null,
      definitionId: null,
      definitionVersionId: null,
      version: null,
      workflowStatus: WorkflowStatus.Idle,
      variables: { data: {} },
      blockingActivities: [],
      scheduledActivities: [],
      scopes: [],
      currentActivity: { activityId: '' }
    };
    let workflowBlueprint = {
      id: null,
      version: 1,
      activities: [],
      connections: [],
      persistenceBehavior: WorkflowPersistenceBehavior.WorkflowBurst,
      customAttributes: { data: {} },
      persistWorkflow: false,
      isLatest: false,
      isPublished: false,
      loadWorkflowContext: false,
      isSingleton: false,
      saveWorkflowContext: false,
      variables: { data: {} },
      type: null,
      inputProperties: { data: {} },
      outputProperties: { data: {} },
      propertyStorageProviders: {}
    };
    const client = await createElsaClient(this.serverUrl);
    if (workflowInstanceId && workflowInstanceId.length > 0) {
      try {
        workflowInstance = await client.workflowInstancesApi.get(workflowInstanceId);
        workflowBlueprint = await client.workflowRegistryApi.get(workflowInstance.definitionId, { version: workflowInstance.version });
      }
      catch (_a) {
        console.warn(`The specified workflow definition does not exist. Creating a new one.`);
      }
    }
    this.updateModels(workflowInstance, workflowBlueprint);
  }
  async serverUrlChangedHandler(newValue) {
    if (newValue && newValue.length > 0)
      await this.loadActivityDescriptors();
  }
  onWindowClicked(event) {
    const target = event.target;
    if (!this.contextMenu.contains(target))
      this.handleContextMenuChange(0, 0, false, null);
  }
  async componentWillLoad() {
    const layoutFeature = featuresDataManager.getFeatureConfig(featuresDataManager.supportedFeatures.workflowLayout);
    if (layoutFeature && layoutFeature.enabled) {
      this.layoutDirection = layoutFeature.value;
    }
    await this.serverUrlChangedHandler(this.serverUrl);
    await this.workflowInstanceIdChangedHandler(this.workflowInstanceId);
  }
  componentDidLoad() {
    if (!this.designer) {
      this.designer = this.el.querySelector("elsa-designer-tree");
      this.designer.model = this.workflowModel;
    }
  }
  async loadActivityDescriptors() {
    const client = await createElsaClient(this.serverUrl);
    state.activityDescriptors = await client.activitiesApi.list();
  }
  updateModels(workflowInstance, workflowBlueprint) {
    this.workflowInstance = workflowInstance;
    this.workflowBlueprint = workflowBlueprint;
    this.workflowModel = this.mapWorkflowModel(workflowBlueprint, workflowInstance);
  }
  mapWorkflowModel(workflowBlueprint, workflowInstance) {
    const activities = workflowBlueprint.activities.filter(x => x.parentId == workflowBlueprint.id || !x.parentId).map(x => this.mapActivityModel(x, workflowInstance));
    const connections = workflowBlueprint.connections.filter(c => activities.findIndex(a => a.activityId == c.sourceActivityId || a.activityId == c.targetActivityId) > -1).map(this.mapConnectionModel);
    return {
      activities: activities,
      connections: connections,
      persistenceBehavior: workflowBlueprint.persistenceBehavior,
    };
  }
  mapActivityModel(activityBlueprint, workflowInstance) {
    const activityDescriptors = state.activityDescriptors;
    const activityDescriptor = activityDescriptors.find(x => x.type == activityBlueprint.type);
    const activityData = workflowInstance.activityData[activityBlueprint.id] || {};
    const properties = collection.map(activityBlueprint.inputProperties.data, (value, key) => {
      const propertyDescriptor = activityDescriptor.inputProperties.find(x => x.name == key) || activityDescriptor.outputProperties.find(x => x.name == key);
      const defaultSyntax = (propertyDescriptor === null || propertyDescriptor === void 0 ? void 0 : propertyDescriptor.defaultSyntax) || SyntaxNames.Literal;
      const expressions = {};
      const v = activityData[key] || value;
      expressions[defaultSyntax] = v;
      return ({ name: key, value: v, expressions: expressions, syntax: defaultSyntax });
    });
    return {
      activityId: activityBlueprint.id,
      description: activityBlueprint.description,
      displayName: activityBlueprint.displayName || activityBlueprint.name || activityBlueprint.type,
      name: activityBlueprint.name,
      type: activityBlueprint.type,
      properties: properties,
      outcomes: [...activityDescriptor.outcomes],
      persistWorkflow: activityBlueprint.persistWorkflow,
      saveWorkflowContext: activityBlueprint.saveWorkflowContext,
      loadWorkflowContext: activityBlueprint.loadWorkflowContext,
      propertyStorageProviders: activityBlueprint.propertyStorageProviders
    };
  }
  mapConnectionModel(connection) {
    return {
      sourceId: connection.sourceActivityId,
      targetId: connection.targetActivityId,
      outcome: connection.outcome
    };
  }
  handleContextMenuChange(x, y, shown, activity) {
    this.activityContextMenuState = {
      shown,
      x,
      y,
      activity,
    };
  }
  onShowWorkflowSettingsClick() {
    eventBus.emit(EventTypes.ShowWorkflowSettings);
  }
  onRecordSelected(e) {
    const record = e.detail;
    const activity = !!record ? this.workflowBlueprint.activities.find(x => x.id === record.activityId) : null;
    this.selectedActivityId = activity != null ? activity.parentId != null ? activity.parentId : activity.id : null;
  }
  async onActivitySelected(e) {
    this.selectedActivityId = e.detail.activityId;
    await this.journal.selectActivityRecord(this.selectedActivityId);
  }
  async onActivityDeselected(e) {
    if (this.selectedActivityId == e.detail.activityId)
      this.selectedActivityId = null;
    await this.journal.selectActivityRecord(this.selectedActivityId);
  }
  async onActivityContextMenuButtonClicked(e) {
    this.activityContextMenuState = e.detail;
    this.activityStats = null;
    if (!e.detail.shown) {
      return;
    }
    const elsaClient = await createElsaClient(this.serverUrl);
    this.activityStats = await elsaClient.activityStatsApi.get(this.workflowInstanceId, e.detail.activity.activityId);
  }
  render() {
    const descriptors = state.activityDescriptors;
    return (h(Host, { class: "elsa-flex elsa-flex-col elsa-w-full elsa-relative", ref: el => this.el = el },
      this.renderCanvas(),
      h("elsa-workflow-instance-journal", { ref: el => this.journal = el, workflowInstanceId: this.workflowInstanceId, workflowInstance: this.workflowInstance, serverUrl: this.serverUrl, activityDescriptors: descriptors, workflowBlueprint: this.workflowBlueprint, workflowModel: this.workflowModel, onRecordSelected: e => this.onRecordSelected(e) })));
  }
  renderCanvas() {
    return (h("div", { class: "elsa-flex-1 elsa-flex" },
      h("elsa-designer-tree", { model: this.workflowModel, class: "elsa-flex-1", ref: el => this.designer = el, layoutDirection: this.layoutDirection, mode: WorkflowDesignerMode.Instance, activityContextMenuButton: this.renderActivityStatsButton, activityBorderColor: this.getActivityBorderColor, activityContextMenu: this.activityContextMenuState, selectedActivityIds: [this.selectedActivityId], onActivitySelected: e => this.onActivitySelected(e), onActivityDeselected: e => this.onActivityDeselected(e), onActivityContextMenuButtonClicked: e => this.onActivityContextMenuButtonClicked(e) }),
      this.renderActivityPerformanceMenu()));
  }
  static get is() { return "elsa-workflow-instance-viewer-screen"; }
  static get properties() { return {
    "workflowInstanceId": {
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
      "attribute": "workflow-instance-id",
      "reflect": false
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
    "workflowInstance": {},
    "workflowBlueprint": {},
    "workflowModel": {},
    "selectedActivityId": {},
    "activityStats": {},
    "activityContextMenuState": {}
  }; }
  static get methods() { return {
    "getServerUrl": {
      "complexType": {
        "signature": "() => Promise<string>",
        "parameters": [],
        "references": {
          "Promise": {
            "location": "global"
          }
        },
        "return": "Promise<string>"
      },
      "docs": {
        "text": "",
        "tags": []
      }
    }
  }; }
  static get watchers() { return [{
      "propName": "workflowInstanceId",
      "methodName": "workflowInstanceIdChangedHandler"
    }, {
      "propName": "serverUrl",
      "methodName": "serverUrlChangedHandler"
    }]; }
  static get listeners() { return [{
      "name": "click",
      "method": "onWindowClicked",
      "target": "window",
      "capture": false,
      "passive": false
    }]; }
}
Tunnel.injectProps(ElsaWorkflowInstanceViewerScreen, ['serverUrl', 'culture']);
