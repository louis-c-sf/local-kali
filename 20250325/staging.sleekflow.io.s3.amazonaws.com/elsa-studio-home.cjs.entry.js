'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const index = require('./index-915b0bc2.js');
require('./index-635081da.js');
const intlMessage = require('./intl-message-8802ac57.js');
const i18nLoader = require('./i18n-loader-00eaf44a.js');
const dashboard = require('./dashboard-04b50b47.js');
require('./state-tunnel-786a62ce.js');

const resources = {
  'en': {
    'default': {
      'Welcome': 'Welcome to {{title}}',
      'Tagline': 'Use the dashboard app to manage all the things.'
    }
  },
  'zh-CN': {
    'default': {
      'Welcome': '欢迎使用{{title}}',
      'Tagline': '使用应用程序仪表盘来管理所有事情。'
    }
  },
  'nl-NL': {
    'default': {
      'Welcome': 'Welkom bij {{title}}',
      'Tagline': 'Gebruik het dashboard om alles te regelen.'
    }
  }
};

let ElsaStudioHome = class {
  constructor(hostRef) {
    index.registerInstance(this, hostRef);
  }
  async componentWillLoad() {
    this.i18next = await i18nLoader.loadTranslations(this.culture, resources);
  }
  render() {
    const visualPath = index.getAssetPath('./assets/undraw_breaking_barriers_vnf3.svg');
    const IntlMessage = intlMessage.GetIntlMessage(this.i18next);
    return (index.h("div", { class: "elsa-home-wrapper elsa-relative elsa-bg-gray-800 elsa-overflow-hidden elsa-h-screen" }, index.h("main", { class: "elsa-mt-16 sm:elsa-mt-24" }, index.h("div", { class: "elsa-mx-auto elsa-max-w-7xl" }, index.h("div", { class: "lg:elsa-grid lg:elsa-grid-cols-12 lg:elsa-gap-8" }, index.h("div", { class: "elsa-px-4 sm:elsa-px-6 sm:elsa-text-center md:elsa-max-w-2xl md:elsa-mx-auto lg:elsa-col-span-6 lg:elsa-text-left lg:flex lg:elsa-items-center" }, index.h("div", { class: "elsa-home-caption-wrapper" }, index.h("h1", { class: "elsa-mt-4 elsa-text-4xl elsa-tracking-tight elsa-font-extrabold elsa-text-white sm:elsa-mt-5 sm:elsa-leading-none lg:elsa-mt-6 lg:elsa-text-5xl xl:elsa-text-6xl" }, index.h("span", { class: "md:elsa-block" }, index.h(IntlMessage, { label: "Welcome", dangerous: true, title: "<span class='elsa-text-teal-400 md:elsa-block'>Elsa Workflows</span> <span>2.7</span>" }))), index.h("p", { class: "tagline elsa-mt-3 elsa-text-base elsa-text-gray-300 sm:elsa-mt-5 sm:elsa-text-xl lg:elsa-text-lg xl:elsa-text-xl" }, index.h(IntlMessage, { label: "Tagline" })))), index.h("div", { class: "elsa-mt-16 sm:elsa-mt-24 lg:elsa-mt-0 lg:elsa-col-span-6" }, index.h("div", { class: "sm:elsa-max-w-md sm:elsa-w-full sm:elsa-mx-auto sm:elsa-rounded-lg sm:elsa-overflow-hidden" }, index.h("div", { class: "elsa-px-4 elsa-py-8 sm:elsa-px-10" }, index.h("img", { class: "elsa-home-visual", src: visualPath, alt: "", width: 400 })))))))));
  }
  static get assetsDirs() { return ["assets"]; }
};
dashboard.Tunnel.injectProps(ElsaStudioHome, ['culture']);

exports.elsa_studio_home = ElsaStudioHome;
