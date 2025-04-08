import { Component, h, Prop, Event } from '@stencil/core';
import { SyntaxNames } from "../../../models";
export class ElsaPropertyEditor {
  constructor() {
    this.editorHeight = '10em';
    this.singleLineMode = false;
    this.showLabel = true;
  }
  onSyntaxChanged(e) {
    this.propertyModel.syntax = e.detail;
  }
  onExpressionChanged(e) {
    const defaultSyntax = this.propertyDescriptor.defaultSyntax || SyntaxNames.Literal;
    const syntax = this.propertyModel.syntax || defaultSyntax;
    this.propertyModel.expressions[syntax] = e.detail;
    if (syntax != defaultSyntax)
      return;
    this.defaultSyntaxValueChanged.emit(e.detail);
  }
  render() {
    const propertyDescriptor = this.propertyDescriptor;
    const propertyModel = this.propertyModel;
    const fieldHint = propertyDescriptor.hint;
    const fieldName = propertyDescriptor.name;
    const label = this.showLabel ? propertyDescriptor.label : null;
    const context = {
      propertyName: propertyDescriptor.name,
      activityTypeName: this.activityModel.type
    };
    return h("div", null,
      h("elsa-multi-expression-editor", { onSyntaxChanged: e => this.onSyntaxChanged(e), onExpressionChanged: e => this.onExpressionChanged(e), fieldName: fieldName, label: label, syntax: propertyModel.syntax, defaultSyntax: propertyDescriptor.defaultSyntax, isReadOnly: propertyDescriptor.isReadOnly, expressions: propertyModel.expressions, supportedSyntaxes: propertyDescriptor.supportedSyntaxes, "editor-height": this.editorHeight, context: context },
        h("slot", null)),
      fieldHint ? h("p", { class: "elsa-mt-2 elsa-text-sm elsa-text-gray-500" }, fieldHint) : undefined);
  }
  static get is() { return "elsa-property-editor"; }
  static get originalStyleUrls() { return {
    "$": ["elsa-property-editor.css"]
  }; }
  static get styleUrls() { return {
    "$": ["elsa-property-editor.css"]
  }; }
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
            "path": "../../../models"
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
            "path": "../../../models"
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
            "path": "../../../models"
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
    "editorHeight": {
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
      "attribute": "editor-height",
      "reflect": true,
      "defaultValue": "'10em'"
    },
    "singleLineMode": {
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
      "attribute": "single-line",
      "reflect": true,
      "defaultValue": "false"
    },
    "context": {
      "type": "string",
      "mutable": false,
      "complexType": {
        "original": "string",
        "resolved": "string",
        "references": {}
      },
      "required": false,
      "optional": true,
      "docs": {
        "tags": [],
        "text": ""
      },
      "attribute": "context",
      "reflect": true
    },
    "showLabel": {
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
      "attribute": "show-label",
      "reflect": false,
      "defaultValue": "true"
    }
  }; }
  static get events() { return [{
      "method": "defaultSyntaxValueChanged",
      "name": "defaultSyntaxValueChanged",
      "bubbles": true,
      "cancelable": true,
      "composed": true,
      "docs": {
        "tags": [],
        "text": ""
      },
      "complexType": {
        "original": "string",
        "resolved": "string",
        "references": {}
      }
    }]; }
}
