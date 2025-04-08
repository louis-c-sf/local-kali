import { Component, h, Prop } from '@stencil/core';
import { loadTranslations } from "../../../i18n/i18n-loader";
import { resources } from "./localizations";
import Tunnel from "../../../../data/dashboard";
export class ElsaStudioWorkflowRegistry {
  async componentWillLoad() {
    this.i18next = await loadTranslations(this.culture, resources);
  }
  render() {
    const basePath = this.basePath;
    const t = x => this.i18next.t(x);
    return (h("div", null,
      h("div", { class: "elsa-border-b elsa-border-gray-200 elsa-px-4 elsa-py-4 sm:elsa-flex sm:elsa-items-center sm:elsa-justify-between sm:elsa-px-6 lg:elsa-px-8 elsa-bg-white" },
        h("div", { class: "elsa-flex-1 elsa-min-w-0" },
          h("h1", { class: "elsa-text-lg elsa-font-medium elsa-leading-6 elsa-text-gray-900 sm:elsa-truncate" }, t('Title'))),
        h("div", { class: "elsa-mt-4 elsa-flex sm:elsa-mt-0 sm:elsa-ml-4" },
          h("stencil-route-link", { url: `${basePath}/workflow-definitions/new`, class: "elsa-order-0 elsa-inline-flex elsa-items-center elsa-px-4 elsa-py-2 elsa-border elsa-border-transparent elsa-shadow-sm elsa-text-sm elsa-font-medium elsa-rounded-md elsa-text-white elsa-bg-blue-600 hover:elsa-bg-blue-700 focus:elsa-outline-none focus:elsa-ring-2 focus:elsa-ring-offset-2 focus:elsa-ring-blue-500 sm:elsa-order-1 sm:elsa-ml-3" }, t('CreateButton')))),
      h("elsa-workflow-registry-list-screen", null)));
  }
  static get is() { return "elsa-studio-workflow-registry"; }
  static get properties() { return {
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
    }
  }; }
}
Tunnel.injectProps(ElsaStudioWorkflowRegistry, ['culture', 'basePath']);
