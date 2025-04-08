import { Component, h, Host, Prop, State, Watch } from '@stencil/core';
import { HubConnectionBuilder } from '@microsoft/signalr';
import { EventTypes, WorkflowStatus } from "../../../../models";
import { loadTranslations } from "../../../i18n/i18n-loader";
import { resources } from "./localizations";
import { createElsaClient, eventBus } from "../../../../services";
import Tunnel from "../../../../data/dashboard";
import { clip } from "../../../../utils/utils";
export class ElsaWorkflowTestPanel {
  constructor() {
    this.workflowTestActivityMessages = [];
    this.workflowStarted = false;
    this.onRestartWorkflow = async (selectedActivityId) => {
      var _a;
      const message = ((_a = this.message) === null || _a === void 0 ? void 0 : _a.activityId) === selectedActivityId ? this.message : this.workflowTestActivityMessages.find(x => x.activityId === selectedActivityId);
      const request = {
        workflowDefinitionId: this.workflowDefinition.definitionId,
        version: this.workflowDefinition.version,
        signalRConnectionId: this.signalRConnectionId,
        activityId: message.activityId,
        lastWorkflowInstanceId: message.workflowInstanceId
      };
      this.workflowStarted = true;
      const client = await createElsaClient(this.serverUrl);
      await client.workflowTestApi.restartFromActivity(request);
    };
  }
  async workflowTestActivityMessageChangedHandler(newMessage, oldMessage) {
    const message = this.workflowTestActivityMessages.find(x => x.activityId == newMessage);
    this.message = !!message ? message : null;
  }
  async componentWillLoad() {
    this.i18next = await loadTranslations(this.culture, resources);
    this.connectMessageHub();
  }
  connectMessageHub() {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(this.serverUrl + "/hubs/workflowTest")
      .build();
    this.hubConnection.on('Connected', (message) => {
      this.signalRConnectionId = message;
    });
    this.hubConnection.on('DispatchMessage', async (message) => {
      message = message;
      message.data = JSON.parse(message.data);
      this.workflowTestActivityMessages = this.workflowTestActivityMessages.filter(x => x.activityId !== message.activityId);
      this.workflowTestActivityMessages = [...this.workflowTestActivityMessages, message];
      await eventBus.emit(EventTypes.TestActivityMessageReceived, this, message);
      if (message.workflowStatus === 'Executed' || message.workflowStatus === 'Failed') {
        this.workflowStarted = false;
      }
      if (message.workflowStatus === 'Suspended') {
        this.workflowStarted = true;
      }
      if (!this.message) {
        this.message = message;
      }
    });
    this.hubConnection.start()
      .then(() => this.hubConnection.invoke("Connecting"))
      .catch((err) => console.log('Failed to establish a SignalR connection.'));
  }
  connectedCallback() {
    eventBus.on(EventTypes.WorkflowRestarted, this.onRestartWorkflow);
  }
  disconnectedCallback() {
    eventBus.detach(EventTypes.WorkflowRestarted, this.onRestartWorkflow);
  }
  async onExecuteWorkflowClick() {
    await eventBus.emit(EventTypes.WorkflowExecuted, this);
    this.message = null;
    this.workflowStarted = true;
    this.workflowTestActivityMessages = [];
    await eventBus.emit(EventTypes.TestActivityMessageReceived, this, null);
    const request = {
      workflowDefinitionId: this.workflowDefinition.definitionId,
      version: this.workflowDefinition.version,
      signalRConnectionId: this.signalRConnectionId
    };
    const client = await createElsaClient(this.serverUrl);
    const response = await client.workflowTestApi.execute(request);
    if (!response.isSuccess && response.isAnotherInstanceRunning) {
      this.workflowStarted = false;
      const t = x => this.i18next.t(x);
      const result = await this.confirmDialog.show(t('RestartInstanceConfirmationModel.Title'), t('RestartInstanceConfirmationModel.Message'));
      if (!!result) {
        const runningInstances = await client.workflowInstancesApi.list(null, null, this.workflowDefinition.definitionId, WorkflowStatus.Suspended);
        for (const instance of runningInstances.items) {
          await client.workflowTestApi.stop({ workflowInstanceId: instance.id });
          await client.workflowInstancesApi.delete(instance.id);
        }
        await this.onExecuteWorkflowClick();
      }
    }
  }
  async onStopWorkflowClick() {
    const message = this.workflowTestActivityMessages.last();
    if (!!message) {
      const client = await createElsaClient(this.serverUrl);
      await client.workflowInstancesApi.delete(message.workflowInstanceId);
      await client.workflowTestApi.stop({ workflowInstanceId: message.workflowInstanceId });
    }
    this.message = null;
    this.workflowStarted = false;
    this.workflowTestActivityMessages = [];
    await eventBus.emit(EventTypes.TestActivityMessageReceived, this, null);
  }
  render() {
    const t = (x, params) => this.i18next.t(x, params);
    const renderActivityTestMessage = () => {
      const { message } = this;
      if (message == undefined || !message)
        return;
      const workflowStatus = this.workflowTestActivityMessages.last().workflowStatus;
      const renderEndpointUrl = () => {
        if (!message.activityData || !message.activityData["Path"])
          return undefined;
        const endpointUrl = this.serverUrl + '/workflows' + message.activityData["Path"].value + '?correlation=' + message.correlationId;
        return (h("div", null,
          h("div", { class: "elsa-py-3 elsa-flex elsa-justify-between elsa-text-sm elsa-font-medium" },
            h("dt", { class: "elsa-text-gray-500" },
              h("span", { class: "elsa-mr-1" }, t('EntryEndpoint')),
              h("elsa-copy-button", { value: endpointUrl }))),
          h("div", { class: "elsa-py-3 elsa-flex elsa-justify-between elsa-text-sm elsa-font-medium" },
            h("dt", { class: "elsa-text-gray-900" },
              h("span", { class: "elsa-break-all font-mono", onClick: e => clip(e.currentTarget) }, endpointUrl)))));
      };
      return (h("dl", { class: "elsa-border-b elsa-border-gray-200 elsa-divide-y elsa-divide-gray-200" },
        h("div", { class: "elsa-py-3 elsa-flex elsa-justify-between elsa-text-sm elsa-font-medium" },
          h("dt", { class: "elsa-text-gray-500" }, t('Status')),
          h("dd", { class: "elsa-text-gray-900" }, workflowStatus)),
        renderEndpointUrl()));
    };
    return (h(Host, null,
      h("dl", { class: "elsa-border-b elsa-border-gray-200 elsa-divide-y elsa-divide-gray-200" },
        h("div", { class: "elsa-py-3 elsa-flex elsa-justify-between elsa-text-sm elsa-font-medium" }, !this.workflowStarted ?
          h("button", { type: "button", onClick: () => this.onExecuteWorkflowClick(), class: "elsa-ml-0 elsa-w-full elsa-inline-flex elsa-justify-center elsa-rounded-md elsa-border elsa-border-transparent elsa-shadow-sm elsa-px-4 elsa-py-2 elsa-bg-blue-600 elsa-text-base elsa-font-medium elsa-text-white hover:elsa-bg-blue-700 focus:elsa-outline-none focus:elsa-ring-2 focus:elsa-ring-offset-2 focus:elsa-ring-blue-500 sm:elsa-ml-3 sm:elsa-w-auto sm:elsa-text-sm" }, t('ExecuteWorkflow'))
          :
            h("button", { type: "button", onClick: () => this.onStopWorkflowClick(), class: "elsa-ml-0 elsa-w-full elsa-inline-flex elsa-justify-center elsa-rounded-md elsa-border elsa-border-transparent elsa-shadow-sm elsa-px-4 elsa-py-2 elsa-bg-red-600 elsa-text-base elsa-font-medium elsa-text-white hover:elsa-bg-red-700 focus:elsa-outline-none focus:elsa-ring-2 focus:elsa-ring-offset-2 focus:elsa-ring-red-500 sm:elsa-ml-3 sm:elsa-w-auto sm:elsa-text-sm" }, t('StopWorkflow')))),
      renderActivityTestMessage(),
      h("elsa-confirm-dialog", { ref: el => this.confirmDialog = el, culture: this.culture })));
  }
  static get is() { return "elsa-workflow-test-panel"; }
  static get properties() { return {
    "workflowDefinition": {
      "type": "unknown",
      "mutable": false,
      "complexType": {
        "original": "WorkflowDefinition",
        "resolved": "WorkflowDefinition",
        "references": {
          "WorkflowDefinition": {
            "location": "import",
            "path": "../../../../models"
          }
        }
      },
      "required": false,
      "optional": false,
      "docs": {
        "tags": [],
        "text": ""
      }
    },
    "workflowTestActivityId": {
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
      "attribute": "workflow-test-activity-id",
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
    }
  }; }
  static get states() { return {
    "hubConnection": {},
    "workflowTestActivityMessages": {},
    "workflowStarted": {}
  }; }
  static get watchers() { return [{
      "propName": "workflowTestActivityId",
      "methodName": "workflowTestActivityMessageChangedHandler"
    }]; }
}
Tunnel.injectProps(ElsaWorkflowTestPanel, ['serverUrl', 'culture']);
