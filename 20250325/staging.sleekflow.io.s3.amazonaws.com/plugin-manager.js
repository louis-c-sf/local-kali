import { IfPlugin } from "../plugins/if-plugin";
import { HttpEndpointPlugin } from "../plugins/http-endpoint-plugin";
import { TimerPlugin } from "../plugins/timer-plugin";
import { WriteLinePlugin } from "../plugins/write-line-plugin";
import { SendEmailPlugin } from "../plugins/send-email-plugin";
import { DefaultDriversPlugin } from "../plugins/default-drivers-plugin";
import { ActivityIconProviderPlugin } from "../plugins/activity-icon-provider-plugin";
import { SwitchPlugin } from "../plugins/switch-plugin";
import { WhilePlugin } from "../plugins/while-plugin";
import { StartAtPlugin } from "../plugins/start-at-plugin";
import { CronPlugin } from "../plugins/cron-plugin";
import { SignalReceivedPlugin } from "../plugins/signal-received-plugin";
import { SendSignalPlugin } from "../plugins/send-signal-plugin";
import { StatePlugin } from "../plugins/state-plugin";
import { SendHttpRequestPlugin } from "../plugins/send-http-request-plugin";
import { DynamicOutcomesPlugin } from "../plugins/dynamic-outcomes-plugin";
export class PluginManager {
  constructor() {
    this.plugins = [];
    this.pluginTypes = [];
    this.createPlugin = (pluginType) => {
      return new pluginType(this.elsaStudio);
    };
    this.pluginTypes = [
      DefaultDriversPlugin,
      ActivityIconProviderPlugin,
      IfPlugin,
      WhilePlugin,
      SwitchPlugin,
      HttpEndpointPlugin,
      SendHttpRequestPlugin,
      TimerPlugin,
      StartAtPlugin,
      CronPlugin,
      SignalReceivedPlugin,
      SendSignalPlugin,
      WriteLinePlugin,
      StatePlugin,
      SendEmailPlugin,
      DynamicOutcomesPlugin
    ];
  }
  initialize(elsaStudio) {
    if (this.initialized)
      return;
    this.elsaStudio = elsaStudio;
    for (const pluginType of this.pluginTypes) {
      this.createPlugin(pluginType);
    }
    this.initialized = true;
  }
  registerPlugins(pluginTypes) {
    for (const pluginType of pluginTypes) {
      this.registerPlugin(pluginType);
    }
  }
  registerPlugin(pluginType) {
    this.pluginTypes.push(pluginType);
    if (this.initialized)
      this.createPlugin(pluginType);
  }
}
export const pluginManager = new PluginManager();
