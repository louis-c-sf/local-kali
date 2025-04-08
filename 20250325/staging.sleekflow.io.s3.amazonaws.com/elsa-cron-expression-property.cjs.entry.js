'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const index = require('./index-915b0bc2.js');
const cronstrue = require('./cronstrue-62722667.js');
const domain = require('./domain-b01b4a53.js');
require('./_commonjsHelpers-a5111d61.js');

let ElsaCronExpressionProperty = class {
  constructor(hostRef) {
    index.registerInstance(this, hostRef);
  }
  onChange(e) {
    const input = e.currentTarget;
    const defaultSyntax = this.propertyDescriptor.defaultSyntax || domain.SyntaxNames.Literal;
    this.propertyModel.expressions[defaultSyntax] = this.currentValue = input.value;
    this.updateDescription();
  }
  componentWillLoad() {
    const defaultSyntax = this.propertyDescriptor.defaultSyntax || domain.SyntaxNames.Literal;
    this.currentValue = this.propertyModel.expressions[defaultSyntax] || undefined;
    this.updateDescription();
  }
  onDefaultSyntaxValueChanged(e) {
    this.currentValue = e.detail;
  }
  updateDescription() {
    this.valueDescription = cronstrue.cronstrue.toString(this.currentValue, { throwExceptionOnParseError: false });
  }
  render() {
    const propertyDescriptor = this.propertyDescriptor;
    const propertyModel = this.propertyModel;
    const propertyName = propertyDescriptor.name;
    const isReadOnly = propertyDescriptor.isReadOnly;
    const fieldId = propertyName;
    const fieldName = propertyName;
    let value = this.currentValue;
    if (value == undefined) {
      const defaultValue = this.propertyDescriptor.defaultValue;
      value = defaultValue ? defaultValue.toString() : undefined;
    }
    if (isReadOnly) {
      const defaultSyntax = this.propertyDescriptor.defaultSyntax || domain.SyntaxNames.Literal;
      this.propertyModel.expressions[defaultSyntax] = value;
    }
    return (index.h("elsa-property-editor", { activityModel: this.activityModel, propertyDescriptor: propertyDescriptor, propertyModel: propertyModel, onDefaultSyntaxValueChanged: e => this.onDefaultSyntaxValueChanged(e), "editor-height": "5em", "single-line": true }, index.h("div", null, index.h("input", { type: "text", id: fieldId, name: fieldName, value: value, onChange: e => this.onChange(e), class: "disabled:elsa-opacity-50 disabled:elsa-cursor-not-allowed focus:elsa-ring-blue-500 focus:elsa-border-blue-500 elsa-block elsa-w-full elsa-min-w-0 elsa-rounded-md sm:elsa-text-sm elsa-border-gray-300", disabled: isReadOnly }), index.h("p", { class: "elsa-mt-2 elsa-text-sm elsa-text-gray-500" }, this.valueDescription))));
  }
};

exports.elsa_cron_expression_property = ElsaCronExpressionProperty;
