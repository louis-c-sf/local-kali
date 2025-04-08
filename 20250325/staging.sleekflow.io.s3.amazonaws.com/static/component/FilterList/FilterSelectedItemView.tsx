import React, { ReactNode } from "react";
import { Button } from "semantic-ui-react";

export function FilterSelectedItemView(props: {
  fieldDisplayName: string;
  filterDisplayName: string;
  filterDisplayValue: string | ReactNode[];
  fieldName: string;
  onClick: () => void;
  onDelete: () => void;
  className?: string;
}) {
  const {
    fieldDisplayName,
    fieldName,
    filterDisplayName,
    filterDisplayValue,
    onClick,
    onDelete,
    className,
  } = props;

  return (
    <div className={`filter-condition ${className ?? ""}`}>
      <div className="filter-content">
        <div className="filter-description" onClick={onClick}>
          {fieldDisplayName ? (
            <div className="filter-name">
              <div className="filter-name-wrap">
                {fieldDisplayName} {filterDisplayName}
              </div>{" "}
              <span className="contain-word">{filterDisplayValue}</span>
            </div>
          ) : (
            <div className="filter-name">#{fieldName}</div>
          )}
        </div>
        <Button icon="times" onClick={onDelete} />
      </div>
    </div>
  );
}
