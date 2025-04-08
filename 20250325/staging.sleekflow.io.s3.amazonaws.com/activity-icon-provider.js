import { h } from "@stencil/core";
import { ReadLineIcon } from "../components/icons/read-line-icon";
import { WriteLineIcon } from "../components/icons/write-line-icon";
import { IfIcon } from "../components/icons/if-icon";
import { ForkIcon } from "../components/icons/fork-icon";
import { JoinIcon } from "../components/icons/join-icon";
import { TimerIcon } from "../components/icons/timer-icon";
import { SendEmailIcon } from "../components/icons/send-email-icon";
import { HttpEndpointIcon } from "../components/icons/http-endpoint-icon";
import { SendHttpRequestIcon } from "../components/icons/send-http-request-icon";
import { ScriptIcon } from "../components/icons/script-icon";
import { LoopIcon } from "../components/icons/loop-icon";
import { BreakIcon } from "../components/icons/break-icon";
import { SwitchIcon } from "../components/icons/switch-icon";
import { WriteHttpResponseIcon } from "../components/icons/write-http-response";
import { RedirectIcon } from "../components/icons/redirect-icon";
import { EraseIcon } from "../components/icons/erase-icon";
import { CogIcon } from "../components/icons/cog-icon";
import { RunWorkflowIcon } from "../components/icons/run-workflow-icon";
import { SendSignalIcon } from "../components/icons/send-signal-icon";
import { SignalReceivedIcon } from "../components/icons/signal-received-icon";
import { FinishIcon } from "../components/icons/finish-icon";
import { InterruptTriggerIcon } from "../components/icons/interrupt-trigger-icon";
import { CorrelateIcon } from "../components/icons/correlate-icon";
import { StateIcon } from "../components/icons/state-icon";
import { WebhookIcon } from "../components/icons/webhook-icon";
export class ActivityIconProvider {
  constructor() {
    this.map = {
      'If': () => h(IfIcon, null),
      'Fork': () => h(ForkIcon, null),
      'Join': () => h(JoinIcon, null),
      'For': () => h(LoopIcon, null),
      'ForEach': () => h(LoopIcon, null),
      'While': () => h(LoopIcon, null),
      'ParallelForEach': () => h(LoopIcon, null),
      'Break': () => h(BreakIcon, null),
      'Switch': () => h(SwitchIcon, null),
      'SetVariable': () => h(CogIcon, null),
      'SetTransientVariable': () => h(CogIcon, null),
      'SetContextId': () => h(CogIcon, null),
      'Correlate': () => h(CorrelateIcon, null),
      'SetName': () => h(CogIcon, null),
      'RunWorkflow': () => h(RunWorkflowIcon, null),
      'Timer': () => h(TimerIcon, null),
      'StartAt': () => h(TimerIcon, null),
      'Cron': () => h(TimerIcon, null),
      'ClearTimer': () => h(EraseIcon, null),
      'SendSignal': () => h(SendSignalIcon, null),
      'SignalReceived': () => h(SignalReceivedIcon, null),
      'Finish': () => h(FinishIcon, null),
      'State': () => h(StateIcon, null),
      'InterruptTrigger': () => h(InterruptTriggerIcon, null),
      'RunJavaScript': () => h(ScriptIcon, null),
      'ReadLine': () => h(ReadLineIcon, null),
      'WriteLine': () => h(WriteLineIcon, null),
      'HttpEndpoint': () => h(HttpEndpointIcon, null),
      'SendHttpRequest': () => h(SendHttpRequestIcon, null),
      'WriteHttpResponse': () => h(WriteHttpResponseIcon, null),
      'Redirect': () => h(RedirectIcon, null),
      'SendEmail': () => h(SendEmailIcon, null),
      'Webhook': () => h(WebhookIcon, null),
      'RabbitMqMessageReceived': () => h(SignalReceivedIcon, null),
      'SendRabbitMqMessage': () => h(SendSignalIcon, null)
    };
  }
  register(activityType, icon) {
    this.map[activityType] = () => icon;
  }
  getIcon(activityType) {
    const provider = this.map[activityType];
    if (!provider)
      return undefined;
    return provider();
  }
}
export const activityIconProvider = new ActivityIconProvider();
