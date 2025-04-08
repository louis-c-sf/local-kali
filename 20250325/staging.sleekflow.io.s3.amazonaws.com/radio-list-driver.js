import { h } from "@stencil/core";
import { getOrCreateProperty } from "../utils/utils";
export class RadioListDriver {
  display(activity, property) {
    const prop = getOrCreateProperty(activity, property.name);
    return h("elsa-radio-list-property", { activityModel: activity, propertyDescriptor: property, propertyModel: prop });
  }
  update(activity, property, form) {
  }
}
