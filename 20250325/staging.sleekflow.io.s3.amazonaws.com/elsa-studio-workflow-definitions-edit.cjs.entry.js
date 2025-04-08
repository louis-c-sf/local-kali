'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const index = require('./index-915b0bc2.js');

let ElsaStudioWorkflowDefinitionsEdit = class {
  constructor(hostRef) {
    index.registerInstance(this, hostRef);
  }
  componentWillLoad() {
    let id = this.match.params.id;
    if (!!id && id.toLowerCase() == 'new')
      id = null;
    this.id = id;
  }
  render() {
    const id = this.id;
    return index.h("div", null, index.h("elsa-workflow-definition-editor-screen", { "workflow-definition-id": id }));
  }
};

exports.elsa_studio_workflow_definitions_edit = ElsaStudioWorkflowDefinitionsEdit;
