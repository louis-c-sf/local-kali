'use strict';

const eventBus = require('./event-bus-8066af27.js');
const domain = require('./domain-b01b4a53.js');
const axiosMiddleware_esm = require('./axios-middleware.esm-f337c7ad.js');
require('./collection-724169f5.js');
const utils = require('./utils-5d19a660.js');
const index = require('./index-1eae61b2.js');
const cronstrue = require('./cronstrue-62722667.js');
const index$1 = require('./index-915b0bc2.js');
const propertyDisplayManager = require('./property-display-manager-84377064.js');
const activityIconProvider = require('./activity-icon-provider-d8c65e4d.js');

class IfPlugin {
  constructor() {
    eventBus.eventBus.on(axiosMiddleware_esm.EventTypes.ActivityDesignDisplaying, this.onActivityDesignDisplaying);
  }
  onActivityDesignDisplaying(context) {
    const activityModel = context.activityModel;
    if (activityModel.type !== 'If')
      return;
    const props = activityModel.properties || [];
    const condition = props.find(x => x.name == 'Condition') || { name: 'Condition', expressions: { 'Literal': '' }, syntax: 'Literal' };
    const expression = condition.expressions[condition.syntax] || '';
    const description = activityModel.description;
    const bodyText = utils.htmlEncode(description && description.length > 0 ? description : expression);
    context.bodyDisplay = `<p>${bodyText}</p>`;
  }
}

class HttpEndpointPlugin {
  constructor() {
    eventBus.eventBus.on(axiosMiddleware_esm.EventTypes.ActivityDesignDisplaying, this.onActivityDisplaying);
    eventBus.eventBus.on(axiosMiddleware_esm.EventTypes.ActivityPluginUpdated, this.onActivityUpdated);
    eventBus.eventBus.on(axiosMiddleware_esm.EventTypes.ActivityPluginValidating, this.onActivityValidating);
    eventBus.eventBus.on(axiosMiddleware_esm.EventTypes.ComponentLoadingCustomButton, this.onComponentLoadingCustomButton);
    eventBus.eventBus.on(axiosMiddleware_esm.EventTypes.ComponentCustomButtonClick, this.onComponentCustomButtonClick);
  }
  onActivityDisplaying(context) {
    const activityModel = context.activityModel;
    if (activityModel.type !== 'HttpEndpoint')
      return;
    const props = activityModel.properties || [];
    const path = props.find(x => x.name == 'Path') || { name: 'Path', expressions: { 'Literal': '', syntax: domain.SyntaxNames.Literal } };
    const syntax = path.syntax || domain.SyntaxNames.Literal;
    const bodyDisplay = utils.htmlEncode(path.expressions[syntax]);
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
        data: JSON.stringify(index.dist.convert((_a = context.params[1]) === null || _a === void 0 ? void 0 : _a.Body), null, 1)
      };
      eventBus.eventBus.emit(axiosMiddleware_esm.EventTypes.ActivityPluginUpdated, this, activityUpdatedContext);
    }
  }
  onActivityUpdated(context) {
    const activityModel = context.activityModel;
    if (activityModel.type !== 'HttpEndpoint')
      return;
    const props = activityModel.properties || [];
    const prop = props.find(x => x.name == 'Schema') || { name: 'Schema', expressions: { 'Literal': '', syntax: domain.SyntaxNames.Literal } };
    prop.expressions[domain.SyntaxNames.Literal] = context.data;
    eventBus.eventBus.emit(axiosMiddleware_esm.EventTypes.UpdateActivity, this, prop);
  }
  onActivityValidating(context) {
    if (context.activityType !== 'HttpEndpoint' || context.prop !== 'Schema')
      return;
    const jsonSchema = context.value;
    let isValid = true;
    if (jsonSchema == '')
      return;
    const ajv = new index.Ajv();
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
    eventBus.eventBus.on(axiosMiddleware_esm.EventTypes.ActivityDesignDisplaying, this.onActivityDesignDisplaying);
  }
  onActivityDesignDisplaying(context) {
    const activityModel = context.activityModel;
    if (activityModel.type !== 'Timer')
      return;
    const props = activityModel.properties || [];
    const condition = props.find(x => x.name == 'Timeout') || { name: 'Timeout', expressions: { 'Literal': '' }, syntax: 'Literal' };
    const expression = utils.htmlEncode(condition.expressions[condition.syntax] || '');
    context.bodyDisplay = `<p>${expression}</p>`;
  }
}

