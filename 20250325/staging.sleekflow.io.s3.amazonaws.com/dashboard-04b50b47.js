'use strict';

const stateTunnel = require('./state-tunnel-786a62ce.js');
const index = require('./index-915b0bc2.js');

const Tunnel = stateTunnel.createProviderConsumer({
  serverUrl: null,
  basePath: null,
  culture: null,
  monacoLibPath: null,
  serverFeatures: []
}, (subscribe, child) => (index.h("context-consumer", { subscribe: subscribe, renderer: child })));

const dashboard = /*#__PURE__*/Object.freeze({
  __proto__: null,
  'default': Tunnel
});

exports.Tunnel = Tunnel;
exports.dashboard = dashboard;
