import React, { ReactNode } from "react";
import { Header } from "semantic-ui-react";
import { useTranslation } from "react-i18next";
import { FilterConfigType } from "../../types/FilterConfigType";

export default FilterList;

function FilterList(props: {
  filterItemList: FilterConfigType[];
  conditionClick: Function;
  prepend: ReactNode;
}) {
  const { filterItemList, conditionClick } = props;
  const onClickItem = (fieldName: string) => {
    conditionClick(fieldName);
  };

  return (
    <div className="filter-content">
      <ul className={"filter-content-items"}>
        {props.prepend}
        {filterItemList.map((filterItem, index) => (
          <li
            key={`${filterItem.type}_${index}`}
            onClick={() => onClickItem(filterItem.fieldName)}
          >
            {filterItem.fieldDisplayName}
          </li>
        ))}
      </ul>
    </div>
  );
}
