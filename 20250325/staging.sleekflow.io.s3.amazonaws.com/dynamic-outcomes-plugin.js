import { eventBus } from "../services";
import { EventTypes, SyntaxNames } from "../models";
import { parseJson } from "../utils/utils";
export class DynamicOutcomesPlugin {
  constructor() {
    this.onActivityDesignDisplaying = (context) => {
      const propValuesAsOutcomes = context.activityDescriptor.inputProperties.filter(prop => prop.considerValuesAsOutcomes);
      if (propValuesAsOutcomes.length > 0) {
        const props = context.activityModel.properties || [];
        const syntax = SyntaxNames.Json;
        let dynamicOutcomes = [];
        props
          .filter(prop => propValuesAsOutcomes.find(desc => desc.name == prop.name) != undefined)
          .forEach(prop => {
          const expression = prop.expressions[syntax] || [];
          const dynamicPropertyOutcomes = !!expression['$values'] ? expression['$values'] : Array.isArray(expression) ? expression : parseJson(expression) || [];
          dynamicOutcomes = [...dynamicOutcomes, ...dynamicPropertyOutcomes];
        });
        context.outcomes = [...dynamicOutcomes, ...context.outcomes];
      }
    };
    eventBus.on(EventTypes.ActivityDesignDisplaying, this.onActivityDesignDisplaying);
  }
}
