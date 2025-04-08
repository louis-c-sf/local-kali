import { eventBus } from '../services/event-bus';
import { EventTypes } from "../models";
import { parseJson } from "../utils/utils";
export class SwitchPlugin {
  constructor() {
    eventBus.on(EventTypes.ActivityDesignDisplaying, this.onActivityDesignDisplaying);
  }
  onActivityDesignDisplaying(context) {
    const activityModel = context.activityModel;
    const activityDescriptor = context.activityDescriptor;
    const propertyDescriptors = activityDescriptor.inputProperties;
    const switchCaseProperties = propertyDescriptors.filter(x => x.uiHint == 'switch-case-builder');
    if (switchCaseProperties.length == 0)
      return;
    let outcomesHash = {};
    const syntax = 'Switch';
    for (const propertyDescriptor of switchCaseProperties) {
      const props = activityModel.properties || [];
      const casesProp = props.find(x => x.name == propertyDescriptor.name) || { expressions: { 'Switch': '' }, syntax: syntax };
      const expression = casesProp.expressions[syntax] || [];
      const cases = !!expression['$values'] ? expression['$values'] : Array.isArray(expression) ? expression : parseJson(expression) || [];
      for (const c of cases)
        outcomesHash[c.name] = true;
    }
    const outcomes = Object.keys(outcomesHash);
    context.outcomes = [...outcomes, 'Default', 'Done'];
  }
}
