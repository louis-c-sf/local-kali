import { Component, h, Prop } from '@stencil/core';
import { loadTranslations } from "../../../i18n/i18n-loader";
import { resources } from "./localizations";
export class ElsaStudioWorkflowInstancesList {
  async componentWillLoad() {
    this.i18next = await loadTranslations(this.culture, resources);
  }
  render() {
    const t = x => this.i18next.t(x);
    return (h("div", null,
      h("div", { class: "elsa-border-b elsa-border-gray-200 elsa-px-4 elsa-py-4 sm:elsa-flex sm:elsa-items-center sm:elsa-justify-between sm:elsa-px-6 lg:elsa-px-8 elsa-bg-white" },
        h("div", { class: "elsa-flex-1 elsa-min-w-0" },
          h("h1", { class: "elsa-text-lg elsa-font-medium elsa-leading-6 elsa-text-gray-900 sm:elsa-truncate" }, t('Title')))),
      h("elsa-workflow-instance-list-screen", null)));
  }
  static get is() { return "elsa-studio-workflow-instances-list"; }
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
    }
  }; }
}
