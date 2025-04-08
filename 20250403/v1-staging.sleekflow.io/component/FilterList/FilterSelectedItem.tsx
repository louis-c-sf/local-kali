import React, { ReactNode, useContext } from "react";
import { AudienceType } from "../../types/BroadcastCampaignType";
import BroadcastContext from "../Broadcast/BroadcastContext";
import { useTranslation } from "react-i18next";
import { FilterConfigType } from "../../types/FilterConfigType";
import moment from "moment";
import { DATE_FORMAT_MOMENT } from "./FilterValueInput";
import { FilterSelectedItemView } from "./FilterSelectedItemView";
import { useConditionFieldOperators } from "../Contact/Filter/useConditionFieldOperators";

export default function FilterSelectedItem(props: {
  audience: AudienceType;
  index: number;
  updateSelectedItem: Function;
  type: string;
  filterList: FilterConfigType[];
  deleteFilter?: Function;
}) {
  const {
    audience,
    index,
    updateSelectedItem,
    type,
    filterList,
    deleteFilter,
  } = props;
  const { filterValue, filterCondition, fieldName } = audience;
  const { audienceTypes, broadcastDispatch } = useContext(BroadcastContext);
  let fieldDisplayName = "";
  let fieldValueType = "";
  let filterDisplayName = "";
  const { t } = useTranslation();
  const { getSupportedOperators } = useConditionFieldOperators();

  let filterDisplayValue: string | ReactNode[] = filterValue ?? "?";
  let singleValueRaw = filterValue.slice(0).shift() ?? "";

  const filterAppliedConfig = filterList.find(
    (filter) =>
      filter.fieldName === fieldName || filter.fieldDisplayName === fieldName
  );

  if (fieldName === "importfrom" || !filterAppliedConfig) {
    return null;
  }

  fieldDisplayName = (filterAppliedConfig.fieldDisplayName as string) || "";
  fieldValueType = filterAppliedConfig.fieldType || "";

  if (
    Array.isArray(filterValue) &&
    filterAppliedConfig.fieldOptions !== undefined
  ) {
    let valueNames = filterValue.map((value: any) => {
      let defaultDisplayValue = value.toString();

      if (!filterAppliedConfig.fieldOptions) {
        return defaultDisplayValue;
      }
      const option = filterAppliedConfig.fieldOptions.find(
        (optionConfig) => optionConfig.value === value
      );

      if (option === undefined || option.text === undefined) {
        return defaultDisplayValue;
      }

      return option.text;
    });
    if (fieldValueType.toLowerCase() === "boolean") {
      filterDisplayValue =
        singleValueRaw.toLowerCase() === "true"
          ? t("profile.field.type.boolean.true")
          : t("profile.field.type.boolean.false");
    } else if (["date", "datetime"].includes(fieldValueType.toLowerCase())) {
      filterDisplayValue = filterDisplayValue
        ? moment(singleValueRaw).format(DATE_FORMAT_MOMENT)
        : "";
    } else {
      filterDisplayValue = [...valueNames];
    }
  }

  if (filterAppliedConfig.fieldType) {
    const filterDisplayName = getSupportedOperators(
      filterAppliedConfig.fieldType
    )[filterCondition.toLowerCase()];

    if (
      filterDisplayName === "is known" ||
      filterDisplayName === "is unknown"
    ) {
      filterDisplayValue = "";
    }
  }

  const handleAudienceTypeCounter = () => {
    if (deleteFilter) {
      deleteFilter(index);
    }
    broadcastDispatch({
      type: "UPDATE_FILTER",
      audienceTypes: audienceTypes?.filter((_, id) => id !== index),
    });
  };

  const filterItemClick = () => {
    updateSelectedItem(audience);
  };

  return (
    <FilterSelectedItemView
      onClick={filterItemClick}
      onDelete={handleAudienceTypeCounter}
      fieldName={fieldName}
      fieldDisplayName={fieldDisplayName}
      filterDisplayName={filterDisplayName}
      filterDisplayValue={filterDisplayValue}
    />
  );
}
