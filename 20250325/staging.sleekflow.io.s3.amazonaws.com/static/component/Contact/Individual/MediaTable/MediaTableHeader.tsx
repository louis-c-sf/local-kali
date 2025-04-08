import React from "react";
import { useTranslation } from "react-i18next";
import { Checkbox, Table } from "semantic-ui-react";
import styles from "../ProfileMediaContent.module.css";

const MediaTableHeader = (props: {
  selectAll: () => void;
  isLoading: boolean;
  filesLen: number;
  selectedFilesLen: number;
  columns: string[];
  extraColumns: string[];
}) => {
  const {
    selectAll,
    isLoading,
    filesLen,
    selectedFilesLen,
    columns,
    extraColumns,
  } = props;

  return (
    <Table.Header>
      <Table.Row verticalAlign="middle">
        <Table.HeaderCell key="cellCheckbox">
          <div className={styles.checkboxWrap}>
            <Checkbox
              checked={filesLen > 0 && filesLen === selectedFilesLen}
              disabled={isLoading}
              onClick={!isLoading ? selectAll : undefined}
            />
          </div>
        </Table.HeaderCell>
        {columns.map((column, index) => (
          <Table.HeaderCell key={`cell-main-${index}`}>
            {column}{" "}
          </Table.HeaderCell>
        ))}
        {extraColumns.map((colum, index) => (
          <Table.HeaderCell key={`cell-extra-${index}`}></Table.HeaderCell>
        ))}
      </Table.Row>
    </Table.Header>
  );
};
export default MediaTableHeader;
