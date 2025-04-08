'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const index = require('./index-915b0bc2.js');
const domain = require('./domain-b01b4a53.js');
const utils = require('./utils-5d19a660.js');
const selectListItems = require('./select-list-items-1de8a660.js');
const workflowEditor = require('./workflow-editor-a145e6dc.js');
require('./collection-724169f5.js');
require('./_commonjsHelpers-a5111d61.js');
require('./elsa-client-e99f1b35.js');
require('./index-a2f6d9eb.js');
require('./axios-middleware.esm-f337c7ad.js');
require('./event-bus-8066af27.js');
require('./index-1eae61b2.js');
require('./cronstrue-62722667.js');
require('./state-tunnel-786a62ce.js');

let ElsaCheckListProperty = class {
  constructor(hostRef) {
    index.registerInstance(this, hostRef);
    this.selectList = { items: [], isFlagsEnum: false };
  }
  async componentWillLoad() {
    if (this.propertyModel.expressions[domain.SyntaxNames.Json] == undefined)
      this.propertyModel.expressions[domain.SyntaxNames.Json] = JSON.stringify(this.propertyDescriptor.defaultValue);
    this.currentValue = this.propertyModel.expressions[domain.SyntaxNames.Json] || '[]';
  }
  onCheckChanged(e) {
    const checkbox = e.target;
    const checked = checkbox.checked;
    const value = checkbox.value;
    const isFlags = this.selectList.isFlagsEnum;
    if (isFlags) {
      let newValue = parseInt(this.currentValue);
      if (checked)
        newValue = newValue | parseInt(value);
      else
        newValue = newValue & ~parseInt(value);
      this.currentValue = newValue.toString();
    }
    else {
      let newValue = utils.parseJson(this.currentValue);
      if (checked)
        newValue = [...newValue, value].distinct();
      else
        newValue = newValue.filter(x => x !== value);
      this.currentValue = JSON.stringify(newValue);
    }
    this.propertyModel.expressions[domain.SyntaxNames.Json] = this.currentValue.toString();
  }
  onDefaultSyntaxValueChanged(e) {
    this.currentValue = e.detail;
  }
  async componentWillRender() {
    this.selectList = await selectListItems.getSelectListItems(this.serverUrl, this.propertyDescriptor);
  }
  render() {
    const propertyDescriptor = this.propertyDescriptor;
    const propertyModel = this.propertyModel;
    const fieldId = propertyDescriptor.name;
    const selectList = this.selectList;
    const items = selectList.items;
    const selectedValues = selectList.isFlagsEnum ? this.currentValue : utils.parseJson(this.currentValue) || [];
    return (index.h("elsa-property-editor", { activityModel: this.activityModel, propertyDescriptor: propertyDescriptor, propertyModel: propertyModel, onDefaultSyntaxValueChanged: e => this.onDefaultSyntaxValueChanged(e), "single-line": true }, index.h("div", { class: "elsa-max-w-lg elsa-space-y-3 elsa-my-4" }, items.map((item, index$1) => {
      const inputId = `${fieldId}_${index$1}`;
      const optionIsString = typeof (item) == 'string';
      const value = optionIsString ? item : item.value;
      const text = optionIsString ? item : item.text;
      const isSelected = selectList.isFlagsEnum
        ? ((parseInt(this.currentValue)) & (parseInt(value))) == parseInt(value)
        : selectedValues.findIndex(x => x == value) >= 0;
      return (index.h("div", { class: "elsa-relative elsa-flex elsa-items-start" }, index.h("div", { class: "elsa-flex elsa-items-center elsa-h-5" }, index.h("input", { id: inputId, type: "checkbox", checked: isSelected, value: value, onChange: e => this.onCheckChanged(e), class: "focus:elsa-ring-blue-500 elsa-h-4 elsa-w-4 elsa-text-blue-600 elsa-border-gray-300 elsa-rounded" })), index.h("div", { class: "elsa-ml-3 elsa-mt-1 elsa-text-sm" }, index.h("label", { htmlFor: inputId, class: "elsa-font-medium elsa-text-gray-700" }, text))));
    }))));
  }
};
workflowEditor.Tunnel.injectProps(ElsaCheckListProperty, ['serverUrl']);

exports.elsa_check_list_property = ElsaCheckListProperty;
