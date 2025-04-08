import { r as registerInstance, c as createEvent, h } from './index-28e0f8fb.js';
import { l as leave, t as toggle } from './index-886428b8.js';
import { D as DropdownButtonOrigin } from './models-097374b8.js';
import { i as injectHistory } from './injectHistory-67aecf6c.js';
import { b as parseQuery, q as queryToString } from './utils-823f97c1.js';
import { l as loadTranslations } from './i18n-loader-0c9b01c7.js';
import './index-fe375cc0.js';
import './active-router-3a675f01.js';
import './state-tunnel-04c0b67a.js';
import './collection-89937abc.js';
import './_commonjsHelpers-4ed75ef8.js';

const elsaDropdownButtonCss = "";

let ElsaContextMenu = class {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.itemSelected = createEvent(this, "itemSelected", 7);
    this.origin = DropdownButtonOrigin.TopLeft;
    this.items = [];
  }
  onWindowClicked(event) {
    const target = event.target;
    if (!this.element.contains(target))
      this.closeContextMenu();
  }
  closeContextMenu() {
    if (!!this.contextMenu)
      leave(this.contextMenu);
  }
  toggleMenu() {
    if (!!this.contextMenu)
      toggle(this.contextMenu);
  }
  getOriginClass() {
    switch (this.origin) {
      case DropdownButtonOrigin.TopLeft:
        return `elsa-left-0 elsa-origin-top-left`;
      case DropdownButtonOrigin.TopRight:
      default:
        return 'elsa-right-0 elsa-origin-top-right';
    }
  }
  async onItemClick(e, menuItem) {
    e.preventDefault();
    this.itemSelected.emit(menuItem);
    this.closeContextMenu();
  }
  render() {
    return (h("div", { class: "elsa-relative", ref: el => this.element = el }, h("button", { onClick: e => this.toggleMenu(), type: "button", class: "elsa-w-full elsa-bg-white elsa-border elsa-border-gray-300 elsa-rounded-md elsa-shadow-sm elsa-px-4 elsa-py-2 elsa-inline-flex elsa-justify-center elsa-text-sm elsa-font-medium elsa-text-gray-700 hover:elsa-bg-gray-50 focus:elsa-outline-none focus:elsa-ring-2 focus:elsa-ring-offset-2 focus:elsa-ring-blue-500", "aria-haspopup": "true", "aria-expanded": "false" }, this.renderIcon(), this.text, h("svg", { class: "elsa-ml-2.5 -elsa-elsa-mr-1.5 elsa-h-5 elsa-w-5 elsa-text-gray-400", "x-description": "Heroicon name: chevron-down", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 20 20", fill: "currentColor", "aria-hidden": "true" }, h("path", { "fill-rule": "evenodd", d: "M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z", "clip-rule": "evenodd" }))), this.renderMenu()));
  }
  renderMenu() {
    if (this.items.length == 0)
      return;
    const originClass = this.getOriginClass();
    return h("div", { ref: el => this.contextMenu = el, "data-transition-enter": "elsa-transition elsa-ease-out elsa-duration-100", "data-transition-enter-start": "elsa-transform elsa-opacity-0 elsa-scale-95", "data-transition-leave": "elsa-transition elsa-ease-in elsa-duration-75", "data-transition-leave-start": "elsa-transform elsa-opacity-100 elsa-scale-100", "data-transition-leave-end": "elsa-transform elsa-opacity-0 elsa-scale-95", class: `hidden ${originClass} elsa-z-10 elsa-absolute elsa-mt-2 elsa-w-56 elsa-rounded-md elsa-shadow-lg elsa-bg-white elsa-ring-1 elsa-ring-black elsa-ring-opacity-5` }, h("div", { class: "elsa-py-1", role: "menu", "aria-orientation": "vertical" }, this.renderItems()));
  }
  renderItems() {
    return this.items.map(item => {
      const selectedCssClass = item.isSelected ? "elsa-bg-blue-600 hover:elsa-bg-blue-700 elsa-text-white" : "hover:elsa-bg-gray-100 elsa-text-gray-700 hover:elsa-text-gray-900";
      return !!item.url
        ? h("stencil-route-link", { onClick: e => this.closeContextMenu(), url: item.url, anchorClass: `elsa-block elsa-px-4 elsa-py-2 elsa-text-sm ${selectedCssClass} elsa-cursor-pointer`, role: "menuitem" }, item.text)
        : h("a", { href: "#", onClick: e => this.onItemClick(e, item), class: `elsa-block elsa-px-4 elsa-py-2 elsa-text-sm ${selectedCssClass}`, role: "menuitem" }, item.text);
    });
  }
  renderIcon() {
    if (!this.icon)
      return;
    return this.icon;
  }
};
ElsaContextMenu.style = elsaDropdownButtonCss;

const resources = {
  'en': {
    'default': {
      'Previous': 'Previous',
      'Next': 'Next',
      'From': 'From',
      'To': 'to',
      'Of': 'of',
      'Results': 'results',
      'Display': '{{template}}'
    }
  },
  'zh-CN': {
    'default': {
      'Previous': '上一页',
      'Next': '下一页',
      'From': '从',
      'To': '到',
      'Of': ' 共',
      'Results': '条数据',
      'Display': '{{template}}'
    }
  },
  'nl-NL': {
    'default': {
      'Previous': 'Vorige',
      'Next': 'Volgende',
      'From': 'Van',
      'To': 'tot',
      'Of': 'van',
      'Results': 'resultaten',
      'Display': '{{template}}'
    }
  }
};

let ElsaPager = class {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.paged = createEvent(this, "paged", 7);
    this.t = (key, options) => this.i18next.t(key, options);
  }
  async componentWillLoad() {
    this.i18next = await loadTranslations(this.culture, resources);
    this.basePath = !!this.location ? this.location.pathname : document.location.pathname;
  }
  navigate(path, page) {
    if (this.history) {
      this.history.push(path);
      return;
    }
    else {
      this.paged.emit({ page, pageSize: this.pageSize, totalCount: this.totalCount });
    }
  }
  onNavigateClick(e, page) {
    const anchor = e.currentTarget;
    e.preventDefault();
    this.navigate(`${anchor.pathname}${anchor.search}`, page);
  }
  render() {
    const page = this.page;
    const pageSize = this.pageSize;
    const totalCount = this.totalCount;
    const basePath = this.basePath;
    const from = page * pageSize + 1;
    const to = Math.min(from + pageSize - 1, totalCount);
    const pageCount = Math.round(((totalCount - 1) / pageSize) + 0.5);
    const maxPageButtons = 10;
    const fromPage = Math.max(0, page - maxPageButtons / 2);
    const toPage = Math.min(pageCount, fromPage + maxPageButtons);
    const self = this;
    const currentQuery = !!this.history ? parseQuery(this.history.location.search) : { page, pageSize };
    const t = this.t;
    currentQuery['pageSize'] = pageSize;
    const getNavUrl = (page) => {
      const query = Object.assign(Object.assign({}, currentQuery), { 'page': page });
      return `${basePath}?${queryToString(query)}`;
    };
    const renderPreviousButton = function () {
      if (page <= 0)
        return;
      return h("a", { href: `${getNavUrl(page - 1)}`, onClick: e => self.onNavigateClick(e, page - 1), class: "elsa-relative elsa-inline-flex elsa-items-center elsa-px-4 elsa-py-2 elsa-border elsa-border-gray-300 elsa-text-sm elsa-leading-5 elsa-font-medium elsa-rounded-md elsa-text-gray-700 elsa-bg-white hover:elsa-text-gray-500 focus:elsa-outline-none focus:elsa-shadow-outline-blue focus:elsa-border-blue-300 active:elsa-bg-gray-100 active:elsa-text-gray-700 elsa-transition elsa-ease-in-out elsa-duration-150" }, t('Previous'));
    };
    const renderNextButton = function () {
      if (page >= pageCount)
        return;
      return h("a", { href: `/${getNavUrl(page + 1)}`, onClick: e => self.onNavigateClick(e, page + 1), class: "elsa-ml-3 elsa-relative elsa-inline-flex elsa-items-center elsa-px-4 elsa-py-2 elsa-border elsa-border-gray-300 elsa-text-sm elsa-leading-5 elsa-font-medium elsa-rounded-md elsa-text-gray-700 elsa-bg-white hover:elsa-text-gray-500 focus:elsa-outline-none focus:elsa-shadow-outline-blue focus:elsa-border-blue-300 active:elsa-bg-gray-100 active:elsa-text-gray-700 elsa-transition elsa-ease-in-out elsa-duration-150" }, t('Next'));
    };
    const renderChevronLeft = function () {
      if (page <= 0)
        return;
      return (h("a", { href: `${getNavUrl(page - 1)}`, onClick: e => self.onNavigateClick(e, page - 1), class: "elsa-relative elsa-inline-flex elsa-items-center elsa-px-2 elsa-py-2 elsa-rounded-l-md elsa-border elsa-border-gray-300 elsa-bg-white elsa-text-sm elsa-leading-5 elsa-font-medium elsa-text-gray-500 hover:elsa-text-gray-400 focus:elsa-z-10 focus:elsa-outline-none focus:elsa-border-blue-300 focus:elsa-shadow-outline-blue active:elsa-bg-gray-100 active:elsa-text-gray-500 elsa-transition elsa-ease-in-out elsa-duration-150", "aria-label": "Previous" }, h("svg", { class: "elsa-h-5 elsa-w-5", "x-description": "Heroicon name: chevron-left", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 20 20", fill: "currentColor" }, h("path", { "fill-rule": "evenodd", d: "M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z", "clip-rule": "evenodd" }))));
    };
    const renderChevronRight = function () {
      if (page >= pageCount - 1)
        return;
      return (h("a", { href: `${getNavUrl(page + 1)}`, onClick: e => self.onNavigateClick(e, page + 1), class: "-elsa-ml-px elsa-relative elsa-inline-flex elsa-items-center elsa-px-2 elsa-py-2 elsa-rounded-r-md elsa-border elsa-border-gray-300 elsa-bg-white elsa-text-sm elsa-leading-5 elsa-font-medium elsa-text-gray-500 hover:elsa-text-gray-400 focus:elsa-z-10 focus:elsa-outline-none focus:elsa-border-blue-300 focus:elsa-shadow-outline-blue active:elsa-bg-gray-100 active:elsa-text-gray-500 elsa-transition elsa-ease-in-out elsa-duration-150", "aria-label": "Next" }, h("svg", { class: "elsa-h-5 elsa-w-5", "x-description": "Heroicon name: chevron-right", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 20 20", fill: "currentColor" }, h("path", { "fill-rule": "evenodd", d: "M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z", "clip-rule": "evenodd" }))));
    };
    const renderPagerButtons = function () {
      const buttons = [];
      for (let i = fromPage; i < toPage; i++) {
        const isCurrent = page == i;
        const isFirst = i == fromPage;
        const isLast = i == toPage - 1;
        const leftRoundedClass = isFirst && isCurrent ? 'elsa-rounded-l-md' : '';
        const rightRoundedClass = isLast && isCurrent ? 'elsa-rounded-r-md' : '';
        if (isCurrent) {
          buttons.push(h("span", { class: `-elsa-ml-px elsa-relative elsa-inline-flex elsa-items-center elsa-px-4 elsa-py-2 elsa-border elsa-border-gray-300 elsa-text-sm elsa-leading-5 elsa-font-medium elsa-bg-blue-600 elsa-text-white ${leftRoundedClass} ${rightRoundedClass}` }, i + 1));
        }
        else {
          buttons.push(h("a", { href: `${getNavUrl(i)}`, onClick: e => self.onNavigateClick(e, i), class: `-elsa-ml-px elsa-relative elsa-inline-flex elsa-items-center elsa-px-4 elsa-py-2 elsa-border elsa-border-gray-300 elsa-bg-white elsa-text-sm elsa-leading-5 elsa-font-medium elsa-text-gray-700 hover:elsa-text-gray-500 focus:elsa-z-10 focus:elsa-outline-none active:elsa-bg-gray-100 active:elsa-text-gray-700 elsa-transition elsa-ease-in-out elsa-duration-150 ${leftRoundedClass}` }, i + 1));
        }
      }
      return buttons;
    };
    return (h("div", { class: "elsa-bg-white elsa-px-4 elsa-py-3 elsa-flex elsa-items-center elsa-justify-between elsa-border-t elsa-border-gray-200 sm:elsa-px-6" }, h("div", { class: "elsa-flex-1 elsa-flex elsa-justify-between sm:elsa-hidden" }, renderPreviousButton(), renderNextButton()), h("div", { class: "hidden sm:elsa-flex-1 sm:elsa-flex sm:elsa-items-center sm:elsa-justify-between" }, h("div", null, h("p", { class: "elsa-text-sm elsa-leading-5 elsa-text-gray-700 elsa-space-x-0-5" }, h("span", null, t('From')), h("span", { class: "elsa-font-medium" }, from), h("span", null, t('To')), h("span", { class: "elsa-font-medium" }, to), h("span", null, t('Of')), h("span", { class: "elsa-font-medium" }, totalCount), h("span", null, t('Results')))), h("div", null, h("nav", { class: "elsa-relative elsa-z-0 elsa-inline-flex elsa-shadow-sm" }, renderChevronLeft(), renderPagerButtons(), renderChevronRight())))));
  }
};
injectHistory(ElsaPager);

export { ElsaContextMenu as elsa_dropdown_button, ElsaPager as elsa_pager };
