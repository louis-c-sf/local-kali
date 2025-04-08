import { Component, Prop, h } from '@stencil/core';
export class ElsaStudioWorkflowDefinitionsEdit {
  componentWillLoad() {
    let id = this.match.params.id;
    if (!!id && id.toLowerCase() == 'new')
      id = null;
    this.id = id;
  }
  render() {
    const id = this.id;
    return h("div", null,
      h("elsa-workflow-definition-editor-screen", { "workflow-definition-id": id }));
  }
  static get is() { return "elsa-studio-workflow-definitions-edit"; }
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
