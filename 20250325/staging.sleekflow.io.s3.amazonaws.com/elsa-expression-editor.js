import { Component, h, Method, Prop, State, Watch, Event } from '@stencil/core';
import { createElsaClient } from "../../../services";
import Tunnel from '../../../data/workflow-editor';
export class ElsaExpressionEditor {
  constructor() {
    this.editorHeight = '6em';
    this.singleLineMode = false;
  }
  expressionChangedHandler(newValue) {
    this.currentExpression = newValue;
  }
  async setExpression(value) {
    await this.monacoEditor.setValue(value);
  }
  async componentWillLoad() {
    this.currentExpression = this.expression;
  }
  async componentDidLoad() {
    const elsaClient = await createElsaClient(this.serverUrl);
    const libSource = await elsaClient.scriptingApi.getJavaScriptTypeDefinitions(this.workflowDefinitionId, this.context);
    const libUri = 'defaultLib:lib.es6.d.ts';
    await this.monacoEditor.addJavaScriptLib(libSource, libUri);
  }
  async onMonacoValueChanged(e) {
    this.currentExpression = e.value;
    await this.expressionChanged.emit(e.value);
  }
  render() {
    const language = this.language;
    const value = this.currentExpression;
    return (h("elsa-monaco", { value: value, language: language, "editor-height": this.editorHeight, "single-line": this.singleLineMode, padding: this.padding, onValueChanged: e => this.onMonacoValueChanged(e.detail), ref: el => this.monacoEditor = el }));
  }
  static get is() { return "elsa-expression-editor"; }
  static get properties() { return {
    "language": {
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
      "attribute": "language",
      "reflect": false
    },
    "expression": {
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
      "attribute": "expression",
      "reflect": false
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
      "defaultValue": "'6em'"
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
    "padding": {
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
      "attribute": "padding",
      "reflect": false
    },
    "context": {
      "type": "unknown",
      "mutable": false,
      "complexType": {
        "original": "IntellisenseContext",
        "resolved": "IntellisenseContext",
        "references": {
          "IntellisenseContext": {
            "location": "import",
            "path": "../../../models"
          }
        }
      },
      "required": false,
      "optional": true,
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
    },
    "workflowDefinitionId": {
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
      "attribute": "workflow-definition-id",
      "reflect": false
    }
  }; }
  static get states() { return {
    "currentExpression": {}
  }; }
  static get events() { return [{
      "method": "expressionChanged",
      "name": "expressionChanged",
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
  static get methods() { return {
    "setExpression": {
      "complexType": {
        "signature": "(value: string) => Promise<void>",
        "parameters": [{
            "tags": [],
            "text": ""
          }],
        "references": {
          "Promise": {
            "location": "global"
          }
        },
        "return": "Promise<void>"
      },
      "docs": {
        "text": "",
        "tags": []
      }
    }
  }; }
  static get watchers() { return [{
      "propName": "expression",
      "methodName": "expressionChangedHandler"
    }]; }
}
Tunnel.injectProps(ElsaExpressionEditor, ['serverUrl', 'workflowDefinitionId']);
