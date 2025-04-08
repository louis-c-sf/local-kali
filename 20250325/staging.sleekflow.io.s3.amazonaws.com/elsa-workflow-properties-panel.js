import { Component, Prop, h, State, Watch, Host } from '@stencil/core';
import { enter, leave } from "el-transition";
import { loadTranslations } from "../../../i18n/i18n-loader";
import { resources } from "./localizations";
import { createElsaClient } from "../../../../services";
import Tunnel from "../../../../data/dashboard";
export class ElsaWorkflowPropertiesPanel {
  constructor() {
    this.toggle = () => {
      if (this.expanded) {
        leave(this.el).then(() => this.expanded = false);
      }
      else {
        this.expanded = true;
        enter(this.el);
      }
    };
  }
  async workflowDefinitionChangedHandler(newWorkflow, oldWorkflow) {
    if (newWorkflow.version !== oldWorkflow.version || newWorkflow.isPublished !== oldWorkflow.isPublished || newWorkflow.isLatest !== oldWorkflow.isLatest)
      await this.loadPublishedVersion();
  }
  async componentWillLoad() {
    this.i18next = await loadTranslations(this.culture, resources);
    await this.loadPublishedVersion();
  }
  render() {
    const t = (x, params) => this.i18next.t(x, params);
    const { workflowDefinition } = this;
    const name = workflowDefinition.name || this.i18next.t("Untitled");
    const { isPublished } = workflowDefinition;
    return (h(Host, null,
      h("dl", { class: "elsa-border-b elsa-border-gray-200 elsa-divide-y elsa-divide-gray-200" },
        h("div", { class: "elsa-py-3 elsa-flex elsa-justify-between elsa-text-sm elsa-font-medium" },
          h("dt", { class: "elsa-text-gray-500" }, t('Name')),
          h("dd", { class: "elsa-text-gray-900" }, name)),
        h("div", { class: "elsa-py-3 elsa-flex elsa-justify-between elsa-text-sm elsa-font-medium" },
          h("dt", { class: "elsa-text-gray-500" }, t('DisplayName')),
          h("dd", { class: "elsa-text-gray-900" }, workflowDefinition.displayName || '-')),
        h("div", { class: "elsa-py-3 elsa-flex elsa-justify-between elsa-text-sm elsa-font-medium" },
          h("dt", { class: "elsa-text-gray-500" }, t('Id')),
          h("dd", { class: "elsa-text-gray-900 elsa-break-all" }, workflowDefinition.definitionId || '-')),
        h("div", { class: "elsa-py-3 elsa-flex elsa-justify-between elsa-text-sm elsa-font-medium" },
          h("dt", { class: "elsa-text-gray-500" }, t('Version')),
          h("dd", { class: "elsa-text-gray-900" }, workflowDefinition.version)),
        h("div", { class: "elsa-py-3 elsa-flex elsa-justify-between elsa-text-sm elsa-font-medium" },
          h("dt", { class: "elsa-text-gray-500" }, t('PublishedVersion')),
          h("dd", { class: "elsa-text-gray-900" }, this.publishedVersion || '-')),
        h("div", { class: "elsa-py-3 elsa-flex elsa-justify-between elsa-text-sm elsa-font-medium" },
          h("dt", { class: "elsa-text-gray-500" }, t('Status')),
          h("dd", { class: `${isPublished ? 'elsa-text-green-600' : 'elsa-text-yellow-700'}` }, isPublished ? t('Published') : t('Draft'))))));
  }
  createClient() {
    return createElsaClient(this.serverUrl);
  }
  async loadPublishedVersion() {
    const elsaClient = await this.createClient();
    const { workflowDefinition } = this;
    const publishedWorkflowDefinitions = await elsaClient.workflowDefinitionsApi.getMany([workflowDefinition.definitionId], { isPublished: true });
    const publishedDefinition = workflowDefinition.isPublished ? workflowDefinition : publishedWorkflowDefinitions.find(x => x.definitionId == workflowDefinition.definitionId);
    if (publishedDefinition) {
      this.publishedVersion = publishedDefinition.version;
    }
  }
  static get is() { return "elsa-workflow-properties-panel"; }
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
    "publishedVersion": {},
    "expanded": {}
  }; }
  static get watchers() { return [{
      "propName": "workflowDefinition",
      "methodName": "workflowDefinitionChangedHandler"
    }]; }
}
Tunnel.injectProps(ElsaWorkflowPropertiesPanel, ['serverUrl', 'culture']);
