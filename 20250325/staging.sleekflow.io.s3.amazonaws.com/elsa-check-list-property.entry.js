import { r as registerInstance, h } from './index-28e0f8fb.js';
import { S as SyntaxNames } from './domain-a7b2c384.js';
import { p as parseJson } from './utils-823f97c1.js';
import { g as getSelectListItems } from './select-list-items-bea5ed84.js';
import { T as Tunnel } from './workflow-editor-14d33bb9.js';
import './collection-89937abc.js';
import './_commonjsHelpers-4ed75ef8.js';
import './elsa-client-d55095c1.js';
import './index-b5781c88.js';
import './axios-middleware.esm-b5e3eb44.js';
import './event-bus-be6948e5.js';
import './index-f1836928.js';
import './cronstrue-69b0e3b3.js';
import './state-tunnel-04c0b67a.js';

let ElsaCheckListProperty = class {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.selectList = { items: [], isFlagsEnum: false };
  }
  async componentWillLoad() {
    if (this.propertyModel.expressions[SyntaxNames.Json] == undefined)
      this.propertyModel.expressions[SyntaxNames.Json] = JSON.stringify(this.propertyDescriptor.defaultValue);
    this.currentValue = this.propertyModel.expressions[SyntaxNames.Json] || '[]';
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
      let newValue = parseJson(this.currentValue);
      if (checked)
        newValue = [...newValue, value].distinct();
      else
        newValue = newValue.filter(x => x !== value);
      this.currentValue = JSON.stringify(newValue);
    }
    this.propertyModel.expressions[SyntaxNames.Json] = this.currentValue.toString();
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
    const selectedValues = selectList.isFlagsEnum ? this.currentValue : parseJson(this.currentValue) || [];
    return (h("elsa-property-editor", { activityModel: this.activityModel, propertyDescriptor: propertyDescriptor, propertyModel: propertyModel, onDefaultSyntaxValueChanged: e => this.onDefaultSyntaxValueChanged(e), "single-line": true }, h("div", { class: "elsa-max-w-lg elsa-space-y-3 elsa-my-4" }, items.map((item, index) => {
      const inputId = `${fieldId}_${index}`;
      const optionIsString = typeof (item) == 'string';
      const value = optionIsString ? item : item.value;
      const text = optionIsString ? item : item.text;
      const isSelected = selectList.isFlagsEnum
        ? ((parseInt(this.currentValue)) & (parseInt(value))) == parseInt(value)
        : selectedValues.findIndex(x => x == value) >= 0;
      return (h("div", { class: "elsa-relative elsa-flex elsa-items-start" }, h("div", { class: "elsa-flex elsa-items-center elsa-h-5" }, h("input", { id: inputId, type: "checkbox", checked: isSelected, value: value, onChange: e => this.onCheckChanged(e), class: "focus:elsa-ring-blue-500 elsa-h-4 elsa-w-4 elsa-text-blue-600 elsa-border-gray-300 elsa-rounded" })), h("div", { class: "elsa-ml-3 elsa-mt-1 elsa-text-sm" }, h("label", { htmlFor: inputId, class: "elsa-font-medium elsa-text-gray-700" }, text))));
    }))));
  }
};
Tunnel.injectProps(ElsaCheckListProperty, ['serverUrl']);

export { ElsaCheckListProperty as elsa_check_list_property };
