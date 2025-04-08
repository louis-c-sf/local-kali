import { h } from "@stencil/core";
import { getOrCreateProperty } from "../utils/utils";
export class DictionaryDriver {
  display(activity, property) {
    const prop = getOrCreateProperty(activity, property.name);
    return h("elsa-dictionary-property", { activityModel: activity, propertyDescriptor: property, propertyModel: prop });
  }
  update(activity, property, form) {
  }
}
