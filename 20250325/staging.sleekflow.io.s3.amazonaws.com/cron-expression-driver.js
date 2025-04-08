import { h } from "@stencil/core";
import { getOrCreateProperty } from "../utils/utils";
export class CronExpressionDriver {
  display(activity, property) {
    const prop = getOrCreateProperty(activity, property.name);
    return h("elsa-cron-expression-property", { activityModel: activity, propertyDescriptor: property, propertyModel: prop });
  }
  update(activity, property, form) {
  }
}
