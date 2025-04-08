'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const index = require('./index-915b0bc2.js');
require('./domain-b01b4a53.js');
const axiosMiddleware_esm = require('./axios-middleware.esm-f337c7ad.js');
const eventBus = require('./event-bus-8066af27.js');
const elsaClient = require('./elsa-client-e99f1b35.js');
require('./utils-5d19a660.js');
require('./index-1eae61b2.js');
require('./cronstrue-62722667.js');
const workflowEditor = require('./workflow-editor-a145e6dc.js');
require('./index-a2f6d9eb.js');
require('./collection-724169f5.js');
require('./_commonjsHelpers-a5111d61.js');
require('./state-tunnel-786a62ce.js');

let ElsaScriptProperty = class {
  constructor(hostRef) {
    index.registerInstance(this, hostRef);
    this.editorHeight = '6em';
    this.singleLineMode = false;
    this.activityValidatingContext = null;
    this.configureComponentCustomButtonContext = null;
  }
  async componentWillLoad() {
    this.currentValue = this.propertyModel.expressions['Literal'];
    await this.configureComponentCustomButton();
    this.validate(this.currentValue);
  }
  async componentDidLoad() {
    const elsaClient$1 = await elsaClient.createElsaClient(this.serverUrl);
    const context = {
      propertyName: this.propertyDescriptor.name,
      activityTypeName: this.activityModel.type
    };
    const libSource = await elsaClient$1.scriptingApi.getJavaScriptTypeDefinitions(this.workflowDefinitionId, context);
    const libUri = 'defaultLib:lib.es6.d.ts';
    await this.monacoEditor.addJavaScriptLib(libSource, libUri);
  }
  async configureComponentCustomButton() {
    this.configureComponentCustomButtonContext = {
      component: 'elsa-script-property',
      activityType: this.activityModel.type,
      prop: this.propertyDescriptor.name,
      data: null
    };
    await eventBus.eventBus.emit(axiosMiddleware_esm.EventTypes.ComponentLoadingCustomButton, this, this.configureComponentCustomButtonContext);
  }
  mapSyntaxToLanguage(syntax) {
    switch (syntax) {
      case 'JavaScript':
        return 'javascript';
      case 'Liquid':
        return 'handlebars';
      case 'Literal':
      default:
        return 'plaintext';
    }
  }
  onComponentCustomButtonClick(e) {
    e.preventDefault();
    const componentCustomButtonClickContext = {
      component: 'elsa-script-property',
      activityType: this.activityModel.type,
      prop: this.propertyDescriptor.name,
      params: null
    };
    eventBus.eventBus.emit(axiosMiddleware_esm.EventTypes.ComponentCustomButtonClick, this, componentCustomButtonClickContext);
  }
  onMonacoValueChanged(e) {
    this.currentValue = e.value;
    this.validate(this.currentValue);
  }
  validate(value) {
    this.activityValidatingContext = {
      activityType: this.activityModel.type,
      prop: this.propertyDescriptor.name,
      value: value,
      data: null,
      isValidated: false,
      isValid: false
    };
    eventBus.eventBus.emit(axiosMiddleware_esm.EventTypes.ActivityPluginValidating, this, this.activityValidatingContext);
  }
  render() {
    const propertyDescriptor = this.propertyDescriptor;
    const syntax = this.syntax;
    const monacoLanguage = this.mapSyntaxToLanguage(syntax);
    const propertyName = propertyDescriptor.name;
    const fieldId = propertyName;
    const fieldName = propertyName;
    const fieldLabel = propertyDescriptor.label || propertyName;
    const fieldHint = propertyDescriptor.hint;
    const value = this.currentValue;
    const renderValidationResult = () => {
      if (this.activityValidatingContext == null || !this.activityValidatingContext.isValidated)
        return;
      const isPositiveResult = this.activityValidatingContext.isValid;
      const color = isPositiveResult ? 'green' : 'red';
      return (index.h("div", { class: "elsa-mt-3" }, index.h("p", { class: `elsa-mt-1 elsa-text-sm elsa-text-${color}-500` }, this.activityValidatingContext.data)));
    };
    const renderComponentCustomButton = () => {
      if (this.configureComponentCustomButtonContext.data == null)
        return;
      const label = this.configureComponentCustomButtonContext.data.label;
      return (index.h("div", { class: "elsa-mt-3" }, index.h("a", { href: "#", onClick: e => this.onComponentCustomButtonClick(e), class: "elsa-relative elsa-inline-flex elsa-items-center elsa-px-4 elsa-py-2 elsa-border elsa-border-gray-300 elsa-text-sm elsa-leading-5 elsa-font-medium elsa-rounded-md elsa-text-gray-700 elsa-bg-white hover:elsa-text-gray-500 focus:elsa-outline-none focus:elsa-shadow-outline-blue focus:elsa-border-blue-300 active:elsa-bg-gray-100 active:elsa-text-gray-700 elsa-transition elsa-ease-in-out elsa-duration-150" }, label)));
    };
    return index.h("div", null, index.h("div", { class: "elsa-flex" }, index.h("div", { class: "" }, index.h("label", { htmlFor: fieldId, class: "elsa-block elsa-text-sm elsa-font-medium elsa-text-gray-700" }, fieldLabel)), index.h("div", { class: "elsa-flex-1" }, index.h("div", null, index.h("div", { class: "hidden sm:elsa-block" }, index.h("nav", { class: "elsa-flex elsa-flex-row-reverse", "aria-label": "Tabs" }, index.h("span", { class: "elsa-bg-blue-100 elsa-text-blue-700 elsa-px-3 elsa-py-2 elsa-font-medium elsa-text-sm elsa-rounded-md" }, syntax)))))), index.h("div", { class: "elsa-mt-1" }, index.h("elsa-monaco", { value: value, language: monacoLanguage, "editor-height": this.editorHeight, "single-line": this.singleLineMode, onValueChanged: e => this.onMonacoValueChanged(e.detail), ref: el => this.monacoEditor = el })), fieldHint ? index.h("p", { class: "elsa-mt-2 elsa-text-sm elsa-text-gray-500" }, fieldHint) : undefined, index.h("input", { type: "hidden", name: fieldName, value: value }), renderValidationResult(), renderComponentCustomButton());
  }
};
workflowEditor.Tunnel.injectProps(ElsaScriptProperty, ['serverUrl', 'workflowDefinitionId']);

exports.elsa_script_property = ElsaScriptProperty;
