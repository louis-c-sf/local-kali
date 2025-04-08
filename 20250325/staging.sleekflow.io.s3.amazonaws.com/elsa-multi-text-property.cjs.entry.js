'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const index = require('./index-915b0bc2.js');
const domain = require('./domain-b01b4a53.js');
const utils = require('./utils-5d19a660.js');
const workflowEditor = require('./workflow-editor-a145e6dc.js');
const selectListItems = require('./select-list-items-1de8a660.js');
require('./collection-724169f5.js');
require('./_commonjsHelpers-a5111d61.js');
require('./state-tunnel-786a62ce.js');
require('./elsa-client-e99f1b35.js');
require('./index-a2f6d9eb.js');
require('./axios-middleware.esm-f337c7ad.js');
require('./event-bus-8066af27.js');
require('./index-1eae61b2.js');
require('./cronstrue-62722667.js');

let ElsaMultiTextProperty = class {
  constructor(hostRef) {
    index.registerInstance(this, hostRef);
    this.selectList = { items: [], isFlagsEnum: false };
  }
  async componentWillLoad() {
    this.currentValue = this.propertyModel.expressions[domain.SyntaxNames.Json] || '[]';
  }
  onValueChanged(newValue) {
    const newValues = newValue.map(item => {
      if (typeof item === 'string')
        return item;
      if (typeof item === 'number')
        return item.toString();
      if (typeof item === 'boolean')
        return item.toString();
      return item.value;
    });
    this.currentValue = JSON.stringify(newValues);
    this.propertyModel.expressions[domain.SyntaxNames.Json] = this.currentValue;
  }
  onDefaultSyntaxValueChanged(e) {
    this.currentValue = e.detail;
  }
  createKeyValueOptions(options) {
    if (options === null)
      return options;
    return options.map(option => typeof option === 'string' ? { text: option, value: option } : option);
  }
  async componentWillRender() {
    this.selectList = await selectListItems.getSelectListItems(this.serverUrl, this.propertyDescriptor);
  }
  render() {
    const propertyDescriptor = this.propertyDescriptor;
    const propertyModel = this.propertyModel;
    const propertyName = propertyDescriptor.name;
    const fieldId = propertyName;
    const fieldName = propertyName;
    const values = utils.parseJson(this.currentValue);
    const items = this.selectList.items;
    const useDropdown = !!propertyDescriptor.options && propertyDescriptor.options.length > 0;
    const propertyOptions = this.createKeyValueOptions(items);
    const elsaInputTags = useDropdown ?
      index.h("elsa-input-tags-dropdown", { dropdownValues: propertyOptions, values: values, fieldId: fieldId, fieldName: fieldName, onValueChanged: e => this.onValueChanged(e.detail) }) :
      index.h("elsa-input-tags", { values: values, fieldId: fieldId, fieldName: fieldName, onValueChanged: e => this.onValueChanged(e.detail) });
    return (index.h("elsa-property-editor", { activityModel: this.activityModel, propertyDescriptor: propertyDescriptor, propertyModel: propertyModel, onDefaultSyntaxValueChanged: e => this.onDefaultSyntaxValueChanged(e), "single-line": true }, elsaInputTags));
  }
};
workflowEditor.Tunnel.injectProps(ElsaMultiTextProperty, ['serverUrl']);

exports.elsa_multi_text_property = ElsaMultiTextProperty;
