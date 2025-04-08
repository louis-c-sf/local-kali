import {
  AudienceFilterConditionType,
  AudienceType,
  isFilterHashtag,
  FIELD_TYPE_HASHTAG,
  isFilterCommon,
} from "../../types/BroadcastCampaignType";

export function fromApiCondition(
  condition: AudienceFilterConditionType
): AudienceType {
  if (isFilterHashtag(condition)) {
    return {
      fieldName: "hashtag",
      fieldType: FIELD_TYPE_HASHTAG,
      filterValue: condition?.containHashTag?.split(",") ?? [],
      filterCondition: "Contains",
    };
  } else if (isFilterCommon(condition)) {
    return {
      fieldName: condition.fieldName || "",
      fieldType: (condition.containHashTag && "hashtag") || "customField",
      filterValue: condition.values || [""],
      filterCondition: condition.conditionOperator || "Contains",
    };
  }
  throw { message: "Unexpected condition", condition: { ...condition } };
}
