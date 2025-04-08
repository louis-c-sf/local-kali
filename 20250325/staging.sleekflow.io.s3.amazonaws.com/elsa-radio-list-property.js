import { Component, h, Prop, State } from '@stencil/core';
import { SyntaxNames } from "../../../../models";
import { getSelectListItems } from "../../../../utils/select-list-items";
import Tunnel from "../../../../data/workflow-editor";
export class ElsaRadioListProperty {
  constructor() {
    this.selectList = { items: [], isFlagsEnum: false };
  }
  async componentWillLoad() {
    const defaultSyntax = this.propertyDescriptor.defaultSyntax || SyntaxNames.Literal;
    this.currentValue = this.propertyModel.expressions[defaultSyntax] || null;
  }
  onCheckChanged(e) {
    const radio = e.target;
    const checked = radio.checked;
    if (checked)
      this.currentValue = radio.value;
    const defaultSyntax = this.propertyDescriptor.defaultSyntax || SyntaxNames.Literal;
    this.propertyModel.expressions[defaultSyntax] = this.currentValue;
  }
  onDefaultSyntaxValueChanged(e) {
    this.currentValue = e.detail;
  }
  async componentWillRender() {
    this.selectList = await getSelectListItems(this.serverUrl, this.propertyDescriptor);
  }
  render() {
    const propertyDescriptor = this.propertyDescriptor;
    const propertyModel = this.propertyModel;
    const fieldId = propertyDescriptor.name;
    const selectList = this.selectList;
    const items = selectList.items;
    const currentValue = this.currentValue;
    return (h("elsa-property-editor", { activityModel: this.activityModel, propertyDescriptor: propertyDescriptor, propertyModel: propertyModel, onDefaultSyntaxValueChanged: e => this.onDefaultSyntaxValueChanged(e), "single-line": true },
      h("div", { class: "elsa-max-w-lg elsa-space-y-3 elsa-my-4" }, items.map((item, index) => {
        const inputId = `${fieldId}_${index}`;
        const optionIsString = typeof (item) == 'string';
        const value = optionIsString ? item : item.value;
        const text = optionIsString ? item : item.text;
        const isSelected = currentValue == value;
        return (h("div", { class: "elsa-relative elsa-flex elsa-items-start" },
          h("div", { class: "elsa-flex elsa-items-center elsa-h-5" },
            h("input", { id: inputId, type: "radio", radioGroup: fieldId, checked: isSelected, value: value, onChange: e => this.onCheckChanged(e), class: "elsa-focus:ring-blue-500 elsa-h-4 elsa-w-4 elsa-text-blue-600 elsa-border-gray-300" })),
          h("div", { class: "elsa-ml-3 elsa-mt-1 elsa-text-sm" },
            h("label", { htmlFor: inputId, class: "elsa-font-medium elsa-text-gray-700" }, text))));
      }))));
  }
  static get is() { return "elsa-radio-list-property"; }
  static get properties() { return {
    "activityModel": {
      "type": "unknown",
      "mutable": false,
      "complexType": {
        "original": "ActivityModel",
        "resolved": "ActivityModel",
        "references": {
          "ActivityModel": {
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
    "propertyDescriptor": {
      "type": "unknown",
      "mutable": false,
      "complexType": {
        "original": "ActivityPropertyDescriptor",
        "resolved": "ActivityPropertyDescriptor",
        "references": {
          "ActivityPropertyDescriptor": {
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
    "propertyModel": {
      "type": "unknown",
      "mutable": false,
      "complexType": {
        "original": "ActivityDefinitionProperty",
        "resolved": "ActivityDefinitionProperty",
        "references": {
          "ActivityDefinitionProperty": {
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
    "serverUrl": {
      "type": "string",
      "mutable": true,
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
    "currentValue": {}
  }; }
}
Tunnel.injectProps(ElsaRadioListProperty, ['serverUrl']);
