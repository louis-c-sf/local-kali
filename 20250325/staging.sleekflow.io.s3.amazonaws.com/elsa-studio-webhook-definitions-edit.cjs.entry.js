'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const index = require('./index-915b0bc2.js');

let ElsaStudioWebhookDefinitionsEdit = class {
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
    return (index.h("div", null, index.h("elsa-webhook-definition-editor-screen", { "webhook-definition-id": id })));
  }
};

exports.elsa_studio_webhook_definitions_edit = ElsaStudioWebhookDefinitionsEdit;
