import React, { useState, memo, useContext, useEffect } from "react";
import styles from "./FilterGroup.module.css";
import { ListTypeValue } from "../../../../container/Contact/hooks/ContactsStateType";

import { SearchInput } from "../../../shared/input/SearchInput";
import { FilterGroupItem } from "./FilterGroupItem";
import { FilterGroupContext } from "./FilterGroupContext";
import { useTranslation } from "react-i18next";
import { FilterGroupFieldType } from "./FilterGroupFieldType";
import { matchesField } from "./matchesField";
import { useFilterGroupCore } from "./useFilterGroupCore";
import equals from "fast-deep-equal";

export function normalizeIndex(
  values: ListTypeValue[],
  fieldName: string,
  denormalizedIndex: number
): number | null {
  return getIndicesMap(values, fieldName)[denormalizedIndex] ?? null;
}

function getIndicesMap(values: ListTypeValue[], fieldName: string) {
  return values.reduce<number[]>((acc, next, idx) => {
    if (matchesField(fieldName)(next)) {
      return [...acc, idx];
    }
    return acc;
  }, []);
}

export function FilterGroup(props: {
  header: string;
  fields: FilterGroupFieldType[];
  appliedValues: ListTypeValue[];
  updateFields: (update: (values: ListTypeValue[]) => ListTypeValue[]) => void;
}) {
  const { fields, header, updateFields, appliedValues } = props;
  const { visible } = useContext(FilterGroupContext);

  const [searchText, setSearchText] = useState("");

  const { t } = useTranslation();

  const core = useFilterGroupCore({
    updateFields,
    appliedValues,
    fields,
    searchText,
  });

  useEffect(() => {
    if (!visible) {
      core.reset();
      setSearchText("");
    }
  }, [visible]);

  return (
    <div className={styles.group}>
      <div className={styles.header}>
        <div className={styles.text}>
          <div>{header}</div>
          {core.filtersCount > 0 && (
            <div className={styles.counter}>
              {t("profile.contacts.sidebar.header.filtersCount", {
                count: core.filtersCount,
              })}
            </div>
          )}
        </div>
      </div>
      <div className={styles.groupCurtain}>
        <div className={styles.fields}>
          <div>
            <SearchInput
              onChange={(event) => setSearchText(event.target.value)}
              hasQuery={searchText !== ""}
              loading={false}
              reset={() => setSearchText("")}
              query={searchText}
            />
          </div>
          {core.fieldsSorted.map((field) => (
            <FilterGroupItemMemo
              key={field.fieldName}
              field={field}
              onCheck={core.toggleCheck}
              values={core.getFieldValues(field)}
              update={core.updateField}
              remove={core.removeCondition}
              append={core.appendCondition}
              checked={core.isChecked(field)}
              onOpen={core.openItem}
              onClose={core.closeItem}
              opened={core.isOpened(field)}
              visible={core.isFieldVisible(field)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

const FilterGroupItemMemo = memo(FilterGroupItem, (prev, next) => {
  function getPropsToCompare(p: Parameters<typeof FilterGroupItem>[0]) {
    return {
      v: p.values,
      f: p.field,
      o: p.opened,
      c: p.checked,
      vis: p.visible,
    };
  }

  // re-render only uncollapsed filters
  const isVisible =
    next.opened ||
    prev.opened ||
    prev.checked ||
    next.checked ||
    next.visible ||
    prev.visible;
  const meaningfulPropsChanged = !equals(
    getPropsToCompare(prev),
    getPropsToCompare(next)
  );
  return isVisible ? !meaningfulPropsChanged : true;
});
