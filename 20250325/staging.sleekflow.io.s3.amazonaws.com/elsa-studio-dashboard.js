import { Component, h, Prop, getAssetPath } from '@stencil/core';
import { loadTranslations } from "../../../i18n/i18n-loader";
import { resources } from "./localizations";
import { GetIntlMessage } from "../../../i18n/intl-message";
import Tunnel from "../../../../data/dashboard";
import { EventTypes } from '../../../../models';
import { eventBus } from '../../../../services';
export class ElsaStudioDashboard {
  constructor() {
    this.basePath = '';
    this.dashboardMenu = {
      data: {
        menuItems: [
          ['workflow-definitions', 'Workflow Definitions'],
          ['workflow-instances', 'Workflow Instances'],
          ['workflow-registry', 'Workflow Registry'],
        ],
        routes: [
          ['', 'elsa-studio-home', true],
          ['workflow-registry', 'elsa-studio-workflow-registry', true],
          ['workflow-registry/:id', 'elsa-studio-workflow-blueprint-view'],
          ['workflow-definitions', 'elsa-studio-workflow-definitions-list', true],
          ['workflow-definitions/:id', 'elsa-studio-workflow-definitions-edit'],
          ['workflow-instances', 'elsa-studio-workflow-instances-list', true],
          ['workflow-instances/:id', 'elsa-studio-workflow-instances-view'],
        ]
      }
    };
  }
  async componentWillLoad() {
    this.i18next = await loadTranslations(this.culture, resources);
    await eventBus.emit(EventTypes.Dashboard.Appearing, this, this.dashboardMenu);
  }
  render() {
    const logoPath = getAssetPath('./assets/logo.png');
    const basePath = this.basePath || '';
    const IntlMessage = GetIntlMessage(this.i18next);
    let menuItems = this.dashboardMenu.data != null ? this.dashboardMenu.data.menuItems : [];
    let routes = this.dashboardMenu.data != null ? this.dashboardMenu.data.routes : [];
    const renderFeatureMenuItem = (item, basePath) => {
      return (h("stencil-route-link", { url: `${basePath}/${item[0]}`, anchorClass: "elsa-text-gray-300 hover:elsa-bg-gray-700 hover:elsa-text-white elsa-px-3 elsa-py-2 elsa-rounded-md elsa-text-sm elsa-font-medium", activeClass: "elsa-text-white elsa-bg-gray-900" },
        h(IntlMessage, { label: `${item[1]}` })));
    };
    const renderFeatureRoute = (item, basePath) => {
      return (h("stencil-route", { url: `${basePath}/${item[0]}`, component: `${item[1]}`, exact: item[2] }));
    };
    return (h("div", { class: "elsa-h-screen elsa-bg-gray-100" },
      h("nav", { class: "elsa-bg-gray-800" },
        h("div", { class: "elsa-px-4 sm:elsa-px-6 lg:elsa-px-8" },
          h("div", { class: "elsa-flex elsa-items-center elsa-justify-between elsa-h-16" },
            h("div", { class: "elsa-flex elsa-items-center" },
              h("div", { class: "elsa-flex-shrink-0" },
                h("stencil-route-link", { url: `${basePath}/` },
                  h("img", { class: "elsa-h-8 elsa-w-8", src: logoPath, alt: "Workflow" }))),
              h("div", { class: "hidden md:elsa-block" },
                h("div", { class: "elsa-ml-10 elsa-flex elsa-items-baseline elsa-space-x-4" }, menuItems.map(item => renderFeatureMenuItem(item, basePath)))))))),
      h("main", null,
        h("stencil-router", null,
          h("stencil-route-switch", { scrollTopOffset: 0 }, routes.map(item => renderFeatureRoute(item, basePath)))))));
  }
  static get is() { return "elsa-studio-dashboard"; }
  static get assetsDirs() { return ["assets"]; }
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
      "reflect": true
    },
    "basePath": {
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
      "attribute": "base-path",
      "reflect": true,
      "defaultValue": "''"
    }
  }; }
}
Tunnel.injectProps(ElsaStudioDashboard, ['culture', 'basePath']);
