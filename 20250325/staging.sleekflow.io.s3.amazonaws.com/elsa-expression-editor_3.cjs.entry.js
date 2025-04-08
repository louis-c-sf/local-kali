'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const index = require('./index-915b0bc2.js');
const domain = require('./domain-b01b4a53.js');
const elsaClient = require('./elsa-client-e99f1b35.js');
const utils = require('./utils-5d19a660.js');
require('./index-1eae61b2.js');
require('./cronstrue-62722667.js');
const workflowEditor = require('./workflow-editor-a145e6dc.js');
const index$1 = require('./index-169661bf.js');
require('./index-a2f6d9eb.js');
require('./axios-middleware.esm-f337c7ad.js');
require('./collection-724169f5.js');
require('./_commonjsHelpers-a5111d61.js');
require('./event-bus-8066af27.js');
require('./state-tunnel-786a62ce.js');

let ElsaExpressionEditor = class {
  constructor(hostRef) {
    index.registerInstance(this, hostRef);
    this.expressionChanged = index.createEvent(this, "expressionChanged", 7);
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
    const elsaClient$1 = await elsaClient.createElsaClient(this.serverUrl);
    const libSource = await elsaClient$1.scriptingApi.getJavaScriptTypeDefinitions(this.workflowDefinitionId, this.context);
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
    return (index.h("elsa-monaco", { value: value, language: language, "editor-height": this.editorHeight, "single-line": this.singleLineMode, padding: this.padding, onValueChanged: e => this.onMonacoValueChanged(e.detail), ref: el => this.monacoEditor = el }));
  }
  static get watchers() { return {
    "expression": ["expressionChangedHandler"]
  }; }
};
workflowEditor.Tunnel.injectProps(ElsaExpressionEditor, ['serverUrl', 'workflowDefinitionId']);

