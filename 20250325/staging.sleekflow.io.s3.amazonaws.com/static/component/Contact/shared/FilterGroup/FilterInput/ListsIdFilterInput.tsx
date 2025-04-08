import React, { useContext, useMemo } from "react";
import SingleCondition from "../Condition/SingleCondition";
import { useTranslation } from "react-i18next";
import {
  LIST_FIELD_NAME,
  ConditionNameType,
} from "../../../../../config/ProfileFieldMapping";
import { FilterGroupContext } from "../FilterGroupContext";
import { FieldError } from "../../../../shared/form/FieldError";
import { Dropdown, DropdownProps } from "semantic-ui-react";
import { ValueAwareInterface } from "../FilterGroupFieldType";

export const ListsIdFilterInput = (props: ValueAwareInterface) => {
  const { value, update, errors } = props;
  const { listsAvailable } = useContext(FilterGroupContext);
  const { t } = useTranslation();

  const listsOptions = useMemo(
    () =>
      listsAvailable.map((list) => ({
        value: String(list.id),
        text: list.importName,
        key: list.id,
      })),
    [JSON.stringify(listsAvailable)]
  );
  const listConditionChoices = useMemo(
    () => ({
      ContainsAny: t("profile.condition.list.ContainsAnyOr"),
      ContainsAll: t("profile.condition.list.ContainsAllAnd"),
    }),
    []
  );

  const updateConditionOperator = (operator: ConditionNameType) => {
    if (!value) {
      return update({
        selectedValue: { operator, values: [] },
        fieldName: LIST_FIELD_NAME,
      });
    }
    update({
      ...value,
      selectedValue: { ...value.selectedValue, operator },
    });
  };

  const updateValue = (event: any, data: DropdownProps) => {
    if (!value) {
      return;
    }
    update({
      ...value,
      selectedValue: {
        ...value.selectedValue,
        values: data.value as string[],
      },
    });
  };

  return (
    <>
      <SingleCondition
        updateConditionOperator={updateConditionOperator}
        conditionOperator={value?.selectedValue.operator}
        choices={listConditionChoices}
      >
        <>
          {value && (
            <Dropdown
              fluid
              search
              value={value.selectedValue.values}
              onChange={updateValue}
              options={listsOptions}
              multiple
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
