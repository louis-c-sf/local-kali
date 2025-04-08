import { c as createProviderConsumer } from './state-tunnel-04c0b67a.js';
import { h } from './index-28e0f8fb.js';

const Tunnel = createProviderConsumer({
  serverUrl: null,
  basePath: null,
  culture: null,
  monacoLibPath: null,
  serverFeatures: []
}, (subscribe, child) => (h("context-consumer", { subscribe: subscribe, renderer: child })));

const dashboard = /*#__PURE__*/Object.freeze({
  __proto__: null,
  'default': Tunnel
});

export { Tunnel as T, dashboard as d };
