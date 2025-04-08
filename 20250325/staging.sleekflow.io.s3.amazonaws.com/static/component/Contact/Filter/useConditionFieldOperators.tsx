import { useConditionNameLocale } from "../locaizable/useConditionNameLocale";
import {
  ConditionNameType,
  LIST_FIELD_NAME,
  HASHTAG_FIELD_NAME,
} from "../../../config/ProfileFieldMapping";

export function useConditionFieldOperators() {
  const { conditionNameMap } = useConditionNameLocale();

  function getSupportedOperators(fieldType: string): {
    [k in ConditionNameType]?: string;
  } {
    return conditionNameMap[fieldType.toLowerCase()] ?? {};
  }

  function canHaveMultipleConditions(fieldName: string, fieldType: string) {
    const forbiddenList = [
      LIST_FIELD_NAME,
      HASHTAG_FIELD_NAME,
      "collaborators",
    ];
    if (forbiddenList.includes(fieldName.toLowerCase())) {
      return false;
    }
    const operatorsCount = getSupportedOperators(fieldType);
    return Object.keys(operatorsCount).length >= 2;
  }

  return {
    getSupportedOperators,
    canHaveMultipleConditions,
  };
}
