'use strict';

const stateTunnel = require('./state-tunnel-786a62ce.js');
const index = require('./index-915b0bc2.js');

const Tunnel = stateTunnel.createProviderConsumer({
  workflowDefinitionId: null,
  serverUrl: null,
  serverFeatures: []
}, (subscribe, child) => (index.h("context-consumer", { subscribe: subscribe, renderer: child })));

exports.Tunnel = Tunnel;
