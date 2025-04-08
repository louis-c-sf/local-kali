import DatePicker from "react-datepicker";
import moment from "moment";
import {
  Dropdown,
  DropdownProps,
  Form,
  Icon,
  Label,
  Radio,
} from "semantic-ui-react";
import { DropdownType } from "../../config/ContactTypeFieldMapping";
import React from "react";
import { useTranslation } from "react-i18next";
import { FilterSelectionDropdownItemValueType } from "./FilterCondition";

export default FilterValueInput;

export const DATE_FORMAT_MOMENT = "MM/DD/YYYY";
export const DATE_FORMAT_PICKER = "MM/dd/yyyy";

function FilterValueInput(props: {
  type: string;
  supportedOperator: string;
  filter: any;
  optionsVal: any;
  value: FilterSelectionDropdownItemValueType;
  setTextValue: (val: FilterSelectionDropdownItemValueType) => void;
  tempVal: any;
  dateChanged: (date: Date | null, e: any, supportedOperator: string) => void;
  updateValue: (value: string) => void;
  numberChanged: (value: string, supportedOperator: string) => void;
  dropdownSelected: (
    e: React.SyntheticEvent,
    data: DropdownProps,
    supportedOperator: string
  ) => void;
  updateFilterVal: any;
  removeSelectedValues: any;
}): JSX.Element {
  const {
    dateChanged,
    dropdownSelected,
    updateValue,
    setTextValue,
    updateFilterVal,
    removeSelectedValues,
    numberChanged,
    type,
    supportedOperator,
    filter,
    value,
    tempVal,
    optionsVal,
  } = props;
  const lowerSupportedOperator = supportedOperator.toLowerCase();
  const { t } = useTranslation();

  const toggleRadioChange = (e: React.FormEvent, key: string) => {
    e.stopPropagation();
    e.preventDefault();
    setTextValue({
      ...value,
      [key]: value[key].includes("true") ? ["false"] : ["true"],
    });
  };

  if (!filter) {
    return <></>;
  }

  if (
    lowerSupportedOperator === "isnotnull" ||
    lowerSupportedOperator === "isnull"
  ) {
    return <></>;
  }

  if (["datetime", "date"].includes(type)) {
    return (
      <DatePicker
        selected={
          (value[lowerSupportedOperator] &&
            moment(value[lowerSupportedOperator][0]).toDate()) ||
          ""
        }
        onChange={(date, e) => dateChanged(date, e, lowerSupportedOperator)}
        dateFormat={DATE_FORMAT_PICKER}
      />
    );
  } else if (type === "number") {
    return (
      <div className="selected-filter">
        <Form.Input
          type="number"
          value={tempVal || value[lowerSupportedOperator]}
          onChange={(e, data) =>
            numberChanged(data.value, lowerSupportedOperator)
          }
        />
      </div>
    );
  } else if (type === "boolean" && lowerSupportedOperator === "is") {
    return (
      <Radio
        toggle
        checked={value[lowerSupportedOperator].includes("true")}
        onChange={(e) => toggleRadioChange(e, lowerSupportedOperator)}
      />
    );
  } else if (
    optionsVal &&
    (DropdownType.includes(type.toLowerCase()) || type === "boolean")
  ) {
    return (
      <Dropdown
        upward={false}
        placeholder={t("profile.form.column.field.column.placeholder")}
        selection
        search
        multiple
        noResultsMessage={t("form.field.dropdown.noResults")}
        options={optionsVal}
        value={value[lowerSupportedOperator]}
        onChange={(e, data) =>
          dropdownSelected(e, data, lowerSupportedOperator)
        }
      />
    );
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.nativeEvent.code === "Enter" && tempVal) {
      e.preventDefault();
      e.stopPropagation();
      updateFilterVal(lowerSupportedOperator);
    }
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    updateValue(e.target.value);
  }

  function onClick(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    updateFilterVal(lowerSupportedOperator);
  }

  return (
    <div className="selected-filter">
      <div className="input-group">
        <input onKeyDown={onKeyDown} value={tempVal} onChange={onChange} />
        <span className="add-text" onClick={onClick}>
          {t("form.button.add")}
        </span>
      </div>
      <div className="selected-values">
        {(value[lowerSupportedOperator] || []).map(
          (valueLabel: string, index: number) => (
            <Label key={index}>
              {valueLabel}
              <Icon
                onClick={() =>
                  removeSelectedValues(index, lowerSupportedOperator)
                }
                name="delete"
              />
            </Label>
          )
        )}
      </div>
    </div>
  );
}