class WriteLinePlugin {
  constructor() {
    eventBus.eventBus.on(axiosMiddleware_esm.EventTypes.ActivityDesignDisplaying, this.onActivityDesignDisplaying);
  }
  onActivityDesignDisplaying(context) {
    const activityModel = context.activityModel;
    if (activityModel.type !== 'WriteLine')
      return;
    const props = activityModel.properties || [];
    const condition = props.find(x => x.name == 'Text') || { name: 'Text', expressions: { 'Literal': '' }, syntax: domain.SyntaxNames.Literal };
    const expression = condition.expressions[condition.syntax || 'Literal'] || '';
    context.bodyDisplay = `<p>${utils.htmlEncode(expression)}</p>`;
  }
}

class SendEmailPlugin {
  constructor() {
    eventBus.eventBus.on(axiosMiddleware_esm.EventTypes.ActivityDesignDisplaying, this.onActivityDesignDisplaying);
  }
  onActivityDesignDisplaying(context) {
    const activityModel = context.activityModel;
    if (activityModel.type !== 'SendEmail')
      return;
    const props = activityModel.properties || [];
    const to = props.find(x => x.name == 'To') || { expressions: { 'Json': '' }, syntax: domain.SyntaxNames.Json };
    const expression = to.expressions[to.syntax || domain.SyntaxNames.Json] || '';
    const description = activityModel.description;
    const bodyText = utils.htmlEncode(description && description.length > 0 ? description : expression);
    context.bodyDisplay = `<p>To: ${bodyText}</p>`;
  }
}

class CheckListDriver {
  display(activity, property) {
    const prop = utils.getOrCreateProperty(activity, property.name);
    return index$1.h("elsa-check-list-property", { activityModel: activity, propertyDescriptor: property, propertyModel: prop });
  }
  update(activity, property, form) {
  }
}

class CheckboxDriver {
  display(activity, property) {
    const prop = utils.getOrCreateProperty(activity, property.name);
    return index$1.h("elsa-checkbox-property", { activityModel: activity, propertyDescriptor: property, propertyModel: prop });
  }
  update(activity, property, form) {
  }
}

class CodeEditorDriver {
  display(activity, property) {
    const prop = utils.getOrCreateProperty(activity, property.name);
    const options = property.options || {};
    const editorHeight = this.getEditorHeight(options);
    const syntax = options.syntax;
    return index$1.h("elsa-script-property", { activityModel: activity, propertyDescriptor: property, propertyModel: prop, "editor-height": editorHeight, syntax: syntax });
  }
  update(activity, property, form) {
    const value = form.get(property.name);
    utils.setActivityModelProperty(activity, property.name, value, "Literal");
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
    const prop = utils.getOrCreateProperty(activity, property.name);
    return index$1.h("elsa-dropdown-property", { activityModel: activity, propertyDescriptor: property, propertyModel: prop });
  }
  update(activity, property, form) {
  }
}

class JsonDriver {
  display(activity, property) {
    const prop = utils.getOrCreateProperty(activity, property.name);
    return index$1.h("elsa-json-property", { activityModel: activity, propertyDescriptor: property, propertyModel: prop });
  }
  update(activity, property, form) {
  }
}

class MultiTextDriver {
  display(activity, property) {
    const prop = utils.getOrCreateProperty(activity, property.name);
    return index$1.h("elsa-multi-text-property", { activityModel: activity, propertyDescriptor: property, propertyModel: prop });
  }
  update(activity, property, form) {
  }
}

class MultilineDriver {
  display(activity, property) {
    const prop = utils.getOrCreateProperty(activity, property.name);
    return index$1.h("elsa-multi-line-property", { activityModel: activity, propertyDescriptor: property, propertyModel: prop });
  }
  update(activity, property, form) {
  }
}

class RadioListDriver {
  display(activity, property) {
    const prop = utils.getOrCreateProperty(activity, property.name);
    return index$1.h("elsa-radio-list-property", { activityModel: activity, propertyDescriptor: property, propertyModel: prop });
  }
  update(activity, property, form) {
  }
}

class SingleLineDriver {
  display(activity, property) {
    const prop = utils.getOrCreateProperty(activity, property.name);
    return index$1.h("elsa-single-line-property", { activityModel: activity, propertyDescriptor: property, propertyModel: prop });
  }
}

