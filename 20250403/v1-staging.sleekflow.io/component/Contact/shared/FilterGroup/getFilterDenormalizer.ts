import { AudienceType } from "../../../../types/BroadcastCampaignType";
import { HashTagType } from "../../../../types/ConversationType";
import {
  HASHTAG_FIELD_NAME,
  LIST_FIELD_NAME,
  ConditionNameType,
} from "../../../../config/ProfileFieldMapping";

export function denormalizeFieldFilters(values: AudienceType[]) {
  return values.map((f) => ({
    fieldName: f.fieldName,
    selectedValue: {
      operator: f.filterCondition as ConditionNameType,
      values: [...f.filterValue],
    },
  }));
}

export function denormalizeHashtagFilters(
  values: HashTagType[],
  operator: ConditionNameType
) {
  return {
    fieldName: HASHTAG_FIELD_NAME,
    selectedValue: {
      operator: operator,
      values: [...values.map((t) => t.hashtag)],
    },
  };
}

export function denormalizeListFilters(
  values: string[],
  operator: ConditionNameType
) {
  return {
    fieldName: LIST_FIELD_NAME,
    selectedValue: { operator: operator, values: [...values] },
  };
}
