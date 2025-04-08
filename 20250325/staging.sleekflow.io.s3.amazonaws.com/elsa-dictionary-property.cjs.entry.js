'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const index = require('./index-915b0bc2.js');
const domain = require('./domain-b01b4a53.js');
const workflowEditor = require('./workflow-editor-a145e6dc.js');
const iconProvider = require('./icon-provider-528179db.js');
require('./state-tunnel-786a62ce.js');

let ElsaDictionaryProperty = class {
  constructor(hostRef) {
    index.registerInstance(this, hostRef);
    this.jsonToDictionary = (json) => {
      if (!json)
        return [['', '']];
      const parsedValue = JSON.parse(json);
      return Object.keys(parsedValue).map(key => [key, parsedValue[key]]);
    };
    this.dictionaryToJson = (dictionary) => {
      const filteredDictionary = this.removeInvalidKeys(dictionary);
      if (filteredDictionary.length === 0)
        return null;
      return JSON.stringify(Object.fromEntries(filteredDictionary));
    };
    this.removeInvalidKeys = (dictionary) => {
      const filteredDictionary = [];
      dictionary.forEach(x => {
        const key = x[0].trim();
        if (key !== '' && !filteredDictionary.some(y => y[0].trim() === key))
          filteredDictionary.push(x);
      });
      return filteredDictionary;
    };
    this.onRowAdded = () => {
      //changing contents of array won't trigger state change,
      //need to update the reference by creating new array
      this.currentValue = [...this.currentValue, ['', '']];
    };
    this.onRowDeleted = (index) => {
      const newValue = this.currentValue.filter((x, i) => i !== index);
      if (newValue.length === 0)
        newValue.push(['', '']);
      this.currentValue = newValue;
      this.propertyModel.expressions[domain.SyntaxNames.Json] = this.dictionaryToJson(newValue);
    };
  }
  async componentWillLoad() {
    this.currentValue = this.jsonToDictionary(this.propertyModel.expressions[domain.SyntaxNames.Json] || null);
    if (this.currentValue.length === 0)
      this.currentValue = [['', '']];
  }
  onDefaultSyntaxValueChanged(e) {
    this.currentValue = this.jsonToDictionary(e.detail);
  }
  onKeyChanged(e, index) {
    const input = e.currentTarget;
    this.currentValue[index][0] = input.value;
    this.propertyModel.expressions[domain.SyntaxNames.Json] = this.dictionaryToJson(this.currentValue);
  }
  onValueChanged(e, index) {
    const input = e.currentTarget;
    this.currentValue[index][1] = input.value;
    this.propertyModel.expressions[domain.SyntaxNames.Json] = this.dictionaryToJson(this.currentValue);
  }
  render() {
    const propertyDescriptor = this.propertyDescriptor;
    const propertyModel = this.propertyModel;
    const fieldId = propertyDescriptor.name;
    const items = this.currentValue;
    return (index.h("elsa-property-editor", { propertyDescriptor: propertyDescriptor, propertyModel: propertyModel, activityModel: this.activityModel, onDefaultSyntaxValueChanged: e => this.onDefaultSyntaxValueChanged(e), "single-line": true }, items.map((item, index$1) => {
      const keyInputId = `${fieldId}_${index$1}_key}`;
      const valueInputId = `${fieldId}_${index$1}_value}`;
      const [key, value] = item;
      const isLast = index$1 === (items.length - 1);
      return (index.h("div", { class: "elsa-flex elsa-flex-row elsa-justify-between elsa-mb-2" }, index.h("input", { id: keyInputId, type: "text", value: key, onChange: (e) => this.onKeyChanged(e, index$1), placeholder: "Name", class: "disabled:elsa-opacity-50 disabled:elsa-cursor-not-allowed focus:elsa-ring-blue-500 focus:elsa-border-blue-500 elsa-border-gray-300 sm:elsa-text-sm elsa-rounded-md elsa-w-5/12" }), index.h("input", { id: valueInputId, type: "text", value: value, onChange: (e) => this.onValueChanged(e, index$1), placeholder: "Value", class: "disabled:elsa-opacity-50 disabled:elsa-cursor-not-allowed focus:elsa-ring-blue-500 focus:elsa-border-blue-500 elsa-border-gray-300 sm:elsa-text-sm elsa-rounded-md elsa-w-5/12" }), index.h("div", { class: "elsa-flex elsa-flex-row elsa-justify-between elsa-w-24" }, index.h("button", { type: "button", onClick: () => this.onRowDeleted(index$1) }, iconProvider.iconProvider.getIcon(iconProvider.IconName.TrashBinOutline, { color: iconProvider.IconColor.Gray, hoverColor: iconProvider.IconColor.Red })), isLast && index.h("button", { type: "button", onClick: this.onRowAdded }, iconProvider.iconProvider.getIcon(iconProvider.IconName.Plus, { color: iconProvider.IconColor.Gray, hoverColor: iconProvider.IconColor.Green })))));
    })));
  }
};
workflowEditor.Tunnel.injectProps(ElsaDictionaryProperty, ['serverUrl']);

exports.elsa_dictionary_property = ElsaDictionaryProperty;
