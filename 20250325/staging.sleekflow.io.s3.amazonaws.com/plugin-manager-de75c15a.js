import { e as eventBus } from './event-bus-be6948e5.js';
import { S as SyntaxNames } from './domain-a7b2c384.js';
import { E as EventTypes } from './axios-middleware.esm-b5e3eb44.js';
import './collection-89937abc.js';
import { h as htmlEncode, g as getOrCreateProperty, s as setActivityModelProperty, p as parseJson } from './utils-823f97c1.js';
import { d as dist, A as Ajv } from './index-f1836928.js';
import { c as cronstrue } from './cronstrue-69b0e3b3.js';
import { h } from './index-28e0f8fb.js';
import { p as propertyDisplayManager } from './property-display-manager-9605c1ff.js';
import { a as activityIconProvider } from './activity-icon-provider-c5a581b1.js';

class IfPlugin {
  constructor() {
    eventBus.on(EventTypes.ActivityDesignDisplaying, this.onActivityDesignDisplaying);
  }
  onActivityDesignDisplaying(context) {
    const activityModel = context.activityModel;
    if (activityModel.type !== 'If')
      return;
    const props = activityModel.properties || [];
    const condition = props.find(x => x.name == 'Condition') || { name: 'Condition', expressions: { 'Literal': '' }, syntax: 'Literal' };
    const expression = condition.expressions[condition.syntax] || '';
    const description = activityModel.description;
    const bodyText = htmlEncode(description && description.length > 0 ? description : expression);
    context.bodyDisplay = `<p>${bodyText}</p>`;
  }
}

class HttpEndpointPlugin {
  constructor() {
    eventBus.on(EventTypes.ActivityDesignDisplaying, this.onActivityDisplaying);
    eventBus.on(EventTypes.ActivityPluginUpdated, this.onActivityUpdated);
    eventBus.on(EventTypes.ActivityPluginValidating, this.onActivityValidating);
    eventBus.on(EventTypes.ComponentLoadingCustomButton, this.onComponentLoadingCustomButton);
    eventBus.on(EventTypes.ComponentCustomButtonClick, this.onComponentCustomButtonClick);
  }
  onActivityDisplaying(context) {
    const activityModel = context.activityModel;
    if (activityModel.type !== 'HttpEndpoint')
      return;
    const props = activityModel.properties || [];
    const path = props.find(x => x.name == 'Path') || { name: 'Path', expressions: { 'Literal': '', syntax: SyntaxNames.Literal } };
    const syntax = path.syntax || SyntaxNames.Literal;
    const bodyDisplay = htmlEncode(path.expressions[syntax]);
    context.bodyDisplay = `<p>${bodyDisplay}</p>`;
  }
  onComponentLoadingCustomButton(context) {
    if (context.activityType !== 'HttpEndpoint')
      return;
    if (context.component === 'elsa-script-property') {
      if (context.prop !== 'Schema')
        return;
      const label = 'Convert to Json Schema';
      context.data = { label };
    }
    if (context.component === 'elsa-workflow-definition-editor-screen') {
      const label = 'Use as Schema';
      context.data = { label };
    }
  }
  onComponentCustomButtonClick(context) {
    var _a;
    if (context.activityType !== 'HttpEndpoint')
      return;
    if (context.component === 'elsa-script-property') {
      if (context.prop !== 'Schema')
        return;
      window.open('https://www.convertsimple.com/convert-json-to-json-schema/');
    }
    if (context.component === 'elsa-workflow-definition-editor-screen') {
      const activityUpdatedContext = {
        activityModel: context.params[0],
        data: JSON.stringify(dist.convert((_a = context.params[1]) === null || _a === void 0 ? void 0 : _a.Body), null, 1)
      };
      eventBus.emit(EventTypes.ActivityPluginUpdated, this, activityUpdatedContext);
    }
  }
  onActivityUpdated(context) {
    const activityModel = context.activityModel;
    if (activityModel.type !== 'HttpEndpoint')
      return;
    const props = activityModel.properties || [];
    const prop = props.find(x => x.name == 'Schema') || { name: 'Schema', expressions: { 'Literal': '', syntax: SyntaxNames.Literal } };
    prop.expressions[SyntaxNames.Literal] = context.data;
    eventBus.emit(EventTypes.UpdateActivity, this, prop);
  }
  onActivityValidating(context) {
    if (context.activityType !== 'HttpEndpoint' || context.prop !== 'Schema')
      return;
    const jsonSchema = context.value;
    let isValid = true;
    if (jsonSchema == '')
      return;
    const ajv = new Ajv();
    let json;
    try {
      json = JSON.parse(jsonSchema);
    }
    catch (e) {
      isValid = false;
    }
    if (json != undefined) {
      try {
        const validate = ajv.compile(json);
        const errors = validate.errors;
        if (errors != null)
          isValid = false;
      }
      catch (e) {
        isValid = false;
      }
    }
    context.isValidated = true;
    context.isValid = isValid;
    context.data = isValid ? 'Json is valid' : 'Json is invalid';
  }
}

