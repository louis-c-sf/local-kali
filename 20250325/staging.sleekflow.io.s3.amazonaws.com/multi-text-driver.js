import { h } from "@stencil/core";
import { getOrCreateProperty } from "../utils/utils";
export class MultiTextDriver {
  display(activity, property) {
    const prop = getOrCreateProperty(activity, property.name);
    return h("elsa-multi-text-property", { activityModel: activity, propertyDescriptor: property, propertyModel: prop });
  }
  update(activity, property, form) {
  }
}
