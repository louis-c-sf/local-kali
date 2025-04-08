import { Component, Host, h, Event, Prop, State } from '@stencil/core';
import { featuresDataManager } from "../../../services";
import { LayoutDirection } from "../../designers/tree/elsa-designer-tree/models";
import { resources } from "./localizations";
import { loadTranslations } from "../../i18n/i18n-loader";
export class ElsaDesignerPanel {
  constructor() {
    this.t = (key, options) => this.i18next.t(key, options);
    this.renderFeatureData = (name, feature) => {
      if (!feature.enabled) {
        return null;
      }
      const { t } = this;
      switch (name) {
        case featuresDataManager.supportedFeatures.workflowLayout:
          return (h("select", { id: name, name: name, onChange: e => this.onPropertyChange(e, name), class: "block focus:elsa-ring-blue-500 focus:elsa-border-blue-500 elsa-w-full elsa-shadow-sm sm:elsa-text-sm elsa-border-gray-300 elsa-rounded-md" }, Object.keys(LayoutDirection).map(key => {
            return h("option", { value: LayoutDirection[key], selected: LayoutDirection[key] === feature.value }, t(key));
          })));
        default:
          return null;
      }
    };
    this.onToggleChange = (e, name) => {
      const element = e.target;
      featuresDataManager.setEnableStatus(name, element.checked);
      this.lastChangeTime = new Date();
      this.featureStatusChanged.emit(name);
    };
    this.onPropertyChange = (e, name) => {
      const element = e.target;
      featuresDataManager.setFeatureConfig(name, element.value.trim());
      this.featureChanged.emit(name);
    };
  }
  async componentWillLoad() {
    this.i18next = await loadTranslations(this.culture, resources);
  }
  render() {
    const features = featuresDataManager.getUIFeatureList();
    const { t } = this;
    return (h(Host, null,
      h("div", { class: "elsa-mt-4" }, features.map(name => {
        const feature = featuresDataManager.getFeatureConfig(name);
        return (h("div", null,
          h("div", { class: "elsa-relative elsa-flex elsa-items-start elsa-ml-1" },
            h("div", { class: "elsa-flex elsa-items-center elsa-h-5" },
              h("input", { id: name, name: name, type: "checkbox", value: `${feature.enabled}`, checked: feature.enabled, onChange: e => this.onToggleChange(e, name), class: "focus:elsa-ring-blue-500 elsa-h-4 elsa-w-4 elsa-text-blue-600 elsa-border-gray-300 rounded" })),
            h("div", { class: "elsa-ml-3 elsa-text-sm" },
              h("label", { htmlFor: name, class: "elsa-font-medium elsa-text-gray-700" }, t(`${name}Name`)),
              h("p", { class: "elsa-text-gray-500" }, t(`${name}Description`)))),
          h("div", { class: "elsa-ml-1 elsa-my-4" }, this.renderFeatureData(name, feature))));
      }))));
  }
  static get is() { return "elsa-designer-panel"; }
  static get properties() { return {
    "culture": {
      "type": "string",
      "mutable": false,
      "complexType": {
        "original": "string",
        "resolved": "string",
        "references": {}
      },
      "required": false,
      "optional": false,
      "docs": {
        "tags": [],
        "text": ""
      },
      "attribute": "culture",
      "reflect": false
    }
  }; }
  static get states() { return {
    "lastChangeTime": {}
  }; }
  static get events() { return [{
      "method": "featureChanged",
      "name": "featureChanged",
      "bubbles": true,
      "cancelable": true,
      "composed": true,
      "docs": {
        "tags": [],
        "text": ""
      },
      "complexType": {
        "original": "string",
        "resolved": "string",
        "references": {}
      }
    }, {
      "method": "featureStatusChanged",
      "name": "featureStatusChanged",
      "bubbles": true,
      "cancelable": true,
      "composed": true,
      "docs": {
        "tags": [],
        "text": ""
      },
      "complexType": {
        "original": "string",
        "resolved": "string",
        "references": {}
      }
    }]; }
}
