import React, { useContext, useCallback } from "react";
import { ListTypeValue } from "../../../../container/Contact/hooks/ContactsStateType";
import {
  LIST_FIELD_NAME,
  HASHTAG_FIELD_NAME,
} from "../../../../config/ProfileFieldMapping";
import { ListsIdFilterInput } from "./FilterInput/ListsIdFilterInput";
import { TagFilterInput } from "./FilterInput/TagFilterInput";
import { CustomFilterInput } from "./FilterInput/CustomFilterInput";
import { FilterGroupContext } from "./FilterGroupContext";
import {
  FilterGroupFieldType,
  UpdateIndexedValueInterface,
} from "./FilterGroupFieldType";

export function FilterField(props: {
  field: FilterGroupFieldType;
  value?: ListTypeValue;
  update: UpdateIndexedValueInterface;
  index: number;
  checked: boolean;
}) {
  const { update, field, value, index } = props;
  const { tagsAvailable, getFieldErrors, isErrorsVisible } =
    useContext(FilterGroupContext);

  const errors = isErrorsVisible
    ? getFieldErrors(field.fieldName, index)
    : undefined;

  const updateByIndex = useCallback(
    (value: ListTypeValue) => {
      update(value, index);
    },
    [update]
  );

  if (field.fieldName === HASHTAG_FIELD_NAME) {
    return (
      <TagFilterInput
        field={field}
        value={value}
        update={updateByIndex}
        tagsAvailable={tagsAvailable}
        errors={errors}
        checked={props.checked}
      />
    );
  }

  if (field.fieldName === LIST_FIELD_NAME) {
    return (
      <ListsIdFilterInput
        value={value}
        update={updateByIndex}
        errors={errors}
      />
    );
  }

  return (
    <CustomFilterInput
      update={updateByIndex}
      value={value}
      field={field}
      errors={errors}
      checked={props.checked}
    />
  );
}
