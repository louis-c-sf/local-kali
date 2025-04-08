import React, { SyntheticEvent, useCallback } from "react";
import { FilterConfigType } from "../../../../../types/FilterConfigType";
import { ListTypeValue } from "../../../../../container/Contact/hooks/ContactsStateType";
import DatePicker from "react-datepicker";
import moment from "moment";
import { DropdownType } from "../../../../../config/ContactTypeFieldMapping";
import { DATE_FORMAT_PICKER } from "../../../../FilterList/FilterValueInput";
import produce from "immer";
import { useTranslation } from "react-i18next";
import { TextInput } from "../../../../shared/form/field/TextInput";
import { RadioInput } from "../../../../shared/input/RadioInput";
import { CheckboxProps } from "semantic-ui-react/dist/commonjs/modules/Checkbox/Checkbox";
import styles from "./CustomFilterInputView.module.css";
import { Dropdown } from "semantic-ui-react";
import { DropdownProps } from "semantic-ui-react/dist/commonjs/modules/Dropdown/Dropdown";
import { UpdateValueInterface } from "../FilterGroupFieldType";

export function CustomFilterInputView(props: {
  fieldConfig: FilterConfigType;
  value: ListTypeValue;
  update: UpdateValueInterface;
}) {
  const { fieldConfig, value, update } = props;

  const { fieldType } = fieldConfig;
  const fieldTypeLC = fieldType?.toLowerCase();
  const { t } = useTranslation();

  const {
    selectedValue: { values },
  } = value;
  const valuesNormalized = Array.isArray(values)
    ? [...values]
    : values === undefined
    ? []
    : [values];
  const [firstValue] = valuesNormalized;

  function updateValue(val: string) {
    update(
      produce(value, (draft) => {
        draft.selectedValue.values = [val];
      })
    );
  }

  function updateValues(values: string[]) {
    update(
      produce(value, (draft) => {
        draft.selectedValue.values = values;
      })
    );
  }

  const handleDateChanged = useCallback(
    (date: Date | null) => {
      if (date) {
        const dateStr = moment(date).toISOString(false);
        updateValue(dateStr);
      }
    },
    [updateValue]
  );

  const handleDropdownSelect = useCallback(
    (event: React.SyntheticEvent<HTMLElement>, data: DropdownProps) => {
      updateValues(data.value as string[]);
    },
    [updateValues]
  );

  if (fieldTypeLC && ["datetime", "date"].includes(fieldTypeLC)) {
    let momentValue = firstValue !== undefined ? moment(firstValue) : undefined;

    return (
      <DatePicker
        selected={momentValue?.isValid() ? momentValue.toDate() : undefined}
        onChange={handleDateChanged}
        dateFormat={DATE_FORMAT_PICKER}
      />
    );
  } else if (fieldTypeLC === "number") {
    return (
      <div className="selected-filter">
        <TextInput type="number" value={firstValue} onChange={updateValue} />
      </div>
    );
  } else if (fieldTypeLC === "boolean") {
    const handleBooleanCheck = (_: SyntheticEvent, data: CheckboxProps) => {
      updateValue(data.value as string);
    };
    return (
      <>
        <div className={`${styles.input} ${styles.radio}`}>
          <RadioInput
            toggle
            checked={firstValue?.includes("true")}
            onChange={handleBooleanCheck}
            value={"true"}
            label={"True"}
          />
          <RadioInput
            toggle
            checked={firstValue?.includes("false")}
            onChange={handleBooleanCheck}
            value={"false"}
            label={"False"}
          />
        </div>
      </>
    );
  } else if (
    fieldConfig.fieldOptions &&
    DropdownType.includes(fieldTypeLC ?? "")
  ) {
    return (
      <Dropdown
        onChange={handleDropdownSelect}
        upward={false}
        placeholder={t("profile.form.column.field.column.placeholder")}
        selection
        search
        multiple
        fluid
        noResultsMessage={t("form:field.dropdown.noResults")}
        options={fieldConfig.fieldOptions}
        value={valuesNormalized}
      />
    );
  }
  //default plaintext case
  const dropdownValues = (values ?? []).map((v, i) => ({
    value: v,
    text: v,
    key: i,
  }));

  return (
    <Dropdown
      onChange={handleDropdownSelect}
      value={values}
      allowAdditions
      placeholder={t("common:form.prompt.typeToAddEntries")}
      noResultsMessage={t("common:form.prompt.typeToAddEntries")}
      multiple
      selection
      fluid
      search
      options={dropdownValues}
    />
  );
}
