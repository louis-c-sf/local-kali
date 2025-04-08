import { Component, getAssetPath, h, Prop } from '@stencil/core';
import 'i18next-wc';
import { GetIntlMessage } from "../../../i18n/intl-message";
import { loadTranslations } from "../../../i18n/i18n-loader";
import { resources } from "./localizations";
import Tunnel from "../../../../data/dashboard";
export class ElsaStudioHome {
  async componentWillLoad() {
    this.i18next = await loadTranslations(this.culture, resources);
  }
  render() {
    const visualPath = getAssetPath('./assets/undraw_breaking_barriers_vnf3.svg');
    const IntlMessage = GetIntlMessage(this.i18next);
    return (h("div", { class: "elsa-home-wrapper elsa-relative elsa-bg-gray-800 elsa-overflow-hidden elsa-h-screen" },
      h("main", { class: "elsa-mt-16 sm:elsa-mt-24" },
        h("div", { class: "elsa-mx-auto elsa-max-w-7xl" },
          h("div", { class: "lg:elsa-grid lg:elsa-grid-cols-12 lg:elsa-gap-8" },
            h("div", { class: "elsa-px-4 sm:elsa-px-6 sm:elsa-text-center md:elsa-max-w-2xl md:elsa-mx-auto lg:elsa-col-span-6 lg:elsa-text-left lg:flex lg:elsa-items-center" },
              h("div", { class: "elsa-home-caption-wrapper" },
                h("h1", { class: "elsa-mt-4 elsa-text-4xl elsa-tracking-tight elsa-font-extrabold elsa-text-white sm:elsa-mt-5 sm:elsa-leading-none lg:elsa-mt-6 lg:elsa-text-5xl xl:elsa-text-6xl" },
                  h("span", { class: "md:elsa-block" },
                    h(IntlMessage, { label: "Welcome", dangerous: true, title: "<span class='elsa-text-teal-400 md:elsa-block'>Elsa Workflows</span> <span>2.7</span>" }))),
                h("p", { class: "tagline elsa-mt-3 elsa-text-base elsa-text-gray-300 sm:elsa-mt-5 sm:elsa-text-xl lg:elsa-text-lg xl:elsa-text-xl" },
                  h(IntlMessage, { label: "Tagline" })))),
            h("div", { class: "elsa-mt-16 sm:elsa-mt-24 lg:elsa-mt-0 lg:elsa-col-span-6" },
              h("div", { class: "sm:elsa-max-w-md sm:elsa-w-full sm:elsa-mx-auto sm:elsa-rounded-lg sm:elsa-overflow-hidden" },
                h("div", { class: "elsa-px-4 elsa-py-8 sm:elsa-px-10" },
                  h("img", { class: "elsa-home-visual", src: visualPath, alt: "", width: 400 })))))))));
  }
  static get is() { return "elsa-studio-home"; }
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
      "reflect": false
    }
  }; }
}
Tunnel.injectProps(ElsaStudioHome, ['culture']);
