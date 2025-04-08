import { h } from "@stencil/core";
import { getOrCreateProperty, setActivityModelProperty } from "../utils/utils";
export class CodeEditorDriver {
  display(activity, property) {
    const prop = getOrCreateProperty(activity, property.name);
    const options = property.options || {};
    const editorHeight = this.getEditorHeight(options);
    const syntax = options.syntax;
    return h("elsa-script-property", { activityModel: activity, propertyDescriptor: property, propertyModel: prop, "editor-height": editorHeight, syntax: syntax });
  }
  update(activity, property, form) {
    const value = form.get(property.name);
    setActivityModelProperty(activity, property.name, value, "Literal");
  }
  getEditorHeight(options) {
    const editorHeightName = options.editorHeight || 'Default';
    switch (editorHeightName) {
      case 'Large':
        return '20em';
      case 'Default':
      default:
        return '8em';
    }
  }
}
