import { h } from "@stencil/core";
import { getOrCreateProperty } from "../utils/utils";
export class SwitchCaseBuilderDriver {
  display(activity, property) {
    const prop = getOrCreateProperty(activity, property.name);
    return h("elsa-switch-cases-property", { activityModel: activity, propertyDescriptor: property, propertyModel: prop });
  }
  update(activity, property, form) {
  }
}
