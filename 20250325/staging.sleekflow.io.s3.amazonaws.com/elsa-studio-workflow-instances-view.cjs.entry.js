'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const index = require('./index-915b0bc2.js');

let ElsaStudioWorkflowInstancesView = class {
  constructor(hostRef) {
    index.registerInstance(this, hostRef);
  }
  componentWillLoad() {
    this.id = this.match.params.id;
  }
  render() {
    const id = this.id;
    return index.h("div", null, index.h("elsa-workflow-instance-viewer-screen", { workflowInstanceId: id }));
  }
};

exports.elsa_studio_workflow_instances_view = ElsaStudioWorkflowInstancesView;
