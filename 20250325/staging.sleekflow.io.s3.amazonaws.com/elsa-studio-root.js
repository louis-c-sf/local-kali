import { Component, Event, h, Listen, Method, Prop, State } from '@stencil/core';
import Tunnel from "../../../../data/dashboard";
import { eventBus, pluginManager, activityIconProvider, confirmDialogService, toastNotificationService, createElsaClient, createHttpClient, propertyDisplayManager, featuresDataManager } from "../../../../services";
import { EventTypes } from "../../../../models";
import { getOrCreateProperty, htmlToElement } from "../../../../utils/utils";
export class ElsaStudioRoot {
  constructor() {
    this.basePath = '';
    this.onShowConfirmDialog = (e) => e.promise = this.confirmDialog.show(e.caption, e.message);
    this.onHideConfirmDialog = async () => await this.confirmDialog.hide();
    this.onShowToastNotification = async (e) => await this.toastNotificationElement.show(e);
    this.onHideToastNotification = async () => await this.toastNotificationElement.hide();
  }
  async addPlugins(pluginTypes) {
    pluginManager.registerPlugins(pluginTypes);
  }
  async addPlugin(pluginType) {
    pluginManager.registerPlugin(pluginType);
  }
  workflowChangedHandler(event) {
    eventBus.emit(EventTypes.WorkflowModelChanged, this, event.detail);
  }
  connectedCallback() {
    eventBus.on(EventTypes.ShowConfirmDialog, this.onShowConfirmDialog);
    eventBus.on(EventTypes.HideConfirmDialog, this.onHideConfirmDialog);
    eventBus.on(EventTypes.ShowToastNotification, this.onShowToastNotification);
    eventBus.on(EventTypes.HideToastNotification, this.onHideToastNotification);
  }
  disconnectedCallback() {
    eventBus.detach(EventTypes.ShowConfirmDialog, this.onShowConfirmDialog);
    eventBus.detach(EventTypes.HideConfirmDialog, this.onHideConfirmDialog);
    eventBus.detach(EventTypes.ShowToastNotification, this.onShowToastNotification);
    eventBus.detach(EventTypes.HideToastNotification, this.onHideToastNotification);
  }
  async componentWillLoad() {
    const elsaClientFactory = () => createElsaClient(this.serverUrl);
    const httpClientFactory = () => createHttpClient(this.serverUrl);
    if (this.config) {
      await fetch(`${document.location.origin}/${this.config}`)
        .then(response => {
        if (!response.ok) {
          throw new Error("HTTP error " + response.status);
        }
        return response.json();
      })
        .then(data => {
        this.featuresConfig = data;
      }).catch((error) => {
        console.error(error);
      });
    }
    const elsaStudio = this.elsaStudio = {
      serverUrl: this.serverUrl,
      basePath: this.basePath,
      features: this.featuresConfig,
      serverFeatures: [],
      eventBus,
      pluginManager,
      propertyDisplayManager,
      activityIconProvider,
      confirmDialogService,
      toastNotificationService,
      elsaClientFactory,
      httpClientFactory,
      getOrCreateProperty: getOrCreateProperty,
      htmlToElement
    };
    this.initializing.emit(elsaStudio);
    await eventBus.emit(EventTypes.Root.Initializing);
    pluginManager.initialize(elsaStudio);
    propertyDisplayManager.initialize(elsaStudio);
    featuresDataManager.initialize(elsaStudio);
    const elsaClient = await elsaClientFactory();
    elsaStudio.serverFeatures = await elsaClient.featuresApi.list();
  }
  async componentDidLoad() {
    this.initialized.emit(this.elsaStudio);
    await eventBus.emit(EventTypes.Root.Initialized);
  }
  render() {
    const culture = this.culture;
    const tunnelState = {
      serverUrl: this.serverUrl,
      basePath: this.basePath,
      serverFeatures: this.elsaStudio.serverFeatures,
      culture,
      monacoLibPath: this.monacoLibPath
    };
    return (h(Tunnel.Provider, { state: tunnelState },
      h("slot", null),
      h("elsa-confirm-dialog", { ref: el => this.confirmDialog = el, culture: this.culture }),
      h("elsa-toast-notification", { ref: el => this.toastNotificationElement = el })));
  }
  static get is() { return "elsa-studio-root"; }
  static get properties() { return {
    "serverUrl": {
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
      "attribute": "server-url",
      "reflect": true
    },
    "monacoLibPath": {
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
      "attribute": "monaco-lib-path",
      "reflect": true
    },
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
    },
    "features": {
      "type": "any",
      "mutable": false,
      "complexType": {
        "original": "any",
        "resolved": "any",
        "references": {}
      },
      "required": false,
      "optional": false,
      "docs": {
        "tags": [],
        "text": ""
      },
      "attribute": "features",
      "reflect": false
    },
    "config": {
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
      "attribute": "config",
      "reflect": false
    }
  }; }
  static get states() { return {
    "featuresConfig": {}
  }; }
  static get events() { return [{
      "method": "initializing",
      "name": "initializing",
      "bubbles": true,
      "cancelable": true,
      "composed": true,
      "docs": {
        "tags": [],
        "text": ""
      },
      "complexType": {
        "original": "ElsaStudio",
        "resolved": "ElsaStudio",
        "references": {
          "ElsaStudio": {
            "location": "import",
            "path": "../../../../models"
          }
        }
      }
    }, {
      "method": "initialized",
      "name": "initialized",
      "bubbles": true,
      "cancelable": true,
      "composed": true,
      "docs": {
        "tags": [],
        "text": ""
      },
      "complexType": {
        "original": "ElsaStudio",
        "resolved": "ElsaStudio",
        "references": {
          "ElsaStudio": {
            "location": "import",
            "path": "../../../../models"
          }
        }
      }
    }]; }
  static get methods() { return {
    "addPlugins": {
      "complexType": {
        "signature": "(pluginTypes: Array<any>) => Promise<void>",
        "parameters": [{
            "tags": [],
            "text": ""
          }],
        "references": {
          "Promise": {
            "location": "global"
          },
          "Array": {
            "location": "global"
          }
        },
        "return": "Promise<void>"
      },
      "docs": {
        "text": "",
        "tags": []
      }
    },
    "addPlugin": {
      "complexType": {
        "signature": "(pluginType: any) => Promise<void>",
        "parameters": [{
            "tags": [],
            "text": ""
          }],
        "references": {
          "Promise": {
            "location": "global"
          }
        },
        "return": "Promise<void>"
      },
      "docs": {
        "text": "",
        "tags": []
      }
    }
  }; }
  static get listeners() { return [{
      "name": "workflow-changed",
      "method": "workflowChangedHandler",
      "target": undefined,
      "capture": false,
      "passive": false
    }]; }
}
