import { Component, Host, h, Prop } from '@stencil/core';
export class ElsaTabContent {
  render() {
    return (h(Host, null,
      h("div", { class: `${this.active ? '' : 'elsa-hidden'} elsa-overflow-y-auto elsa-h-full` },
        h("slot", null))));
  }
  static get is() { return "elsa-tab-content"; }
  static get properties() { return {
    "tab": {
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
      "attribute": "tab",
      "reflect": false
    },
    "active": {
      "type": "boolean",
      "mutable": false,
      "complexType": {
        "original": "boolean",
        "resolved": "boolean",
        "references": {}
      },
      "required": false,
      "optional": false,
      "docs": {
        "tags": [],
        "text": ""
      },
      "attribute": "active",
      "reflect": false
    }
  }; }
}
