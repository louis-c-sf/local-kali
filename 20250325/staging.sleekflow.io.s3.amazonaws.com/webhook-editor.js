import { createProviderConsumer } from "@stencil/state-tunnel";
import { h } from "@stencil/core";
export default createProviderConsumer({
  webhookId: null,
  serverUrl: null
}, (subscribe, child) => (h("context-consumer", { subscribe: subscribe, renderer: child })));
