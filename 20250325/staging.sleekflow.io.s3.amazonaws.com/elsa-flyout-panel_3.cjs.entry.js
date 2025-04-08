'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const index = require('./index-915b0bc2.js');
const index$1 = require('./index-169661bf.js');
const eventBus = require('./event-bus-8066af27.js');
require('./domain-b01b4a53.js');
const axiosMiddleware_esm = require('./axios-middleware.esm-f337c7ad.js');
require('./collection-724169f5.js');
require('./utils-5d19a660.js');
require('./index-1eae61b2.js');
require('./cronstrue-62722667.js');
require('./_commonjsHelpers-a5111d61.js');

let ElsaFlyoutPanel = class {
  constructor(hostRef) {
    index.registerInstance(this, hostRef);
    this.expandButtonPosition = 1;
    this.toggle = () => {
      if (this.expanded) {
        index$1.leave(this.el).then(() => this.expanded = false);
      }
      else {
        this.expanded = true;
        index$1.enter(this.el);
      }
    };
  }
  async componentDidLoad() {
    this.headerTabs = Array.from(this.el.querySelectorAll('elsa-tab-header'));
    this.headerTabs.forEach(element => {
      element.onclick = () => {
        this.selectTab(element.tab);
        eventBus.eventBus.emit(axiosMiddleware_esm.EventTypes.FlyoutPanelTabSelected, this, element.tab);
      };
    });
    this.contentTabs = Array.from(this.el.querySelectorAll('elsa-tab-content'));
    if (this.headerTabs.length > 0) {
      this.currentTab = this.headerTabs[0].tab;
      await this.selectTab(this.currentTab);
    }
  }
  render() {
    const { expanded, expandButtonPosition } = this;
    const expandPositionClass = `elsa-right-${16 * (expandButtonPosition - 1) + 12}`;
    return (index.h(index.Host, null, index.h("button", { type: "button", onClick: this.toggle, class: `${expanded ? "elsa-hidden" : expandPositionClass} workflow-settings-button elsa-fixed elsa-top-20 elsa-inline-flex elsa-items-center elsa-p-2 elsa-rounded-full elsa-border elsa-border-transparent elsa-bg-white shadow elsa-text-gray-400 hover:elsa-text-blue-500 focus:elsa-text-blue-500 hover:elsa-ring-2 hover:elsa-ring-offset-2 hover:elsa-ring-blue-500 focus:elsa-outline-none focus:elsa-ring-2 focus:elsa-ring-offset-2 focus:elsa-ring-blue-500 elsa-z-10` }, index.h("svg", { xmlns: "http://www.w3.org/2000/svg", class: "elsa-h-8 elsa-w-8", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, index.h("path", { "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-width": "2", d: "M11 19l-7-7 7-7m8 14l-7-7 7-7" }))), index.h("section", { class: `${this.expanded ? '' : 'elsa-hidden'} elsa-fixed elsa-top-4 elsa-right-0 elsa-bottom-0 elsa-overflow-hidden`, "aria-labelledby": "slide-over-title", role: "dialog", "aria-modal": "true" }, index.h("div", { class: "elsa-absolute elsa-inset-0 elsa-overflow-hidden" }, index.h("div", { class: "elsa-absolute elsa-inset-0", "aria-hidden": "true" }), index.h("div", { class: "elsa-fixed elsa-top-20 elsa-inset-y-0 elsa-right-2 elsa-bottom-2 max-elsa-w-full elsa-flex" }, index.h("div", { ref: el => this.el = el, "data-transition-enter": "elsa-transform elsa-transition elsa-ease-in-out elsa-duration-300 sm:elsa-duration-700", "data-transition-enter-start": "elsa-translate-x-full", "data-transition-enter-end": "elsa-translate-x-0", "data-transition-leave": "elsa-transform elsa-transition elsa-ease-in-out elsa-duration-300 sm:elsa-duration-700", "data-transition-leave-start": "elsa-translate-x-0", "data-transition-leave-end": "elsa-translate-x-full", class: "elsa-w-screen elsa-max-w-lg elsa-h-full " }, index.h("button", { type: "button", onClick: this.toggle, class: "workflow-settings-button elsa-absolute elsa-left-2 elsa-inline-flex elsa-items-center elsa-p-2 elsa-rounded-full elsa-border elsa-border-transparent elsa-bg-white shadow elsa-text-gray-400 hover:elsa-text-blue-500 focus:elsa-text-blue-500 hover:elsa-ring-2 hover:elsa-ring-offset-2 hover:elsa-ring-blue-500 focus:elsa-outline-none focus:elsa-ring-2 focus:elsa-ring-offset-2 focus:elsa-ring-blue-500 elsa-z-10" }, index.h("svg", { xmlns: "http://www.w3.org/2000/svg", class: "elsa-h-8 elsa-w-8", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, index.h("path", { "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-width": "2", d: "M13 5l7 7-7 7M5 5l7 7-7 7" }))), index.h("div", { class: "elsa-h-full elsa-flex elsa-flex-col elsa-py-6 elsa-bg-white elsa-shadow-xl elsa-bg-white" }, index.h("div", { class: "elsa-h-full elsa-mt-8 elsa-p-6 elsa-flex elsa-flex-col" }, index.h("div", { class: "elsa-border-b elsa-border-gray-200" }, index.h("nav", { class: "-elsa-mb-px elsa-flex elsa-space-x-8", "aria-label": "Tabs" }, index.h("slot", { name: "header" }))), index.h("section", { class: "elsa-overflow-auto elsa-h-full" }, index.h("slot", { name: "content" }))))))))));
  }
  async selectTab(tab, expand = false) {
    this.headerTabs.forEach(element => {
      element.active = element.tab === tab;
    });
    this.contentTabs.forEach(element => {
      element.active = element.tab === tab;
    });
    if (expand && !this.expanded) {
      this.expanded = true;
      index$1.enter(this.el);
    }
  }
};

let ElsaTabContent = class {
  constructor(hostRef) {
    index.registerInstance(this, hostRef);
  }
  render() {
    return (index.h(index.Host, null, index.h("div", { class: `${this.active ? '' : 'elsa-hidden'} elsa-overflow-y-auto elsa-h-full` }, index.h("slot", null))));
  }
};

let ElsaTabHeader = class {
  constructor(hostRef) {
    index.registerInstance(this, hostRef);
  }
  render() {
    const className = this.active ? 'elsa-border-blue-500 elsa-text-blue-600' : 'elsa-border-transparent elsa-text-gray-500 hover:elsa-text-gray-700 hover:elsa-border-gray-300';
    return (index.h(index.Host, null, index.h("div", { class: `${className} elsa-cursor-pointer elsa-whitespace-nowrap elsa-py-4 elsa-px-1 elsa-border-b-2 elsa-font-medium elsa-text-sm` }, index.h("slot", null))));
  }
};

exports.elsa_flyout_panel = ElsaFlyoutPanel;
exports.elsa_tab_content = ElsaTabContent;
exports.elsa_tab_header = ElsaTabHeader;