class TimerPlugin {
  constructor() {
    eventBus.on(EventTypes.ActivityDesignDisplaying, this.onActivityDesignDisplaying);
  }
  onActivityDesignDisplaying(context) {
    const activityModel = context.activityModel;
    if (activityModel.type !== 'Timer')
      return;
    const props = activityModel.properties || [];
    const condition = props.find(x => x.name == 'Timeout') || { name: 'Timeout', expressions: { 'Literal': '' }, syntax: 'Literal' };
    const expression = htmlEncode(condition.expressions[condition.syntax] || '');
    context.bodyDisplay = `<p>${expression}</p>`;
  }
}

class WriteLinePlugin {
  constructor() {
    eventBus.on(EventTypes.ActivityDesignDisplaying, this.onActivityDesignDisplaying);
  }
  onActivityDesignDisplaying(context) {
    const activityModel = context.activityModel;
    if (activityModel.type !== 'WriteLine')
      return;
    const props = activityModel.properties || [];
    const condition = props.find(x => x.name == 'Text') || { name: 'Text', expressions: { 'Literal': '' }, syntax: SyntaxNames.Literal };
    const expression = condition.expressions[condition.syntax || 'Literal'] || '';
    context.bodyDisplay = `<p>${htmlEncode(expression)}</p>`;
  }
}

class SendEmailPlugin {
  constructor() {
    eventBus.on(EventTypes.ActivityDesignDisplaying, this.onActivityDesignDisplaying);
  }
  onActivityDesignDisplaying(context) {
    const activityModel = context.activityModel;
    if (activityModel.type !== 'SendEmail')
      return;
    const props = activityModel.properties || [];
    const to = props.find(x => x.name == 'To') || { expressions: { 'Json': '' }, syntax: SyntaxNames.Json };
    const expression = to.expressions[to.syntax || SyntaxNames.Json] || '';
    const description = activityModel.description;
    const bodyText = htmlEncode(description && description.length > 0 ? description : expression);
    context.bodyDisplay = `<p>To: ${bodyText}</p>`;
  }
}

class CheckListDriver {
  display(activity, property) {
    const prop = getOrCreateProperty(activity, property.name);
    return h("elsa-check-list-property", { activityModel: activity, propertyDescriptor: property, propertyModel: prop });
  }
  update(activity, property, form) {
  }
}

class CheckboxDriver {
  display(activity, property) {
    const prop = getOrCreateProperty(activity, property.name);
    return h("elsa-checkbox-property", { activityModel: activity, propertyDescriptor: property, propertyModel: prop });
  }
  update(activity, property, form) {
  }
}

