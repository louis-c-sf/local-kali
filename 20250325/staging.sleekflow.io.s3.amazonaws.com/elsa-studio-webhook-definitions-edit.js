import { Component, Prop, h } from '@stencil/core';
export class ElsaStudioWebhookDefinitionsEdit {
  componentWillLoad() {
    let id = this.match.params.id;
    if (!!id && id.toLowerCase() == 'new')
      id = null;
    this.id = id;
  }
  render() {
    const id = this.id;
    return (h("div", null,
      h("elsa-webhook-definition-editor-screen", { "webhook-definition-id": id })));
  }
  static get is() { return "elsa-studio-webhook-definitions-edit"; }
  static get properties() { return {
    "match": {
      "type": "unknown",
      "mutable": false,
      "complexType": {
        "original": "MatchResults",
        "resolved": "MatchResults",
        "references": {
          "MatchResults": {
            "location": "import",
            "path": "@stencil/router"
          }
        }
      },
      "required": false,
      "optional": false,
      "docs": {
        "tags": [],
        "text": ""
      }
    }
  }; }
}
