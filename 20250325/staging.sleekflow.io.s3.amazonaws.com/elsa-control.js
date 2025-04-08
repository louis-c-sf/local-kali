import { Component, h, Host, Prop } from '@stencil/core';
export class ElsaControl {
  render() {
    const content = this.content;
    if (typeof content === 'string')
      return h(Host, { innerHTML: content });
    if (!!content.tagName)
      return h(Host, { ref: el => this.el = el });
    return (h(Host, null, content));
  }
  componentDidLoad() {
    if (!this.el)
      return;
    const content = this.content;
    this.el.append(content);
  }
  static get is() { return "elsa-control"; }
  static get properties() { return {
    "content": {
      "type": "string",
      "mutable": false,
      "complexType": {
        "original": "VNode | string | Element",
        "resolved": "Element | VNode | string",
        "references": {
          "VNode": {
            "location": "import",
            "path": "@stencil/core"
          },
          "Element": {
            "location": "global"
          }
        }
      },
      "required": false,
      "optional": false,
      "docs": {
        "tags": [],
        "text": ""
      },
      "attribute": "content",
      "reflect": false
    }
  }; }
}
