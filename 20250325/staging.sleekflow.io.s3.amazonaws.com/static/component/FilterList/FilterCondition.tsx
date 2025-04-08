import React, { useEffect, useState } from "react";
import { AudienceType } from "../../types/BroadcastCampaignType";
import FilterFormList from "./FilterFormList";
import { FilterConfigType } from "../../types/FilterConfigType";
import { SelectedValuesType } from "../../container/Contact/hooks/ContactsStateType";

export interface FilterSelectionDropdownItemValueType {
  [key: string]: string[];
}

export default function FilterCondition(props: {
  audience?: AudienceType;
  filter?: FilterConfigType;
  index?: number;
  updateCondition?: (
    selectedCondition: string,
    selectedValue: string[],
    type: string,
    index?: number
  ) => void;
  isSelected: boolean;
  showName?: boolean;
  hasButton?: boolean;
  updateList?: (selectedValues: SelectedValuesType[]) => void;
}) {
  const {
    audience,
    filter,
    index,
    updateCondition = () => {},
    isSelected,
    showName = true,
    hasButton = true,
    updateList = () => {},
  } = props;
  const [selectedSupportedOperator, setSelectedSupportOperator] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    if (filter && filter.fieldType) {
      setName(
        (filter.fieldDisplayName && filter.fieldDisplayName) || filter.fieldName
      );
    }
    if (audience && filter) {
      setSelectedSupportOperator(audience.filterCondition.toLowerCase());
      if (filter) {
        setName(
          (filter.fieldDisplayName && filter.fieldDisplayName) ||
            filter.fieldName
        );
      }
    }
  }, [filter && filter.fieldName, audience]);

  const applyFilter = (
    selectedSupportedOperator: string,
    value: FilterSelectionDropdownItemValueType
  ) => {
    // which is the supported operator that already fill in some value in there
    updateCondition(
      selectedSupportedOperator,
      (value && value[selectedSupportedOperator]) ||
        (Object.keys(value).length > 0 && value) || [""],
      "customField",
      index
    );
  };

  return (
    <div
      className={`filter-condition${(isSelected && ` display`) || " hidden"}`}
    >
      {showName && <div className="filter-name">{name}</div>}

      <FilterFormList
        audience={audience}
        applyFilter={applyFilter}
        selectedOperator={selectedSupportedOperator}
        filter={filter}
        hasButton={hasButton}
        updateList={updateList}
      />
    </div>
  );
}
