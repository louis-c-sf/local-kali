import { createElsaWorkflowSettingsClient } from "../services/elsa-client";
import { eventBus } from "../../../services";
import { EventTypes } from "../../../models";
export class WorkflowSettingsPlugin {
  constructor(elsaStudio) {
    this.serverUrl = elsaStudio.serverUrl;
    eventBus.on(EventTypes.WorkflowRegistryLoadingColumns, this.onLoadingColumns);
    eventBus.on(EventTypes.WorkflowRegistryUpdating, this.onUpdating);
  }
  onLoadingColumns(context) {
    const headers = [["Enabled"]];
    const hasContextItems = true;
    context.data = { headers, hasContextItems };
  }
  async onUpdating(context) {
    const elsaClient = await createElsaWorkflowSettingsClient(this.serverUrl);
    const workflowSettings = await elsaClient.workflowSettingsApi.list();
    const workflowBlueprintSettings = workflowSettings.find(x => x.workflowBlueprintId == context.params[0] && x.key == context.params[1]);
    if (workflowBlueprintSettings != undefined)
      await elsaClient.workflowSettingsApi.delete(workflowBlueprintSettings.id);
    const request = {
      workflowBlueprintId: context.params[0],
      key: context.params[1],
      value: context.params[2]
    };
    await elsaClient.workflowSettingsApi.save(request);
    await eventBus.emit(EventTypes.WorkflowRegistryUpdated, this);
  }
}
