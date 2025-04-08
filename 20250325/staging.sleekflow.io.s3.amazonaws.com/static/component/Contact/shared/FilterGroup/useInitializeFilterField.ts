import { ListTypeValue } from "../../../../container/Contact/hooks/ContactsStateType";
import {
  HASHTAG_FIELD_NAME,
  LIST_FIELD_NAME,
} from "../../../../config/ProfileFieldMapping";
import { FilterGroupFieldType } from "./FilterGroupFieldType";
import { keys } from "ramda";
import { useConditionFieldOperators } from "../../Filter/useConditionFieldOperators";

export function useInitializeFilterField() {
  const conditionOperators = useConditionFieldOperators();

  function initializeFilterField(field: FilterGroupFieldType): ListTypeValue {
    //todo difference is only in selected value
    const operators = conditionOperators.getSupportedOperators(field.fieldType);
    const [firstOperator] = keys(operators);

    if (!firstOperator) {
      throw new Error(
        `Missing field type: ${field.fieldName}/${field.fieldType}`
      );
    }

    if (field.fieldName === HASHTAG_FIELD_NAME) {
      return {
        fieldName: HASHTAG_FIELD_NAME,
        selectedValue: { values: [], operator: firstOperator },
      };
    } else if (field.fieldName === LIST_FIELD_NAME) {
      return {
        fieldName: LIST_FIELD_NAME,
        selectedValue: { values: [], operator: firstOperator },
      };
    } else if (field.fieldType === "range") {
      return {
        fieldName: field.fieldName,
        selectedValue: { values: ["0", "5000"], operator: firstOperator },
      };
    } else {
      return {
        fieldName: field.fieldName,
        selectedValue: { values: [], operator: firstOperator },
      };
    }
  }

  return {
    initializeFilterField,
  };
}