class SwitchCaseBuilderDriver {
  display(activity, property) {
    const prop = utils.getOrCreateProperty(activity, property.name);
    return index$1.h("elsa-switch-cases-property", { activityModel: activity, propertyDescriptor: property, propertyModel: prop });
  }
  update(activity, property, form) {
  }
}

class DictionaryDriver {
  display(activity, property) {
    const prop = utils.getOrCreateProperty(activity, property.name);
    return index$1.h("elsa-dictionary-property", { activityModel: activity, propertyDescriptor: property, propertyModel: prop });
  }
  update(activity, property, form) {
  }
}

class CronExpressionDriver {
  display(activity, property) {
    const prop = utils.getOrCreateProperty(activity, property.name);
    return index$1.h("elsa-cron-expression-property", { activityModel: activity, propertyDescriptor: property, propertyModel: prop });
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
    propertyDisplayManager.propertyDisplayManager.addDriver(controlType, c);
  }
}

class ActivityIconProviderPlugin {
  constructor() {
    eventBus.eventBus.on(axiosMiddleware_esm.EventTypes.ActivityDescriptorDisplaying, this.onActivityDescriptorDisplaying);
    eventBus.eventBus.on(axiosMiddleware_esm.EventTypes.ActivityDesignDisplaying, this.onActivityDesignDisplaying);
  }
  onActivityDescriptorDisplaying(context) {
    const descriptor = context.activityDescriptor;
    const iconEntry = activityIconProvider.activityIconProvider.getIcon(descriptor.type);
    if (iconEntry)
      context.activityIcon = iconEntry;
  }
  onActivityDesignDisplaying(context) {
    const activityModel = context.activityModel;
    const iconEntry = activityIconProvider.activityIconProvider.getIcon(activityModel.type);
    if (iconEntry)
      context.activityIcon = iconEntry;
  }
}

class SwitchPlugin {
  constructor() {
    eventBus.eventBus.on(axiosMiddleware_esm.EventTypes.ActivityDesignDisplaying, this.onActivityDesignDisplaying);
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
      const cases = !!expression['$values'] ? expression['$values'] : Array.isArray(expression) ? expression : utils.parseJson(expression) || [];
      for (const c of cases)
        outcomesHash[c.name] = true;
    }
    const outcomes = Object.keys(outcomesHash);
    context.outcomes = [...outcomes, 'Default', 'Done'];
  }
}

class WhilePlugin {
  constructor() {
    eventBus.eventBus.on(axiosMiddleware_esm.EventTypes.ActivityDesignDisplaying, this.onActivityDesignDisplaying);
  }
  onActivityDesignDisplaying(context) {
    const activityModel = context.activityModel;
    if (activityModel.type !== 'While')
      return;
    const props = activityModel.properties || [];
    const condition = props.find(x => x.name == 'Condition') || { name: 'Condition', expressions: { 'Literal': '' }, syntax: 'Literal' };
    const expression = condition.expressions[condition.syntax] || '';
    const description = activityModel.description;
    const bodyText = utils.htmlEncode(description && description.length > 0 ? description : expression);
    context.bodyDisplay = `<p>${bodyText}</p>`;
  }
}

class StartAtPlugin {
  constructor() {
    eventBus.eventBus.on(axiosMiddleware_esm.EventTypes.ActivityDesignDisplaying, this.onActivityDesignDisplaying);
  }
  onActivityDesignDisplaying(context) {
    const activityModel = context.activityModel;
    if (activityModel.type !== 'StartAt')
      return;
    const props = activityModel.properties || [];
    const condition = props.find(x => x.name == 'Instant') || { name: 'Instant', expressions: { 'Literal': '' }, syntax: 'Literal' };
    const expression = utils.htmlEncode(condition.expressions[condition.syntax] || '');
    context.bodyDisplay = `<p>${expression}</p>`;
  }
}

