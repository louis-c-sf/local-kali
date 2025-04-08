import { h } from "@stencil/core";
import { getOrCreateProperty } from "../utils/utils";
export class SingleLineDriver {
  display(activity, property) {
    const prop = getOrCreateProperty(activity, property.name);
    return h("elsa-single-line-property", { activityModel: activity, propertyDescriptor: property, propertyModel: prop });
  }
}
