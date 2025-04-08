import { Component, Host, h, State, Listen, Method, Event } from '@stencil/core';
import { enter, leave } from 'el-transition';
import { eventBus } from "../../../services";
import { EventTypes } from "../../../models";
export class ElsaModalDialog {
  constructor() {
    this.handleDefaultClose = async () => {
      await this.hide();
    };
  }
  render() {
    return this.renderModal();
  }
  async show(animate = true) {
    this.showInternal(animate);
  }
  async hide(animate = true) {
    await eventBus.emit(EventTypes.HideModalDialog);
    this.hideInternal(animate);
  }
  showInternal(animate) {
    this.isVisible = true;
    if (!animate) {
      this.overlay.style.opacity = "1";
      this.modal.style.opacity = "1";
    }
    enter(this.overlay);
    enter(this.modal).then(this.shown.emit);
  }
  hideInternal(animate) {
    if (!animate) {
      this.isVisible = false;
    }
    leave(this.overlay);
    leave(this.modal).then(() => {
      this.isVisible = false;
      this.hidden.emit();
    });
  }
  async handleKeyDown(e) {
    if (this.isVisible && e.key === 'Escape') {
      await this.hide(true);
    }
  }
  renderModal() {
    return (h(Host, { class: { 'hidden': !this.isVisible, 'elsa-block': true } },
      h("div", { class: "elsa-fixed elsa-z-10 elsa-inset-0 elsa-overflow-y-auto" },
        h("div", { class: "elsa-flex elsa-items-end elsa-justify-center elsa-min-h-screen elsa-pt-4 elsa-px-4 elsa-pb-20 elsa-text-center sm:elsa-block sm:elsa-p-0" },
          h("div", { ref: el => this.overlay = el, onClick: () => this.hide(true), "data-transition-enter": "elsa-ease-out elsa-duration-300", "data-transition-enter-start": "elsa-opacity-0", "data-transition-enter-end": "elsa-opacity-0", "data-transition-leave": "elsa-ease-in elsa-duration-200", "data-transition-leave-start": "elsa-opacity-0", "data-transition-leave-end": "elsa-opacity-0", class: "hidden elsa-fixed elsa-inset-0 elsa-transition-opacity", "aria-hidden": "true" },
            h("div", { class: "elsa-absolute elsa-inset-0 elsa-bg-gray-500 elsa-opacity-75" })),
          h("span", { class: "hidden sm:elsa-inline-block sm:elsa-align-middle sm:elsa-h-screen", "aria-hidden": "true" }),
          h("div", { ref: el => this.modal = el, "data-transition-enter": "elsa-ease-out elsa-duration-300", "data-transition-enter-start": "elsa-opacity-0 elsa-translate-y-4 sm:elsa-translate-y-0 sm:elsa-scale-95", "data-transition-enter-end": "elsa-opacity-0 elsa-translate-y-0 sm:elsa-scale-100", "data-transition-leave": "elsa-ease-in elsa-duration-200", "data-transition-leave-start": "elsa-opacity-0 elsa-translate-y-0 sm:elsa-scale-100", "data-transition-leave-end": "elsa-opacity-0 elsa-translate-y-4 sm:elsa-translate-y-0 sm:elsa-scale-95", class: "hidden elsa-inline-block sm:elsa-align-top elsa-bg-white elsa-rounded-lg elsa-text-left elsa-overflow-visible elsa-shadow-xl elsa-transform elsa-transition-all sm:elsa-my-8 sm:elsa-align-top sm:elsa-max-w-4xl sm:elsa-w-full", role: "dialog", "aria-modal": "true", "aria-labelledby": "modal-headline" },
            h("div", { class: "modal-content" },
              h("slot", { name: "content" })),
            h("slot", { name: "buttons" },
              h("div", { class: "elsa-bg-gray-50 elsa-px-4 elsa-py-3 sm:elsa-px-6 sm:elsa-flex sm:elsa-flex-row-reverse" },
                h("button", { type: "button", onClick: this.handleDefaultClose, class: "elsa-mt-3 elsa-w-full elsa-inline-flex elsa-justify-center elsa-rounded-md elsa-border elsa-border-gray-300 elsa-shadow-sm elsa-px-4 elsa-py-2 elsa-bg-white elsa-text-base elsa-font-medium elsa-text-gray-700 hover:elsa-bg-gray-50 focus:elsa-outline-none focus:elsa-ring-2 focus:elsa-ring-offset-2 focus:elsa-ring-blue-500 sm:elsa-mt-0 sm:elsa-ml-3 sm:elsa-w-auto sm:elsa-text-sm" }, "Close"))))))));
  }
  static get is() { return "elsa-modal-dialog"; }
  static get states() { return {
    "isVisible": {}
  }; }
  static get events() { return [{
      "method": "shown",
      "name": "shown",
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
      "method": "hidden",
      "name": "hidden",
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
    }]; }
  static get methods() { return {
    "show": {
      "complexType": {
        "signature": "(animate?: boolean) => Promise<void>",
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
    },
    "hide": {
      "complexType": {
        "signature": "(animate?: boolean) => Promise<void>",
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
      "name": "keydown",
      "method": "handleKeyDown",
      "target": "window",
      "capture": false,
      "passive": false
    }]; }
}
