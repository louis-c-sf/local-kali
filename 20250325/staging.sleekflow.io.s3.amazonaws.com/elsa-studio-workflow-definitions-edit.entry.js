import { r as registerInstance, h } from './index-28e0f8fb.js';

let ElsaStudioWorkflowDefinitionsEdit = class {
  constructor(hostRef) {
    registerInstance(this, hostRef);
  }
  componentWillLoad() {
    let id = this.match.params.id;
    if (!!id && id.toLowerCase() == 'new')
      id = null;
    this.id = id;
  }
  render() {
    const id = this.id;
    return h("div", null, h("elsa-workflow-definition-editor-screen", { "workflow-definition-id": id }));
  }
};

export { ElsaStudioWorkflowDefinitionsEdit as elsa_studio_workflow_definitions_edit };
