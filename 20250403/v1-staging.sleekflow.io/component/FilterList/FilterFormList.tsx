import React, { useEffect, useState } from "react";
import {
  Button,
  CheckboxProps,
  DropdownItemProps,
  DropdownProps,
  Form,
  Input,
  Checkbox,
} from "semantic-ui-react";
import { DropdownType } from "../../config/ContactTypeFieldMapping";
import { AudienceType } from "../../types/BroadcastCampaignType";
import moment from "moment";
import FilterValueInput from "./FilterValueInput";
import { useTranslation } from "react-i18next";
import { FilterConfigType } from "../../types/FilterConfigType";
import { FilterSelectionDropdownItemValueType } from "./FilterCondition";
import { SelectedValuesType } from "../../container/Contact/hooks/ContactsStateType";
import { ConditionNameType } from "../../config/ProfileFieldMapping";
import { useConditionFieldOperators } from "../Contact/Filter/useConditionFieldOperators";

export default FilterFormList;

function FilterFormList(props: {
  filter?: FilterConfigType;
  selectedOperator: string;
  applyFilter: (
    conditionOperator: string,
    value: FilterSelectionDropdownItemValueType
  ) => void;
  audience?: AudienceType;
  hasButton?: boolean;
  updateList?: (selectedValues: SelectedValuesType[]) => void;
}) {
  const {
    filter,
    selectedOperator,
    applyFilter,
    audience,
    hasButton = true,
    updateList = () => {},
  } = props;

  const [selectedSupportedOperator, setSelectedSupportOperator] = useState("");
  const [value, setTextValue] = useState<FilterSelectionDropdownItemValueType>(
    {}
  );
  const [tempVal, setTempVal] = useState("");
  const [type, setFieldType] = useState("");
  const [optionsVal, setOptionsVal] = useState<DropdownItemProps[]>();

  const { t } = useTranslation();
  const defaultOperators = ["Equals", "HigherThan", "LesserThan", "Contains"];
  const { getSupportedOperators } = useConditionFieldOperators();

  const supportedOperatorChoices =
    filter && filter.fieldType ? getSupportedOperators(filter.fieldType) : {};
  const supportedOperators = supportedOperatorChoices
    ? Object.keys(supportedOperatorChoices)
    : defaultOperators;

  useEffect(() => {
    if (filter && filter.fieldType) {
      setFieldType(filter.fieldType);

      if (
        DropdownType.includes(filter.fieldType.toLowerCase()) &&
        filter.fieldOptions
      ) {
        setOptionsVal(filter.fieldOptions);
      } else {
        if (filter.fieldType.toLowerCase() === "boolean") {
          setOptionsVal([
            {
              id: 1,
              value: "true",
              text: t("profile.field.type.boolean.true"),
            },
            {
              id: 2,
              value: "false",
              text: t("profile.field.type.boolean.false"),
            },
          ]);
        } else {
          setOptionsVal(undefined);
        }
      }
    }
    if (audience) {
      setTextValue({
        [audience.filterCondition.toLowerCase()]: audience.filterValue,
      });
      setSelectedSupportOperator(audience.filterCondition.toLowerCase());
    }
    if (selectedOperator) {
      setSelectedSupportOperator(selectedOperator.toLowerCase());
    }
  }, [filter, audience]);

  const handleRadioChange = (e: React.FormEvent, data: CheckboxProps) => {
    e.stopPropagation();
    if (data) {
      const selectedOperator = data.value as string;
      setSelectedSupportOperator(selectedOperator + "");
      setTextValue({});
      setTempVal("");
    }
  };

  const updateValue = (value: string) => {
    setTempVal(value);
  };

  const numberChanged = (numberVal: string, supportedOperator: string) => {
    let supportOperatorsVal: FilterSelectionDropdownItemValueType = value;
    if (selectedSupportedOperator !== supportedOperator) {
      supportOperatorsVal = {
        ...supportOperatorsVal,
        [selectedSupportedOperator.toLowerCase()]: [""],
      };
      setSelectedSupportOperator(supportedOperator);
    }
    supportOperatorsVal = {
      ...supportOperatorsVal,
      [supportedOperator]: [numberVal],
    };
    setTextValue(supportOperatorsVal);
    setTempVal(numberVal);
  };
  const updateFilterVal = (key: string) => {
    let supportOperatorsVal: FilterSelectionDropdownItemValueType = value;
    if (selectedSupportedOperator !== key) {
      supportOperatorsVal = {
        ...supportOperatorsVal,
        [selectedSupportedOperator.toLowerCase()]: [""],
      };
      setSelectedSupportOperator(key);
    }
    supportOperatorsVal = {
      ...supportOperatorsVal,
      [key]: [...(supportOperatorsVal[key] || []), tempVal],
    };
    setTextValue(supportOperatorsVal);
    setTempVal("");
  };

  useEffect(() => {
    if (Object.keys(value).length !== 0) {
      const operator = Object.keys(value)[0] as ConditionNameType;
      updateList([
        {
          operator,
          values: value[operator],
        },
      ]);
    }
  }, [value]);

  const dateChanged = (
    date: Date | null,
    e: any,
    supportedOperator: string
  ) => {
    if (date) {
      const dateStr = moment(date).toISOString(false);
      let supportOperatorsVal: FilterSelectionDropdownItemValueType = value;
      if (selectedSupportedOperator !== supportedOperator) {
        supportOperatorsVal = {
          ...supportOperatorsVal,
          [selectedSupportedOperator.toLowerCase()]: [""],
        };
        setSelectedSupportOperator(supportedOperator);
      }
      supportOperatorsVal = {
        ...supportOperatorsVal,
        [supportedOperator]: [dateStr],
      };
      setTextValue(supportOperatorsVal);
    }
  };

  const dropdownSelected = (
    e: React.SyntheticEvent,
    data: DropdownProps,
    supportedOperator: string
  ) => {
    const valArr = data.value as string[];
    let supportOperatorsVal: FilterSelectionDropdownItemValueType = value;
    if (selectedSupportedOperator !== supportedOperator) {
      supportOperatorsVal = {
        ...supportOperatorsVal,
        [selectedSupportedOperator.toLowerCase()]: [""],
      };
      setSelectedSupportOperator(supportedOperator);
    }
    supportOperatorsVal = {
      ...supportOperatorsVal,
      [supportedOperator]: valArr,
    };
    setTextValue(supportOperatorsVal);
  };
  const removeSelectedValues = (index: number, supportedOperator: string) => {
    value[supportedOperator].splice(index, 1);
    let supportOperatorsVal: FilterSelectionDropdownItemValueType = value;
    if (selectedSupportedOperator !== supportedOperator) {
      supportOperatorsVal = {
        ...supportOperatorsVal,
        [selectedSupportedOperator.toLowerCase()]: [""],
      };
      setSelectedSupportOperator(supportedOperator);
    }
    supportOperatorsVal = {
      ...supportOperatorsVal,
      [supportedOperator]: [...value[supportedOperator]],
    };
    setTextValue(supportOperatorsVal);
  };

  const applyFilterFunc = (e: React.MouseEvent) => {
    // which is the supported operator that already fill in some value in there
    applyFilter(selectedSupportedOperator, value);
    setSelectedSupportOperator("");
    setTextValue({});
  };
  //.ui.vertical.sidebar.menu.contact .add-filter .filter-condition .filter-content > .field > .selected-filter .add-text
  if (supportedOperators.length === 1) {
    let singleOperator = supportedOperators[0].toLowerCase();
    return (
      <Form className="filter-content single">
        <div className="field">
          <Input name="conditionGroup" type={"hidden"} value={singleOperator} />
          {((filter && filter.fieldType) || audience) && (
            <FilterValueInput
              supportedOperator={singleOperator}
              type={
                filter?.fieldType ?? audience?.fieldType ?? "singlelinetext"
              }
              value={value}
              setTextValue={setTextValue}
              filter={filter}
              dateChanged={dateChanged}
              dropdownSelected={dropdownSelected}
              numberChanged={numberChanged}
              optionsVal={optionsVal}
              tempVal={tempVal}
              updateValue={updateValue}
              removeSelectedValues={removeSelectedValues}
              updateFilterVal={updateFilterVal}
            />
          )}
        </div>
        {hasButton && (
          <Button
            content={t("profile.form.filter.action.apply")}
            onClick={applyFilterFunc}
            primary
          />
        )}
      </Form>
    );
  }
  const filterCreatedAtUpdatedAtOperator = (supportedOperator: string) => {
    return !(
      ["isnull", "isnotnull"].includes(supportedOperator.toLowerCase()) &&
      ["createdat", "updatedat"].includes(
        (filter?.fieldName ?? "").toLowerCase()
      )
    );
  };

  //multiple or single
  return (
    <Form className="filter-content">
      {" "}
      {supportedOperators
        .filter(filterCreatedAtUpdatedAtOperator)
        .map((supportedOperator, index) => {
          const lowerSupportOperator = supportedOperator.toLowerCase();
          if (
            lowerSupportOperator === "isknown" ||
            lowerSupportOperator === "isunknown"
          ) {
            return (
              <Form.Field
                key={selectedSupportedOperator + supportedOperator + index}
              >
                <Checkbox
                  label={
                    supportedOperatorChoices[supportedOperator] ??
                    supportedOperator
                  }
                  name="conditionGroup"
                  checked={
                    selectedSupportedOperator.toLowerCase() ===
                    supportedOperator.toLowerCase()
                  }
                  onChange={handleRadioChange}
                  value={lowerSupportOperator}
                />
              </Form.Field>
            );
          } else {
            return (
              <Form.Field
                key={selectedSupportedOperator + supportedOperator + index}
                id={`${selectedSupportedOperator + supportedOperator + index}`}
              >
                <Checkbox
                  label={
                    supportedOperatorChoices[supportedOperator] ??
                    supportedOperator
                  }
                  name="conditionGroup"
                  checked={
                    selectedSupportedOperator.toLowerCase() ===
                    lowerSupportOperator
                  }
                  onChange={handleRadioChange}
                  value={lowerSupportOperator}
                />
                {(filter || audience) &&
                  selectedSupportedOperator.toLowerCase() ===
                    lowerSupportOperator && (
                    <FilterValueInput
                      supportedOperator={supportedOperator}
                      numberChanged={numberChanged}
                      type={type}
                      value={value}
                      setTextValue={setTextValue}
                      filter={filter}
                      dateChanged={dateChanged}
                      dropdownSelected={dropdownSelected}
                      optionsVal={optionsVal}
                      tempVal={tempVal}
                      updateValue={updateValue}
                      removeSelectedValues={removeSelectedValues}
                      updateFilterVal={updateFilterVal}
                      key={`${
                        selectedSupportedOperator + supportedOperator + index
                      }_value`}
                    />
                  )}
              </Form.Field>
            );
          }
        })}
      {hasButton && (
        <Button
          content={t("profile.form.filter.action.apply")}
          primary
          onClick={applyFilterFunc}
        />
      )}
    </Form>
  );
}