class CronPlugin {
  constructor() {
    eventBus.eventBus.on(axiosMiddleware_esm.EventTypes.ActivityDesignDisplaying, this.onActivityDesignDisplaying);
  }
  onActivityDesignDisplaying(context) {
    const activityModel = context.activityModel;
    if (activityModel.type !== 'Cron')
      return;
    const props = activityModel.properties || [];
    const condition = props.find(x => x.name == 'CronExpression') || { name: 'CronExpression', expressions: { 'Literal': '' }, syntax: domain.SyntaxNames.Literal };
    const expression = utils.htmlEncode(condition.expressions[condition.syntax || 'Literal'] || '');
    const cronDescription = cronstrue.cronstrue.toString(expression, { throwExceptionOnParseError: false });
    context.bodyDisplay = `<p style="overflow: hidden;text-overflow: ellipsis;" title="${cronDescription}">${cronDescription}</p>`;
  }
}

class SignalReceivedPlugin {
  constructor() {
    eventBus.eventBus.on(axiosMiddleware_esm.EventTypes.ActivityDesignDisplaying, this.onActivityDisplaying);
  }
  onActivityDisplaying(context) {
    const activityModel = context.activityModel;
    if (activityModel.type !== 'SignalReceived')
      return;
    const props = activityModel.properties || [];
    const signalName = props.find(x => x.name == 'Signal') || { name: 'Signal', expressions: { 'Literal': '', syntax: domain.SyntaxNames.Literal } };
    const syntax = signalName.syntax || domain.SyntaxNames.Literal;
    const bodyDisplay = utils.htmlEncode(signalName.expressions[syntax]);
    context.bodyDisplay = `<p>${bodyDisplay}</p>`;
  }
}

class SendSignalPlugin {
  constructor() {
    eventBus.eventBus.on(axiosMiddleware_esm.EventTypes.ActivityDesignDisplaying, this.onActivityDisplaying);
  }
  onActivityDisplaying(context) {
    const activityModel = context.activityModel;
    if (activityModel.type !== 'SendSignal')
      return;
    const props = activityModel.properties || [];
    const signalName = props.find(x => x.name == 'Signal') || { name: 'Signal', expressions: { 'Literal': '', syntax: domain.SyntaxNames.Literal } };
    const syntax = signalName.syntax || domain.SyntaxNames.Literal;
    const bodyDisplay = utils.htmlEncode(signalName.expressions[syntax]);
    context.bodyDisplay = `<p>${bodyDisplay}</p>`;
  }
}

class StatePlugin {
  constructor() {
    eventBus.eventBus.on(axiosMiddleware_esm.EventTypes.ActivityDesignDisplaying, this.onActivityDesignDisplaying);
  }
  onActivityDesignDisplaying(context) {
    const activityModel = context.activityModel;
    if (activityModel.type !== 'State')
      return;
    const props = activityModel.properties || [];
    const stateNameProp = props.find(x => x.name == 'StateName') || { name: 'Text', expressions: { 'Literal': '' }, syntax: domain.SyntaxNames.Literal };
    context.displayName = utils.htmlEncode(stateNameProp.expressions[stateNameProp.syntax || 'Literal'] || 'State');
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
    eventBus.eventBus.on(axiosMiddleware_esm.EventTypes.ActivityEditor.Appearing, this.onActivityEditorAppearing);
    eventBus.eventBus.on(axiosMiddleware_esm.EventTypes.ActivityEditor.Disappearing, this.onActivityEditorDisappearing);
  }
}

class DynamicOutcomesPlugin {
  constructor() {
    this.onActivityDesignDisplaying = (context) => {
      const propValuesAsOutcomes = context.activityDescriptor.inputProperties.filter(prop => prop.considerValuesAsOutcomes);
      if (propValuesAsOutcomes.length > 0) {
        const props = context.activityModel.properties || [];
        const syntax = domain.SyntaxNames.Json;
        let dynamicOutcomes = [];
        props
          .filter(prop => propValuesAsOutcomes.find(desc => desc.name == prop.name) != undefined)
          .forEach(prop => {
          const expression = prop.expressions[syntax] || [];
          const dynamicPropertyOutcomes = !!expression['$values'] ? expression['$values'] : Array.isArray(expression) ? expression : utils.parseJson(expression) || [];
          dynamicOutcomes = [...dynamicOutcomes, ...dynamicPropertyOutcomes];
        });
        context.outcomes = [...dynamicOutcomes, ...context.outcomes];
      }
    };
    eventBus.eventBus.on(axiosMiddleware_esm.EventTypes.ActivityDesignDisplaying, this.onActivityDesignDisplaying);
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

exports.PluginManager = PluginManager;
exports.pluginManager = pluginManager;
