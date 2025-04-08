import { Component, Event, Host, h, Listen, Prop } from '@stencil/core';
import { leave, toggle } from 'el-transition';
import Tunnel from '../../../../data/workflow-editor';
import { loadTranslations } from "../../../i18n/i18n-loader";
import { resources } from "./localizations";
export class ElsaWorkflowPublishButton {
  constructor() {
    this.t = (key) => this.i18next.t(key);
    this.onPublishClick = (e) => {
      e.preventDefault();
      this.publishClicked.emit();
      leave(this.menu);
    };
    this.onUnPublishClick = (e) => {
      e.preventDefault();
      this.unPublishClicked.emit();
      leave(this.menu);
    };
    this.onRevertClick = (e) => {
      e.preventDefault();
      this.revertClicked.emit();
      leave(this.menu);
    };
    this.onExportClick = async (e) => {
      e.preventDefault();
      this.exportClicked.emit();
      leave(this.menu);
    };
    this.onImportClick = async (e) => {
      e.preventDefault();
      this.fileInput.value = null;
      this.fileInput.click();
      leave(this.menu);
    };
    this.renderMainButton = () => {
      const workflowDefinition = this.workflowDefinition;
      const isPublished = workflowDefinition.isPublished;
      if (isPublished)
        return this.publishing ? this.renderUnpublishingButton() : this.renderUnpublishButton();
      else
        return this.publishing ? this.renderPublishingButton() : this.renderPublishButton();
    };
    this.renderPublishButton = () => {
      const workflowDefinition = this.workflowDefinition;
      const isLatest = workflowDefinition.isLatest;
      const version = workflowDefinition.version;
      if (isLatest)
        return this.renderButton('Publish', this.onPublishClick);
      return this.renderButton(`Revert version ${version}`, this.onRevertClick);
    };
    this.renderUnpublishButton = () => {
      return this.renderButton('Unpublish', e => this.onUnPublishClick(e));
    };
    this.renderPublishMenuItem = () => {
      return this.renderMenuItem('Publish', this.onPublishClick);
    };
    this.renderUnpublishMenuItem = () => {
      return this.renderMenuItem('Unpublish', this.onUnPublishClick);
    };
    this.renderMenuItem = (text, handler) => {
      if (!this.workflowDefinition.isPublished)
        return undefined;
      const t = this.t;
      return (h("div", { class: "elsa-py-1", role: "none" },
        h("a", { href: "#", onClick: e => handler(e), class: "elsa-block elsa-px-4 elsa-py-2 elsa-text-sm elsa-text-gray-700 hover:elsa-bg-gray-100 hover:elsa-text-gray-900", role: "menuitem" }, t(text))));
    };
    this.renderUnpublishingButton = () => {
      return this.renderLoadingButton('Unpublishing');
    };
    this.renderButton = (text, handler) => {
      const t = this.t;
      return (h("button", { type: "button", onClick: e => handler(e), class: "elsa-relative elsa-inline-flex elsa-items-center elsa-px-4 elsa-py-2 elsa-rounded-l-md elsa-border elsa-border-gray-300 elsa-bg-white elsa-text-sm elsa-font-medium elsa-text-gray-700 hover:elsa-bg-gray-50 focus:elsa-z-10 focus:elsa-outline-none focus:elsa-ring-1 focus:elsa-ring-blue-500 focus:elsa-border-blue-500" }, text));
    };
  }
  async componentWillLoad() {
    this.i18next = await loadTranslations(this.culture, resources);
  }
  onWindowClicked(event) {
    const target = event.target;
    if (!this.element.contains(target))
      this.closeMenu();
  }
  closeMenu() {
    leave(this.menu);
  }
  toggleMenu() {
    toggle(this.menu);
  }
  async onFileInputChange(e) {
    const files = this.fileInput.files;
    if (files.length == 0) {
      return;
    }
    this.importClicked.emit(files[0]);
  }
  render() {
    const t = this.t;
    return (h(Host, { class: "elsa-block", ref: el => this.element = el },
      h("span", { class: "elsa-relative elsa-z-0 elsa-inline-flex elsa-shadow-sm elsa-rounded-md" },
        this.renderMainButton(),
        h("span", { class: "-elsa-ml-px elsa-relative elsa-block" },
          h("button", { onClick: () => this.toggleMenu(), id: "option-menu", type: "button", class: "elsa-relative elsa-inline-flex elsa-items-center elsa-px-2 elsa-py-2 elsa-rounded-r-md elsa-border elsa-border-gray-300 elsa-bg-white elsa-text-sm elsa-font-medium elsa-text-gray-500 hover:elsa-bg-gray-50 focus:elsa-z-10 focus:elsa-outline-none focus:elsa-ring-1 focus:elsa-ring-blue-500 focus:elsa-border-blue-500" },
            h("span", { class: "elsa-sr-only" }, "Open options"),
            h("svg", { class: "elsa-h-5 elsa-w-5", "x-description": "Heroicon name: solid/chevron-down", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 20 20", fill: "currentColor", "aria-hidden": "true" },
              h("path", { "fill-rule": "evenodd", d: "M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z", "clip-rule": "evenodd" }))),
          h("div", { ref: el => this.menu = el, "data-transition-enter": "elsa-transition elsa-ease-out elsa-duration-100", "data-transition-enter-start": "elsa-transform elsa-opacity-0 elsa-scale-95", "data-transition-enter-end": "elsa-transform elsa-opacity-100 elsa-scale-100", "data-transition-leave": "elsa-transition elsa-ease-in elsa-duration-75", "data-transition-leave-start": "elsa-transform elsa-opacity-100 elsa-scale-100", "data-transition-leave-end": "elsa-transform elsa-opacity-0 elsa-scale-95", class: "hidden origin-bottom-right elsa-absolute elsa-right-0 elsa-bottom-10 elsa-mb-2 -elsa-mr-1 elsa-w-56 elsa-rounded-md elsa-shadow-lg elsa-bg-white elsa-ring-1 elsa-ring-black elsa-ring-opacity-5" },
            h("div", { class: "elsa-divide-y elsa-divide-gray-100 focus:elsa-outline-none", role: "menu", "aria-orientation": "vertical", "aria-labelledby": "option-menu" },
              h("div", { class: "elsa-py-1", role: "none" },
                h("a", { href: "#", onClick: e => this.onExportClick(e), class: "elsa-block elsa-px-4 elsa-py-2 elsa-text-sm elsa-text-gray-700 hover:elsa-bg-gray-100 hover:elsa-text-gray-900", role: "menuitem" }, t('Export')),
                h("a", { href: "#", onClick: e => this.onImportClick(e), class: "elsa-block elsa-px-4 elsa-py-2 elsa-text-sm elsa-text-gray-700 hover:elsa-bg-gray-100 hover:elsa-text-gray-900", role: "menuitem" }, t('Import'))))))),
      h("input", { type: "file", class: "hidden", onChange: e => this.onFileInputChange(e), ref: el => this.fileInput = el })));
  }
  renderPublishingButton() {
    const workflowDefinition = this.workflowDefinition;
    const isLatest = workflowDefinition.isLatest;
    const version = workflowDefinition.version;
    const text = isLatest ? 'Publishing' : `Publishing version ${version}`;
    return this.renderLoadingButton(text);
  }
  renderLoadingButton(text) {
    const t = this.t;
    return (h("button", { type: "button", disabled: true, class: "elsa-relative elsa-inline-flex elsa-items-center elsa-px-4 elsa-py-2 elsa-rounded-l-md elsa-border elsa-border-gray-300 elsa-bg-white elsa-text-sm elsa-font-medium elsa-text-gray-700 hover:elsa-bg-gray-50 focus:elsa-z-10 focus:elsa-outline-none focus:elsa-ring-1 focus:elsa-ring-blue-500 focus:elsa-border-blue-500" },
      h("svg", { class: "elsa-animate-spin -elsa-ml-1 elsa-mr-3 elsa-h-5 elsa-w-5 elsa-text-blue-400", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24" },
        h("circle", { class: "elsa-opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", "stroke-width": "4" }),
        h("path", { class: "elsa-opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })),
      t(text)));
  }
  static get is() { return "elsa-workflow-publish-button"; }
  static get properties() { return {
    "workflowDefinition": {
      "type": "unknown",
      "mutable": false,
      "complexType": {
        "original": "WorkflowDefinition",
        "resolved": "WorkflowDefinition",
        "references": {
          "WorkflowDefinition": {
            "location": "import",
            "path": "../../../../models"
          }
        }
      },
      "required": false,
      "optional": false,
      "docs": {
        "tags": [],
        "text": ""
      }
    },
    "publishing": {
      "type": "boolean",
      "mutable": false,
      "complexType": {
        "original": "boolean",
        "resolved": "boolean",
        "references": {}
      },
      "required": false,
      "optional": false,
      "docs": {
        "tags": [],
        "text": ""
      },
      "attribute": "publishing",
      "reflect": false
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
      "reflect": false
    }
  }; }
  static get events() { return [{
      "method": "publishClicked",
      "name": "publishClicked",
      "bubbles": true,
      "cancelable": true,
      "composed": true,
      "docs": {
        "tags": [],
        "text": ""
      },
      "complexType": {
        "original": "any",
        "resolved": "any",
        "references": {}
      }
    }, {
      "method": "unPublishClicked",
      "name": "unPublishClicked",
      "bubbles": true,
      "cancelable": true,
      "composed": true,
      "docs": {
        "tags": [],
        "text": ""
      },
      "complexType": {
        "original": "any",
        "resolved": "any",
        "references": {}
      }
    }, {
      "method": "revertClicked",
      "name": "revertClicked",
      "bubbles": true,
      "cancelable": true,
      "composed": true,
      "docs": {
        "tags": [],
        "text": ""
      },
      "complexType": {
        "original": "any",
        "resolved": "any",
        "references": {}
      }
    }, {
      "method": "exportClicked",
      "name": "exportClicked",
      "bubbles": true,
      "cancelable": true,
      "composed": true,
      "docs": {
        "tags": [],
        "text": ""
      },
      "complexType": {
        "original": "any",
        "resolved": "any",
        "references": {}
      }
    }, {
      "method": "importClicked",
      "name": "importClicked",
      "bubbles": true,
      "cancelable": true,
      "composed": true,
      "docs": {
        "tags": [],
        "text": ""
      },
      "complexType": {
        "original": "File",
        "resolved": "File",
        "references": {
          "File": {
            "location": "global"
          }
        }
      }
    }]; }
  static get listeners() { return [{
      "name": "click",
      "method": "onWindowClicked",
      "target": "window",
      "capture": false,
      "passive": false
    }]; }
}
Tunnel.injectProps(ElsaWorkflowPublishButton, ['serverUrl']);
