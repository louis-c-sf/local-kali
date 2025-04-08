import { Component, Prop, h, State, Watch, Host } from '@stencil/core';
import { loadTranslations } from "../../../i18n/i18n-loader";
import { resources } from "./localizations";
import { createElsaClient } from "../../../../services";
import Tunnel from "../../../../data/dashboard";
export class ElsaWorkflowBlueprintPropertiesPanel {
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
    return (h(Host, null,
      h("dl", { class: "elsa-border-b elsa-border-gray-200 elsa-divide-y elsa-divide-gray-200" },
        h("div", { class: "elsa-py-3 elsa-flex elsa-justify-between elsa-text-sm elsa-font-medium" },
          h("dt", { class: "elsa-text-gray-500" }, t('Name')),
          h("dd", { class: "elsa-text-gray-900" }, name)),
        h("div", { class: "elsa-py-3 elsa-flex elsa-justify-between elsa-text-sm elsa-font-medium" },
          h("dt", { class: "elsa-text-gray-500" }, t('Id')),
          h("dd", { class: "elsa-text-gray-900 elsa-break-all" }, workflowBlueprint.id || '-')),
        h("div", { class: "elsa-py-3 elsa-flex elsa-justify-between elsa-text-sm elsa-font-medium" },
          h("dt", { class: "elsa-text-gray-500" }, t('Version')),
          h("dd", { class: "elsa-text-gray-900" }, workflowBlueprint.version)),
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
  static get is() { return "elsa-workflow-blueprint-properties-panel"; }
  static get properties() { return {
    "workflowId": {
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
      "attribute": "workflow-id",
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
    "workflowBlueprint": {},
    "publishedVersion": {}
  }; }
  static get watchers() { return [{
      "propName": "workflowId",
      "methodName": "workflowIdChangedHandler"
    }]; }
}
Tunnel.injectProps(ElsaWorkflowBlueprintPropertiesPanel, ['serverUrl', 'culture']);
