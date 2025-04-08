import { post } from "api/apiRequest";
import { snakelize } from "lib/utility/caseConverter";
import {
  ConditionType,
  AutoSyncSettingsType,
  ProviderSyncObjects,
  SyncModeType,
} from "./contracts";
import { EntityType } from "features/Salesforce/API/Objects/contracts";

type MapSettingRequestType = {
  filters: { field_name: string; value: string }[];
  field_filters: null;
  interval: 7200;
  entity_type_name: EntityType;
  sync_mode: SyncModeType;
};

type EntityTypeNameToSyncConfigDictRequestType = {
  contact?: MapSettingRequestType;
  lead?: MapSettingRequestType;
  opportunity?: MapSettingRequestType;
  user?: MapSettingRequestType;
  campaign?: MapSettingRequestType;
  campaign_member?: MapSettingRequestType;
};

const getInitProviderSyncValue = (
  condition: ConditionType[] = [],
  autoSyncSettings: AutoSyncSettingsType
) => {
  return ProviderSyncObjects.map((entity) => ({
    filters: entity === "Contact" ? condition : [],
    fieldFilters: null,
    interval: 7200,
    entityTypeName: entity,
    syncMode:
      entity === autoSyncSettings.field
        ? autoSyncSettings.syncMode
        : "from-provider",
  })).reduce((acc, cur) => ({ ...acc, [cur.entityTypeName]: cur }), {});
};

export default async function postInitProviderTypesSync(
  providerName: string,
  condition: ConditionType[],
  autoSyncSettings: AutoSyncSettingsType
): Promise<void> {
  const data = snakelize(
    getInitProviderSyncValue(condition, autoSyncSettings)
  ) as EntityTypeNameToSyncConfigDictRequestType;
  return await post("/CrmHub/InitProviderTypesSync", {
    param: {
      provider_name: providerName,
      entity_type_name_to_sync_config_dict: {
        Contact: data.contact,
        Lead: data.lead,
        Opportunity: data.opportunity,
        User: data.user,
        Campaign: data.campaign,
        CampaignMember: data.campaign_member,
      },
    },
  });
}
