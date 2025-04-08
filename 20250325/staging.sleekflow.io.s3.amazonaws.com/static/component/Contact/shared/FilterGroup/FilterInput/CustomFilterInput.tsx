import React from "react";
import { ConditionNameType } from "../../../../../config/ProfileFieldMapping";
import { useCustomFieldConfig } from "../useCustomFieldConfig";
import { CustomFilterInputView } from "./CustomFilterInputView";
import { FieldError } from "../../../../shared/form/FieldError";
import {
  FieldValueAwareInterface,
  ValueAwareInterface,
} from "../FilterGroupFieldType";
import { useConditionFieldOperators } from "../../../Filter/useConditionFieldOperators";
import SingleCondition from "../Condition/SingleCondition";

export const CustomFilterInput = (
  props: FieldValueAwareInterface & ValueAwareInterface
) => {
  const { value, update, field, errors } = props;

  const fieldConfig = useCustomFieldConfig({
    fieldName: field.fieldName,
    options: field.options,
    fieldType: field.fieldType,
    displayName: field.displayName,
  });

  const { getSupportedOperators } = useConditionFieldOperators();
  const supportedOperators = getSupportedOperators(field.fieldType);

  function getIsValueVisible(condition: ConditionNameType) {
    return !["IsNull", "IsNotNull"].includes(condition);
  }

  return (
    <>
      <SingleCondition
        conditionOperator={value?.selectedValue.operator}
        choices={supportedOperators}
        updateConditionOperator={(operator) => {
          update({
            fieldName: field.fieldName,
            selectedValue: {
              values: [...(value?.selectedValue.values ?? [])],
              operator: operator,
            },
          });
        }}
      >
        <>
          {value && getIsValueVisible(value.selectedValue.operator) && (
            <CustomFilterInputView
              fieldConfig={fieldConfig}
              value={value}
              update={update}
            />
          )}
          {errors && (
            <div>
              {errors.map((e, idx) => (
                <FieldError text={e} key={idx} />
              ))}
            </div>
          )}
        </>
      </SingleCondition>
    </>
  );
};
