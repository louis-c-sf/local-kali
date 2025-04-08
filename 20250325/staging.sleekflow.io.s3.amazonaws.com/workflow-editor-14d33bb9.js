import { c as createProviderConsumer } from './state-tunnel-04c0b67a.js';
import { h } from './index-28e0f8fb.js';

const Tunnel = createProviderConsumer({
  workflowDefinitionId: null,
  serverUrl: null,
  serverFeatures: []
}, (subscribe, child) => (h("context-consumer", { subscribe: subscribe, renderer: child })));

export { Tunnel as T };