class CodeEditorDriver {
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

class DropdownDriver {
  display(activity, property) {
    const prop = getOrCreateProperty(activity, property.name);
    return h("elsa-dropdown-property", { activityModel: activity, propertyDescriptor: property, propertyModel: prop });
  }
  update(activity, property, form) {
  }
}

class JsonDriver {
  display(activity, property) {
    const prop = getOrCreateProperty(activity, property.name);
    return h("elsa-json-property", { activityModel: activity, propertyDescriptor: property, propertyModel: prop });
  }
  update(activity, property, form) {
  }
}

class MultiTextDriver {
  display(activity, property) {
    const prop = getOrCreateProperty(activity, property.name);
    return h("elsa-multi-text-property", { activityModel: activity, propertyDescriptor: property, propertyModel: prop });
  }
  update(activity, property, form) {
  }
}

class MultilineDriver {
  display(activity, property) {
    const prop = getOrCreateProperty(activity, property.name);
    return h("elsa-multi-line-property", { activityModel: activity, propertyDescriptor: property, propertyModel: prop });
  }
  update(activity, property, form) {
  }
}

class RadioListDriver {
  display(activity, property) {
    const prop = getOrCreateProperty(activity, property.name);
    return h("elsa-radio-list-property", { activityModel: activity, propertyDescriptor: property, propertyModel: prop });
  }
  update(activity, property, form) {
  }
}

class SingleLineDriver {
  display(activity, property) {
    const prop = getOrCreateProperty(activity, property.name);
    return h("elsa-single-line-property", { activityModel: activity, propertyDescriptor: property, propertyModel: prop });
  }
}

class SwitchCaseBuilderDriver {
  display(activity, property) {
    const prop = getOrCreateProperty(activity, property.name);
    return h("elsa-switch-cases-property", { activityModel: activity, propertyDescriptor: property, propertyModel: prop });
  }
  update(activity, property, form) {
  }
}

class DictionaryDriver {
  display(activity, property) {
    const prop = getOrCreateProperty(activity, property.name);
    return h("elsa-dictionary-property", { activityModel: activity, propertyDescriptor: property, propertyModel: prop });
  }
  update(activity, property, form) {
  }
}

class CronExpressionDriver {
  display(activity, property) {
    const prop = getOrCreateProperty(activity, property.name);
    return h("elsa-cron-expression-property", { activityModel: activity, propertyDescriptor: property, propertyModel: prop });
  }
  update(activity, property, form) {
  }
}

class DefaultDriversPlugin {
  constructor() {
    this.addDriver('single-line', () => new SingleLineDriver());
    this.addDriver('multi-line', () => new MultilineDriver());
    this.addDriver('json', () => new JsonDriver());
    this.addDriver('check-list', () => new CheckListDriver());
    this.addDriver('radio-list', () => new RadioListDriver());
    this.addDriver('checkbox', () => new CheckboxDriver());
    this.addDriver('dropdown', () => new DropdownDriver());
    this.addDriver('multi-text', () => new MultiTextDriver());
    this.addDriver('code-editor', () => new CodeEditorDriver());
    this.addDriver('switch-case-builder', () => new SwitchCaseBuilderDriver());
    this.addDriver('dictionary', () => new DictionaryDriver());
    this.addDriver('cron-expression', () => new CronExpressionDriver());
  }
  addDriver(controlType, c) {
    propertyDisplayManager.addDriver(controlType, c);
  }
}

class ActivityIconProviderPlugin {
  constructor() {
    eventBus.on(EventTypes.ActivityDescriptorDisplaying, this.onActivityDescriptorDisplaying);
    eventBus.on(EventTypes.ActivityDesignDisplaying, this.onActivityDesignDisplaying);
  }
  onActivityDescriptorDisplaying(context) {
    const descriptor = context.activityDescriptor;
    const iconEntry = activityIconProvider.getIcon(descriptor.type);
    if (iconEntry)
      context.activityIcon = iconEntry;
  }
  onActivityDesignDisplaying(context) {
    const activityModel = context.activityModel;
    const iconEntry = activityIconProvider.getIcon(activityModel.type);
    if (iconEntry)
      context.activityIcon = iconEntry;
  }
}

class SwitchPlugin {
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

class WhilePlugin {
  constructor() {
    eventBus.on(EventTypes.ActivityDesignDisplaying, this.onActivityDesignDisplaying);
  }
  onActivityDesignDisplaying(context) {
    const activityModel = context.activityModel;
    if (activityModel.type !== 'While')
      return;
    const props = activityModel.properties || [];
    const condition = props.find(x => x.name == 'Condition') || { name: 'Condition', expressions: { 'Literal': '' }, syntax: 'Literal' };
    const expression = condition.expressions[condition.syntax] || '';
    const description = activityModel.description;
    const bodyText = htmlEncode(description && description.length > 0 ? description : expression);
    context.bodyDisplay = `<p>${bodyText}</p>`;
  }
}

class StartAtPlugin {
  constructor() {
    eventBus.on(EventTypes.ActivityDesignDisplaying, this.onActivityDesignDisplaying);
  }
  onActivityDesignDisplaying(context) {
    const activityModel = context.activityModel;
    if (activityModel.type !== 'StartAt')
      return;
    const props = activityModel.properties || [];
    const condition = props.find(x => x.name == 'Instant') || { name: 'Instant', expressions: { 'Literal': '' }, syntax: 'Literal' };
    const expression = htmlEncode(condition.expressions[condition.syntax] || '');
    context.bodyDisplay = `<p>${expression}</p>`;
  }
}

class CronPlugin {
  constructor() {
    eventBus.on(EventTypes.ActivityDesignDisplaying, this.onActivityDesignDisplaying);
  }
  onActivityDesignDisplaying(context) {
    const activityModel = context.activityModel;
    if (activityModel.type !== 'Cron')
      return;
    const props = activityModel.properties || [];
    const condition = props.find(x => x.name == 'CronExpression') || { name: 'CronExpression', expressions: { 'Literal': '' }, syntax: SyntaxNames.Literal };
    const expression = htmlEncode(condition.expressions[condition.syntax || 'Literal'] || '');
    const cronDescription = cronstrue.toString(expression, { throwExceptionOnParseError: false });
    context.bodyDisplay = `<p style="overflow: hidden;text-overflow: ellipsis;" title="${cronDescription}">${cronDescription}</p>`;
  }
}

class SignalReceivedPlugin {
  constructor() {
    eventBus.on(EventTypes.ActivityDesignDisplaying, this.onActivityDisplaying);
  }
  onActivityDisplaying(context) {
    const activityModel = context.activityModel;
    if (activityModel.type !== 'SignalReceived')
      return;
    const props = activityModel.properties || [];
    const signalName = props.find(x => x.name == 'Signal') || { name: 'Signal', expressions: { 'Literal': '', syntax: SyntaxNames.Literal } };
    const syntax = signalName.syntax || SyntaxNames.Literal;
    const bodyDisplay = htmlEncode(signalName.expressions[syntax]);
    context.bodyDisplay = `<p>${bodyDisplay}</p>`;
  }
}

class SendSignalPlugin {
  constructor() {
    eventBus.on(EventTypes.ActivityDesignDisplaying, this.onActivityDisplaying);
  }
  onActivityDisplaying(context) {
    const activityModel = context.activityModel;
    if (activityModel.type !== 'SendSignal')
      return;
    const props = activityModel.properties || [];
    const signalName = props.find(x => x.name == 'Signal') || { name: 'Signal', expressions: { 'Literal': '', syntax: SyntaxNames.Literal } };
    const syntax = signalName.syntax || SyntaxNames.Literal;
    const bodyDisplay = htmlEncode(signalName.expressions[syntax]);
    context.bodyDisplay = `<p>${bodyDisplay}</p>`;
  }
}

class StatePlugin {
  constructor() {
    eventBus.on(EventTypes.ActivityDesignDisplaying, this.onActivityDesignDisplaying);
  }
  onActivityDesignDisplaying(context) {
    const activityModel = context.activityModel;
    if (activityModel.type !== 'State')
      return;
    const props = activityModel.properties || [];
    const stateNameProp = props.find(x => x.name == 'StateName') || { name: 'Text', expressions: { 'Literal': '' }, syntax: SyntaxNames.Literal };
    context.displayName = htmlEncode(stateNameProp.expressions[stateNameProp.syntax || 'Literal'] || 'State');
  }
}

class SendHttpRequestPlugin {
  constructor() {
    this.onActivityEditorAppearing = (args) => {
      if (args.activityDescriptor.type != 'SendHttpRequest')
        return;
      document.querySelector('#ReadContent').addEventListener('change', this.updateUI);
      document.querySelector('#ResponseContentParserName').addEventListener('change', this.updateUI);
      this.updateUI();
    };
    this.onActivityEditorDisappearing = (args) => {
      if (args.activityDescriptor.type != 'SendHttpRequest')
        return;
      document.querySelector('#ReadContent').removeEventListener('change', this.updateUI);
      document.querySelector('#ResponseContentParserName').removeEventListener('change', this.updateUI);
    };
    this.updateUI = () => {
      const readContentCheckbox = document.querySelector('#ReadContent');
      const parserList = document.querySelector('#ResponseContentParserName');
      const responseContentParserListControl = document.querySelector('#ResponseContentParserNameControl');
      const responseContentTargetTypeControl = document.querySelector('#ResponseContentTargetTypeControl');
      const selectedParserName = parserList.value;
      responseContentParserListControl.classList.toggle('hidden', !readContentCheckbox.checked);
      responseContentTargetTypeControl.classList.toggle('hidden', (!readContentCheckbox.checked || selectedParserName != '.NET Type'));
    };
    eventBus.on(EventTypes.ActivityEditor.Appearing, this.onActivityEditorAppearing);
    eventBus.on(EventTypes.ActivityEditor.Disappearing, this.onActivityEditorDisappearing);
  }
}

class DynamicOutcomesPlugin {
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

class PluginManager {
  constructor() {
    this.plugins = [];
    this.pluginTypes = [];
    this.createPlugin = (pluginType) => {
      return new pluginType(this.elsaStudio);
    };
    this.pluginTypes = [
      DefaultDriversPlugin,
      ActivityIconProviderPlugin,
      IfPlugin,
      WhilePlugin,
      SwitchPlugin,
      HttpEndpointPlugin,
      SendHttpRequestPlugin,
      TimerPlugin,
      StartAtPlugin,
      CronPlugin,
      SignalReceivedPlugin,
      SendSignalPlugin,
      WriteLinePlugin,
      StatePlugin,
      SendEmailPlugin,
      DynamicOutcomesPlugin
    ];
  }
  initialize(elsaStudio) {
    if (this.initialized)
      return;
    this.elsaStudio = elsaStudio;
    for (const pluginType of this.pluginTypes) {
      this.createPlugin(pluginType);
    }
    this.initialized = true;
  }
  registerPlugins(pluginTypes) {
    for (const pluginType of pluginTypes) {
      this.registerPlugin(pluginType);
    }
  }
  registerPlugin(pluginType) {
    this.pluginTypes.push(pluginType);
    if (this.initialized)
      this.createPlugin(pluginType);
  }
}
const pluginManager = new PluginManager();

export { PluginManager as P, pluginManager as p };
