import {
  AudienceType,
  AudienceFilterConditionType,
  FIELD_TYPE_HASHTAG,
  FIELD_TYPE_CAMPAIGN,
  BroadcastStatusType,
} from "../../types/BroadcastCampaignType";

export function toApiCondition(
  audienceType: AudienceType
): AudienceFilterConditionType | undefined {
  if (audienceType.fieldType?.toLowerCase() === FIELD_TYPE_HASHTAG) {
    return {
      containHashTag: audienceType.fieldName,
      nextOperator: "Or",
    };
  } else if (audienceType.fieldType === FIELD_TYPE_CAMPAIGN) {
    return {
      companyMessageTemplateId: audienceType.filterValue[0],
      broadcastMessageStatus: Number(
        audienceType.filterValue[1]
      ) as BroadcastStatusType,
    };
  } else if (audienceType.fieldName) {
    if (["createdat"].includes(audienceType.fieldName.toLowerCase())) {
      return {
        conditionOperator: audienceType.filterCondition,
        fieldName: audienceType.fieldName,
        values: audienceType.filterValue.map((val) => val),
        nextOperator: audienceType.nextOperator || "And",
      };
    }
    return {
      conditionOperator: audienceType.filterCondition,
      fieldName: audienceType.fieldName,
      values: audienceType.filterValue,
      nextOperator: audienceType.nextOperator || "And",
    };
  }
}
