import { Component, h, Prop, State } from '@stencil/core';
import { SyntaxNames } from "../../../../models";
import Tunnel from "../../../../data/workflow-editor";
import { getSelectListItems } from "../../../../utils/select-list-items";
export class ElsaDropdownProperty {
  constructor() {
    this.selectList = { items: [], isFlagsEnum: false };
  }
  async componentWillLoad() {
    const defaultSyntax = this.propertyDescriptor.defaultSyntax || SyntaxNames.Literal;
    this.currentValue = this.propertyModel.expressions[defaultSyntax] || undefined;
    this.selectList = await getSelectListItems(this.serverUrl, this.propertyDescriptor);
    if (this.currentValue == undefined) {
      const firstOption = this.selectList.items[0];
      if (firstOption) {
        const optionIsObject = typeof (firstOption) == 'object';
        this.currentValue = optionIsObject ? firstOption.value : firstOption.toString();
      }
    }
  }
  onChange(e) {
    const select = e.target;
    const defaultSyntax = this.propertyDescriptor.defaultSyntax || SyntaxNames.Literal;
    this.propertyModel.expressions[defaultSyntax] = this.currentValue = select.value;
  }
  onDefaultSyntaxValueChanged(e) {
    this.currentValue = e.detail;
  }
  render() {
    const propertyDescriptor = this.propertyDescriptor;
    const propertyModel = this.propertyModel;
    const propertyName = propertyDescriptor.name;
    const fieldId = propertyName;
    const fieldName = propertyName;
    let currentValue = this.currentValue;
    const { items } = this.selectList;
    if (currentValue == undefined) {
      const defaultValue = this.propertyDescriptor.defaultValue;
      currentValue = defaultValue ? defaultValue.toString() : undefined;
    }
    return (h("elsa-property-editor", { activityModel: this.activityModel, propertyDescriptor: propertyDescriptor, propertyModel: propertyModel, onDefaultSyntaxValueChanged: e => this.onDefaultSyntaxValueChanged(e), "single-line": true },
      h("select", { id: fieldId, name: fieldName, onChange: e => this.onChange(e), class: "elsa-mt-1 elsa-block focus:elsa-ring-blue-500 focus:elsa-border-blue-500 elsa-w-full elsa-shadow-sm sm:elsa-max-w-xs sm:elsa-text-sm elsa-border-gray-300 elsa-rounded-md" }, items.map(item => {
        const optionIsObject = typeof (item) == 'object';
        const value = optionIsObject ? item.value : item.toString();
        const text = optionIsObject ? item.text : item.toString();
        return h("option", { value: value, selected: value === currentValue }, text);
      }))));
  }
  static get is() { return "elsa-dropdown-property"; }
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
Tunnel.injectProps(ElsaDropdownProperty, ['serverUrl']);
