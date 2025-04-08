import { createProviderConsumer } from "@stencil/state-tunnel";
import { h } from "@stencil/core";
export default createProviderConsumer({
  serverUrl: null,
  basePath: null,
  culture: null,
  monacoLibPath: null,
  serverFeatures: []
}, (subscribe, child) => (h("context-consumer", { subscribe: subscribe, renderer: child })));
