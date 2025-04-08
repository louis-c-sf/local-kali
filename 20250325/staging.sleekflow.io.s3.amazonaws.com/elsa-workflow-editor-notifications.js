import { Component } from '@stencil/core';
import { eventBus, toastNotificationService } from '../../../../services';
import { EventTypes } from "../../../../models";
export class ElsaWorkflowEditorNotifications {
  constructor() {
    this.onWorkflowPublished = (workflowDefinition) => toastNotificationService.show('Workflow Published', `Workflow successfully published at version ${workflowDefinition.version}.`, 1500);
    this.onWorkflowRetracted = (workflowDefinition) => toastNotificationService.show('Workflow Retracted', `Workflow successfully retracted at version ${workflowDefinition.version}.`, 1500);
    this.onWorkflowImported = () => toastNotificationService.show('Workflow Imported', `Workflow successfully imported.`, 1500);
    this.onClipboardPermissionsDenied = () => toastNotificationService.show('Clipboard Error', `Clipboard pemission denied.`, 1500);
    this.onClipboardCopied = (title, body) => {
      toastNotificationService.show(title || 'Copy to Clipboard', body || 'Activities successfully copied to Clipboard.', 1500);
    };
  }
  connectedCallback() {
    eventBus.on(EventTypes.WorkflowPublished, this.onWorkflowPublished);
    eventBus.on(EventTypes.WorkflowRetracted, this.onWorkflowRetracted);
    eventBus.on(EventTypes.WorkflowImported, this.onWorkflowImported);
    eventBus.on(EventTypes.ClipboardPermissionDenied, this.onClipboardPermissionsDenied);
    eventBus.on(EventTypes.ClipboardCopied, this.onClipboardCopied);
  }
  disconnectedCallback() {
    eventBus.detach(EventTypes.WorkflowPublished, this.onWorkflowPublished);
    eventBus.detach(EventTypes.WorkflowRetracted, this.onWorkflowRetracted);
    eventBus.detach(EventTypes.WorkflowImported, this.onWorkflowImported);
    eventBus.detach(EventTypes.ClipboardPermissionDenied, this.onClipboardPermissionsDenied);
    eventBus.detach(EventTypes.ClipboardCopied, this.onClipboardCopied);
  }
  static get is() { return "elsa-workflow-definition-editor-notifications"; }
}
