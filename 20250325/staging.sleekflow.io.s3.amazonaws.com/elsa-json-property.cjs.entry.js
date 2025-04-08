'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const index = require('./index-915b0bc2.js');
const domain = require('./domain-b01b4a53.js');

let ElsaJsonProperty = class {
  constructor(hostRef) {
    index.registerInstance(this, hostRef);
  }
  componentWillLoad() {
    const defaultSyntax = this.propertyDescriptor.defaultSyntax || domain.SyntaxNames.Json;
    this.currentValue = this.propertyModel.expressions[defaultSyntax] || undefined;
  }
  getEditorHeight(options) {
    const editorHeightName = options.editorHeight || 'Large';
    switch (editorHeightName) {
      case 'Large':
        return '20em';
      case 'Default':
      default:
        return '15em';
    }
  }
  onMonacoValueChanged(e) {
    this.propertyModel.expressions[domain.SyntaxNames.Json] = this.currentValue = e.value;
  }
  onDefaultSyntaxValueChanged(e) {
    this.currentValue = e.detail;
  }
  render() {
    const propertyDescriptor = this.propertyDescriptor;
    const propertyModel = this.propertyModel;
    const options = propertyDescriptor.options || {};
    const editorHeight = this.getEditorHeight(options);
    const context = options.context;
    let value = this.currentValue;
    if (value == undefined) {
      const defaultValue = this.propertyDescriptor.defaultValue;
      value = defaultValue ? defaultValue.toString() : undefined;
    }
    return (index.h("elsa-property-editor", { activityModel: this.activityModel, propertyDescriptor: propertyDescriptor, propertyModel: propertyModel, onDefaultSyntaxValueChanged: e => this.onDefaultSyntaxValueChanged(e), "editor-height": editorHeight, context: context }, index.h("elsa-monaco", { value: value, language: "json", "editor-height": editorHeight, onValueChanged: e => this.onMonacoValueChanged(e.detail) })));
  }
};

exports.elsa_json_property = ElsaJsonProperty;
