import { EntityType } from "features/Salesforce/API/Objects/contracts";

export type ProviderType = "salesforce-integrator" | "hubspot-integrator";

export const ProviderSyncObjects = [
  "User",
  "Contact",
  "Lead",
  "Opportunity",
  "Campaign",
  "CampaignMember",
];

export type ProviderFieldsType = {
  calculated: boolean;
  compoundFieldName: string;
  createable: boolean;
  custom: boolean;
  encrypted: boolean;
  label: string;
  length?: number;
  name: string;
  picklistValues: [];
  soapType: string;
  type: string;
  unique: false;
  updateable: true;
};

export type UnifyRuleType = {
  fieldName: string;
  strategy: "time";
  providerPrecedences: string[];
  isSystem: boolean;
};

export type MapUserType = {
  id: string;
  name: string;
  image?: string;
  team?: string;
  salesforceUser?: string;
};

export type ConditionType = {
  fieldName: string;
  value: string;
  type?: string;
};

export type SyncModeType =
  | "from-provider"
  | "to-provider"
  | "no-sync"
  | "two-way-sync";

export type AutoSyncSettingsType = {
  syncMode: SyncModeType;
  field: string;
};

type MapSettingType = {
  filters: { fieldName: string; value: string }[];
  interval: 7200;
  entity_type_name: EntityType;
  sync_mode: SyncModeType;
};

type EntityTypeNameToSyncConfigDictType = {
  Contact?: MapSettingType;
  Lead?: MapSettingType;
  Opportunity?: MapSettingType;
  User?: MapSettingType;
};
export interface CrmConfigType {
  id: string;
  sleekflow_company_id: string;
  key: string;
  provider_name: string;
  is_authenticated: boolean;
  entity_type_name_to_sync_config_dict: EntityTypeNameToSyncConfigDictType;
}
