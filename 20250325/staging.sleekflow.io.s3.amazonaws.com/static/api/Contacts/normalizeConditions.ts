import {
  AudienceType,
  AudienceFilterConditionType,
} from "../../types/BroadcastCampaignType";
import { HashTagCountedType } from "../../types/ConversationType";
import { toApiCondition } from "./toApiCondition";
import { partition } from "ramda";
import {
  ConditionNameType,
  HASHTAG_FIELD_NAME,
} from "../../config/ProfileFieldMapping";

export function normalizeConditions(
  filters: AudienceType[],
  tags: HashTagCountedType[],
  listIds: string[],
  collaboratorIds: string[],
  utcOffset: number,
  tagOperator: ConditionNameType,
  listOperator: ConditionNameType,
  collaboratorOperator: ConditionNameType
): AudienceFilterConditionType[] {
  let tagsConditions: AudienceFilterConditionType[] = [];

  const [commonFilters, tagFilters] = partition((f) => {
    return f.fieldName !== HASHTAG_FIELD_NAME;
  }, filters);

  if (tags.length > 0) {
    tagsConditions = [
      {
        containHashTag: "hashtags",
        conditionOperator: tagOperator,
        values: tags.map((tag) => tag.hashtag),
        nextOperator: "And",
      },
    ];
  }
  tagsConditions = tagFilters.reduce((acc, next) => {
    return [
      ...acc,
      {
        containHashTag: "hashtags",
        conditionOperator: next.filterCondition,
        values: [...next.filterValue],
        nextOperator: "Or",
      },
    ];
  }, tagsConditions);

  let listConditions: AudienceFilterConditionType[] = [];
  if (listIds.length > 0) {
    listConditions = [
      {
        conditionOperator: listOperator,
        fieldName: "importFrom",
        nextOperator: "And",
        values: listIds,
      },
    ];
  }

  let collaboratorConditions: AudienceFilterConditionType[] = [];
  if (collaboratorIds.length > 0) {
    collaboratorConditions = [
      {
        fieldName: "collaborators",
        conditionOperator: collaboratorOperator,
        values: collaboratorIds,
        nextOperator: "And",
      },
    ];
  }
  return [
    ...commonFilters.reduce<AudienceFilterConditionType[]>((acc, filter) => {
      const normalized = toApiCondition(filter);
      if (normalized) {
        return acc.concat(normalized);
      }
      return acc;
    }, []),
    ...tagsConditions,
    ...listConditions,
    ...collaboratorConditions,
  ];
}
