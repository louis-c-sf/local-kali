import { getQueryMatcher } from "../../../../container/Settings/filters/getQueryMatcher";
import { FilterGroupFieldType } from "./FilterGroupFieldType";
import { useCallback, useState } from "react";
import { append, reject, remove, update as RUpdate } from "ramda";
import { matchesField } from "./matchesField";
import { ListTypeValue } from "../../../../container/Contact/hooks/ContactsStateType";
import { normalizeIndex } from "./FilterGroup";
import { useInitializeFilterField } from "./useInitializeFilterField";

export type FilterGroupCoreProps = {
  fields: FilterGroupFieldType[];
  searchText: string;
  appliedValues: ListTypeValue[];
  updateFields: (
    update: (selectedContactList: ListTypeValue[]) => ListTypeValue[]
  ) => void;
};

export function useFilterGroupCore(props: FilterGroupCoreProps) {
  const { appliedValues, updateFields, fields } = props;

  const [openedFields, setOpenedFields] = useState<string[]>([]);
  const { initializeFilterField } = useInitializeFilterField();

  const appliedValuesHash = JSON.stringify(appliedValues);
  const matchesSearch = getQueryMatcher(
    (g: FilterGroupFieldType) => `${g.displayName} ${g.fieldName}`
  );
  const fieldsDeduped = fields.reduce<FilterGroupFieldType[]>((acc, next) => {
    if (!acc.some((f) => f.fieldName === next.fieldName)) {
      return [...acc, next];
    }
    return acc;
  }, []);
  const fieldsVisible = [...fieldsDeduped];

  const openItem = useCallback(
    (field: FilterGroupFieldType) => {
      setOpenedFields(append(field.fieldName));
    },
    [setOpenedFields]
  );

  const closeItem = useCallback(
    (field: FilterGroupFieldType) => {
      setOpenedFields(reject((f) => f === field.fieldName));
    },
    [setOpenedFields]
  );

  const isOpened = useCallback(
    (field: FilterGroupFieldType) => openedFields.includes(field.fieldName),
    [openedFields.join()]
  );

  const removeCondition = useCallback(
    (fieldName: string, index: number) => {
      updateFields((appliedValues) => {
        const indexToRemove = normalizeIndex(appliedValues, fieldName, index);
        if (indexToRemove !== null) {
          return remove(indexToRemove, 1, appliedValues);
        }
        return appliedValues;
      });
    },
    [updateFields]
  );

  const isChecked = (field: FilterGroupFieldType) =>
    appliedValues.some(matchesField(field.fieldName));

  const updateField = useCallback(
    (value: ListTypeValue, index: number) => {
      updateFields((appliedValues) => {
        const existingIdx = normalizeIndex(
          appliedValues,
          value.fieldName,
          index
        );
        if (existingIdx !== null) {
          return RUpdate(existingIdx, { ...value }, appliedValues);
        }
        return appliedValues;
      });
    },
    [updateFields]
  );

  const appendCondition = useCallback(
    (value: ListTypeValue) => {
      return updateFields(append({ ...value }));
    },
    [updateFields]
  );

  const getFieldValues = useCallback(
    (f: FilterGroupFieldType) => {
      const values = appliedValues.filter(matchesField(f.fieldName));
      return values.length > 0 ? values : null;
    },
    [appliedValuesHash]
  );

  const toggleCheck = useCallback(
    (field: FilterGroupFieldType) => {
      updateFields((appliedValues) => {
        const fieldMatch = appliedValues.findIndex(
          matchesField(field.fieldName)
        );
        if (fieldMatch !== -1) {
          closeItem(field);
          return remove(fieldMatch, 1, appliedValues);
        }
        openItem(field);
        return [...appliedValues, initializeFilterField(field)];
      });
    },
    [openItem, closeItem]
  );

  const filtersCount = appliedValues.length;

  const fieldsActive = appliedValues.reduce<FilterGroupFieldType[]>(
    (acc, next) => {
      const field = fieldsVisible.find(matchesField(next.fieldName));
      if (field && !acc.some(matchesField(next.fieldName))) {
        return [...acc, field];
      }
      return acc;
    },
    []
  );
  const fieldsInactive = reject(isChecked, fieldsVisible);
  const fieldsSorted = [...fieldsActive, ...fieldsInactive];

  const reset = useCallback(() => {
    setOpenedFields([]);
  }, []);

  const isFieldVisible = useCallback(
    (field: FilterGroupFieldType) => {
      return matchesSearch(props.searchText)(field);
    },
    [props.searchText]
  );

  return {
    filtersCount,
    fieldsSorted,
    isFieldVisible,
    toggleCheck,
    getFieldValues,
    updateField,
    removeCondition,
    appendCondition,
    isChecked,
    openItem,
    closeItem,
    isOpened,
    reset,
  };
}
