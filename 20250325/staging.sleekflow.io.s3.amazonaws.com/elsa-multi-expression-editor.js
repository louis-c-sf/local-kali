import { Component, Event, Listen, h, Prop, State } from '@stencil/core';
import { SyntaxNames } from "../../../models";
import { enter, leave, toggle } from 'el-transition';
import { mapSyntaxToLanguage } from "../../../utils/utils";
export class ElsaMultiExpressionEditor {
  constructor() {
    this.defaultSyntax = SyntaxNames.Literal;
    this.expressions = {};
    this.supportedSyntaxes = [];
    this.editorHeight = '10em';
    this.singleLineMode = false;
  }
  async componentWillLoad() {
    this.selectedSyntax = this.syntax;
    this.currentValue = this.expressions[this.selectedSyntax ? this.selectedSyntax : this.defaultSyntax];
  }
  onWindowClicked(event) {
    const target = event.target;
    if (!this.contextMenuWidget || !this.contextMenuWidget.contains(target))
      this.closeContextMenu();
  }
  toggleContextMenu() {
    toggle(this.contextMenu);
  }
  openContextMenu() {
    enter(this.contextMenu);
  }
  closeContextMenu() {
    if (!!this.contextMenu)
      leave(this.contextMenu);
  }
  selectDefaultEditor(e) {
    e.preventDefault();
    this.selectedSyntax = undefined;
    this.closeContextMenu();
  }
  async selectSyntax(e, syntax) {
    e.preventDefault();
    this.selectedSyntax = syntax;
    this.syntaxChanged.emit(syntax);
    this.currentValue = this.expressions[syntax ? syntax : this.defaultSyntax || SyntaxNames.Literal];
    await this.expressionEditor.setExpression(this.currentValue);
    this.closeContextMenu();
  }
  onSettingsClick(e) {
    this.toggleContextMenu();
  }
  onExpressionChanged(e) {
    const expression = e.detail;
    this.expressions[this.selectedSyntax || this.defaultSyntax] = expression;
    this.expressionChanged.emit(expression);
  }
  render() {
    return h("div", null,
      h("div", { class: "elsa-mb-1" },
        h("div", { class: "elsa-flex" },
          h("div", { class: "elsa-flex-1" }, this.renderLabel()),
          this.renderContextMenuWidget())),
      this.renderEditor());
  }
  renderLabel() {
    if (!this.label)
      return undefined;
    const fieldId = this.fieldName;
    const fieldLabel = this.label || fieldId;
    return h("label", { htmlFor: fieldId, class: "elsa-block elsa-text-sm elsa-font-medium elsa-text-gray-700" }, fieldLabel);
  }
  renderContextMenuWidget() {
    if (this.supportedSyntaxes.length == 0)
      return undefined;
    const selectedSyntax = this.selectedSyntax;
    const advancedButtonClass = selectedSyntax ? 'elsa-text-blue-500' : 'elsa-text-gray-300';
    return h("div", { class: "elsa-relative", ref: el => this.contextMenuWidget = el },
      h("button", { type: "button", class: `elsa-border-0 focus:elsa-outline-none elsa-text-sm ${advancedButtonClass}`, onClick: e => this.onSettingsClick(e) }, !this.isReadOnly ? this.renderContextMenuButton() : ""),
      h("div", null,
        h("div", { ref: el => this.contextMenu = el, "data-transition-enter": "elsa-transition elsa-ease-out elsa-duration-100", "data-transition-enter-start": "elsa-transform elsa-opacity-0 elsa-scale-95", "data-transition-enter-end": "elsa-transform elsa-opacity-100 elsa-scale-100", "data-transition-leave": "elsa-transition elsa-ease-in elsa-duration-75", "data-transition-leave-start": "elsa-transform elsa-opacity-100 elsa-scale-100", "data-transition-leave-end": "elsa-transform elsa-opacity-0 elsa-scale-95", class: "hidden elsa-origin-top-right elsa-absolute elsa-right-1 elsa-mt-1 elsa-w-56 elsa-rounded-md elsa-shadow-lg elsa-bg-white elsa-ring-1 elsa-ring-black elsa-ring-opacity-5 elsa-divide-y elsa-divide-gray-100 focus:elsa-outline-none elsa-z-10", role: "menu", "aria-orientation": "vertical", "aria-labelledby": "options-menu" },
          h("div", { class: "elsa-py-1", role: "none" },
            h("a", { onClick: e => this.selectSyntax(e, null), href: "#", class: `elsa-block elsa-px-4 elsa-py-2 elsa-text-sm hover:elsa-bg-gray-100 hover:elsa-text-gray-900 ${!selectedSyntax ? 'elsa-text-blue-700' : 'elsa-text-gray-700'}`, role: "menuitem" }, "Default")),
          h("div", { class: "elsa-py-1", role: "none" }, this.supportedSyntaxes.map(syntax => (h("a", { onClick: e => this.selectSyntax(e, syntax), href: "#", class: `elsa-block elsa-px-4 elsa-py-2 elsa-text-sm hover:elsa-bg-gray-100 hover:elsa-text-gray-900 ${selectedSyntax == syntax ? 'elsa-text-blue-700' : 'elsa-text-gray-700'}`, role: "menuitem" }, syntax)))))));
  }
  renderContextMenuButton() {
    if (!this.selectedSyntax)
      return h("svg", { class: "elsa-h-5 elsa-w-5 elsa-text-gray-400", width: "24", height: "24", viewBox: "0 0 24 24", "stroke-width": "2", stroke: "currentColor", fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round" },
        h("path", { stroke: "none", d: "M0 0h24v24H0z" }),
        h("circle", { cx: "12", cy: "12", r: "9" }),
        h("line", { x1: "8", y1: "12", x2: "8", y2: "12.01" }),
        h("line", { x1: "12", y1: "12", x2: "12", y2: "12.01" }),
        h("line", { x1: "16", y1: "12", x2: "16", y2: "12.01" }));
    return h("span", null, this.selectedSyntax);
  }
  renderEditor() {
    const selectedSyntax = this.selectedSyntax;
    const monacoLanguage = mapSyntaxToLanguage(selectedSyntax);
    const value = this.currentValue;
    const expressionEditorClass = selectedSyntax ? 'block' : 'hidden';
    const defaultEditorClass = selectedSyntax ? 'hidden' : 'block';
    return (h("div", null,
      h("div", { class: expressionEditorClass },
        h("elsa-expression-editor", { ref: el => this.expressionEditor = el, onExpressionChanged: e => this.onExpressionChanged(e), expression: value, language: monacoLanguage, editorHeight: this.editorHeight, singleLineMode: this.singleLineMode, context: this.context })),
      h("div", { class: defaultEditorClass },
        h("slot", null))));
  }
  static get is() { return "elsa-multi-expression-editor"; }
  static get properties() { return {
    "label": {
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
      "attribute": "label",
      "reflect": false
    },
    "fieldName": {
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
      "attribute": "field-name",
      "reflect": false
    },
    "syntax": {
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
      "attribute": "syntax",
      "reflect": false
    },
    "defaultSyntax": {
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
      "attribute": "default-syntax",
      "reflect": false,
      "defaultValue": "SyntaxNames.Literal"
    },
    "expressions": {
      "type": "unknown",
      "mutable": false,
      "complexType": {
        "original": "Map<string>",
        "resolved": "{ [key: string]: string; }",
        "references": {
          "Map": {
            "location": "import",
            "path": "../../../utils/utils"
          }
        }
      },
      "required": false,
      "optional": false,
      "docs": {
        "tags": [],
        "text": ""
      },
      "defaultValue": "{}"
    },
    "supportedSyntaxes": {
      "type": "unknown",
      "mutable": false,
      "complexType": {
        "original": "Array<string>",
        "resolved": "string[]",
        "references": {
          "Array": {
            "location": "global"
          }
        }
      },
      "required": false,
      "optional": false,
      "docs": {
        "tags": [],
        "text": ""
      },
      "defaultValue": "[]"
    },
    "isReadOnly": {
      "type": "boolean",
      "mutable": false,
      "complexType": {
        "original": "boolean",
        "resolved": "boolean",
        "references": {}
      },
      "required": false,
      "optional": true,
      "docs": {
        "tags": [],
        "text": ""
      },
      "attribute": "is-read-only",
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
    }
  }; }
  static get states() { return {
    "selectedSyntax": {},
    "currentValue": {}
  }; }
  static get events() { return [{
      "method": "syntaxChanged",
      "name": "syntaxChanged",
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
    }, {
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
  static get listeners() { return [{
      "name": "click",
      "method": "onWindowClicked",
      "target": "window",
      "capture": false,
      "passive": false
    }]; }
}
