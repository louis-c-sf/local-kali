import { Component, Prop, h } from '@stencil/core';
export class ElsaStudioWorkflowBlueprintView {
  componentWillLoad() {
    this.id = this.match.params.id;
  }
  render() {
    const id = this.id;
    return h("div", null,
      h("elsa-workflow-blueprint-viewer-screen", { workflowDefinitionId: id }));
  }
  static get is() { return "elsa-studio-workflow-blueprint-view"; }
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
