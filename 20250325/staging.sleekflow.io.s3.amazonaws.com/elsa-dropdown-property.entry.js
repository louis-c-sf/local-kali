import { r as registerInstance, h } from './index-28e0f8fb.js';
import { S as SyntaxNames } from './domain-a7b2c384.js';
import { T as Tunnel } from './workflow-editor-14d33bb9.js';
import { g as getSelectListItems } from './select-list-items-bea5ed84.js';
import './state-tunnel-04c0b67a.js';
import './elsa-client-d55095c1.js';
import './index-b5781c88.js';
import './axios-middleware.esm-b5e3eb44.js';
import './collection-89937abc.js';
import './_commonjsHelpers-4ed75ef8.js';
import './event-bus-be6948e5.js';
import './utils-823f97c1.js';
import './index-f1836928.js';
import './cronstrue-69b0e3b3.js';

let ElsaDropdownProperty = class {
  constructor(hostRef) {
    registerInstance(this, hostRef);
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
    return (h("elsa-property-editor", { activityModel: this.activityModel, propertyDescriptor: propertyDescriptor, propertyModel: propertyModel, onDefaultSyntaxValueChanged: e => this.onDefaultSyntaxValueChanged(e), "single-line": true }, h("select", { id: fieldId, name: fieldName, onChange: e => this.onChange(e), class: "elsa-mt-1 elsa-block focus:elsa-ring-blue-500 focus:elsa-border-blue-500 elsa-w-full elsa-shadow-sm sm:elsa-max-w-xs sm:elsa-text-sm elsa-border-gray-300 elsa-rounded-md" }, items.map(item => {
      const optionIsObject = typeof (item) == 'object';
      const value = optionIsObject ? item.value : item.toString();
      const text = optionIsObject ? item.text : item.toString();
      return h("option", { value: value, selected: value === currentValue }, text);
    }))));
  }
};
Tunnel.injectProps(ElsaDropdownProperty, ['serverUrl']);

export { ElsaDropdownProperty as elsa_dropdown_property };