let ElsaMultiExpressionEditor = class {
  constructor(hostRef) {
    index.registerInstance(this, hostRef);
    this.syntaxChanged = index.createEvent(this, "syntaxChanged", 7);
    this.expressionChanged = index.createEvent(this, "expressionChanged", 7);
    this.defaultSyntax = domain.SyntaxNames.Literal;
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
    index$1.toggle(this.contextMenu);
  }
  openContextMenu() {
    index$1.enter(this.contextMenu);
  }
  closeContextMenu() {
    if (!!this.contextMenu)
      index$1.leave(this.contextMenu);
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
    this.currentValue = this.expressions[syntax ? syntax : this.defaultSyntax || domain.SyntaxNames.Literal];
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
    return index.h("div", null, index.h("div", { class: "elsa-mb-1" }, index.h("div", { class: "elsa-flex" }, index.h("div", { class: "elsa-flex-1" }, this.renderLabel()), this.renderContextMenuWidget())), this.renderEditor());
  }
  renderLabel() {
    if (!this.label)
      return undefined;
    const fieldId = this.fieldName;
    const fieldLabel = this.label || fieldId;
    return index.h("label", { htmlFor: fieldId, class: "elsa-block elsa-text-sm elsa-font-medium elsa-text-gray-700" }, fieldLabel);
  }
  renderContextMenuWidget() {
    if (this.supportedSyntaxes.length == 0)
      return undefined;
    const selectedSyntax = this.selectedSyntax;
    const advancedButtonClass = selectedSyntax ? 'elsa-text-blue-500' : 'elsa-text-gray-300';
    return index.h("div", { class: "elsa-relative", ref: el => this.contextMenuWidget = el }, index.h("button", { type: "button", class: `elsa-border-0 focus:elsa-outline-none elsa-text-sm ${advancedButtonClass}`, onClick: e => this.onSettingsClick(e) }, !this.isReadOnly ? this.renderContextMenuButton() : ""), index.h("div", null, index.h("div", { ref: el => this.contextMenu = el, "data-transition-enter": "elsa-transition elsa-ease-out elsa-duration-100", "data-transition-enter-start": "elsa-transform elsa-opacity-0 elsa-scale-95", "data-transition-enter-end": "elsa-transform elsa-opacity-100 elsa-scale-100", "data-transition-leave": "elsa-transition elsa-ease-in elsa-duration-75", "data-transition-leave-start": "elsa-transform elsa-opacity-100 elsa-scale-100", "data-transition-leave-end": "elsa-transform elsa-opacity-0 elsa-scale-95", class: "hidden elsa-origin-top-right elsa-absolute elsa-right-1 elsa-mt-1 elsa-w-56 elsa-rounded-md elsa-shadow-lg elsa-bg-white elsa-ring-1 elsa-ring-black elsa-ring-opacity-5 elsa-divide-y elsa-divide-gray-100 focus:elsa-outline-none elsa-z-10", role: "menu", "aria-orientation": "vertical", "aria-labelledby": "options-menu" }, index.h("div", { class: "elsa-py-1", role: "none" }, index.h("a", { onClick: e => this.selectSyntax(e, null), href: "#", class: `elsa-block elsa-px-4 elsa-py-2 elsa-text-sm hover:elsa-bg-gray-100 hover:elsa-text-gray-900 ${!selectedSyntax ? 'elsa-text-blue-700' : 'elsa-text-gray-700'}`, role: "menuitem" }, "Default")), index.h("div", { class: "elsa-py-1", role: "none" }, this.supportedSyntaxes.map(syntax => (index.h("a", { onClick: e => this.selectSyntax(e, syntax), href: "#", class: `elsa-block elsa-px-4 elsa-py-2 elsa-text-sm hover:elsa-bg-gray-100 hover:elsa-text-gray-900 ${selectedSyntax == syntax ? 'elsa-text-blue-700' : 'elsa-text-gray-700'}`, role: "menuitem" }, syntax)))))));
  }
  renderContextMenuButton() {
    if (!this.selectedSyntax)
      return index.h("svg", { class: "elsa-h-5 elsa-w-5 elsa-text-gray-400", width: "24", height: "24", viewBox: "0 0 24 24", "stroke-width": "2", stroke: "currentColor", fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round" }, index.h("path", { stroke: "none", d: "M0 0h24v24H0z" }), index.h("circle", { cx: "12", cy: "12", r: "9" }), index.h("line", { x1: "8", y1: "12", x2: "8", y2: "12.01" }), index.h("line", { x1: "12", y1: "12", x2: "12", y2: "12.01" }), index.h("line", { x1: "16", y1: "12", x2: "16", y2: "12.01" }));
    return index.h("span", null, this.selectedSyntax);
  }
  renderEditor() {
    const selectedSyntax = this.selectedSyntax;
    const monacoLanguage = utils.mapSyntaxToLanguage(selectedSyntax);
    const value = this.currentValue;
    const expressionEditorClass = selectedSyntax ? 'block' : 'hidden';
    const defaultEditorClass = selectedSyntax ? 'hidden' : 'block';
    return (index.h("div", null, index.h("div", { class: expressionEditorClass }, index.h("elsa-expression-editor", { ref: el => this.expressionEditor = el, onExpressionChanged: e => this.onExpressionChanged(e), expression: value, language: monacoLanguage, editorHeight: this.editorHeight, singleLineMode: this.singleLineMode, context: this.context })), index.h("div", { class: defaultEditorClass }, index.h("slot", null))));
  }
};

const elsaPropertyEditorCss = "";

let ElsaPropertyEditor = class {
  constructor(hostRef) {
    index.registerInstance(this, hostRef);
    this.defaultSyntaxValueChanged = index.createEvent(this, "defaultSyntaxValueChanged", 7);
    this.editorHeight = '10em';
    this.singleLineMode = false;
    this.showLabel = true;
  }
  onSyntaxChanged(e) {
    this.propertyModel.syntax = e.detail;
  }
  onExpressionChanged(e) {
    const defaultSyntax = this.propertyDescriptor.defaultSyntax || domain.SyntaxNames.Literal;
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
    return index.h("div", null, index.h("elsa-multi-expression-editor", { onSyntaxChanged: e => this.onSyntaxChanged(e), onExpressionChanged: e => this.onExpressionChanged(e), fieldName: fieldName, label: label, syntax: propertyModel.syntax, defaultSyntax: propertyDescriptor.defaultSyntax, isReadOnly: propertyDescriptor.isReadOnly, expressions: propertyModel.expressions, supportedSyntaxes: propertyDescriptor.supportedSyntaxes, "editor-height": this.editorHeight, context: context }, index.h("slot", null)), fieldHint ? index.h("p", { class: "elsa-mt-2 elsa-text-sm elsa-text-gray-500" }, fieldHint) : undefined);
  }
};
ElsaPropertyEditor.style = elsaPropertyEditorCss;

exports.elsa_expression_editor = ElsaExpressionEditor;
exports.elsa_multi_expression_editor = ElsaMultiExpressionEditor;
exports.elsa_property_editor = ElsaPropertyEditor;
