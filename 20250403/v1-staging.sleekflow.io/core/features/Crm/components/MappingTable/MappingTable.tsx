import React, { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Table, Form } from "semantic-ui-react";
import iconStyles from "component/shared/Icon/Icon.module.css";
import styles from "./MappingTable.module.css";

export default function MappingTable<T>(props: {
  labelFrom: ReactNode | string;
  labelTo: ReactNode | string;
  data: T[];
  renderFieldFrom: (value: T, index: number) => ReactNode;
  renderFieldTo: (value: T, index: number) => ReactNode;
  handleDelete?: (item: T) => void;
}) {
  const { t } = useTranslation();
  const {
    labelFrom,
    labelTo,
    data,
    renderFieldFrom,
    renderFieldTo,
    handleDelete,
  } = props;

  return (
    <Form>
      <Table className={styles.table}>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell className={styles.tableHeaderCell} width={6}>
              {labelFrom}
            </Table.HeaderCell>
            <Table.HeaderCell
              width={1}
              textAlign="center"
              className={`${styles.tableHeaderCell}`}
            />
            <Table.HeaderCell className={styles.tableHeaderCell} width={6}>
              {labelTo}
            </Table.HeaderCell>
            {handleDelete && (
              <Table.HeaderCell
                width={1}
                textAlign="center"
                className={`${styles.tableHeaderCell}`}
              />
            )}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {data.map((item, index) => (
            <Table.Row key={index}>
              <Table.Cell>{renderFieldFrom(item, index)}</Table.Cell>
              <Table.Cell className={styles.symbolCell}>
                <i className={`${iconStyles.icon} ${styles.arrowIcon}`} />
              </Table.Cell>
              <Table.Cell>{renderFieldTo(item, index)}</Table.Cell>
              {handleDelete && (
                <Table.Cell className={styles.symbolCell}>
                  <div onClick={() => handleDelete(item)}>
                    <i className={`${iconStyles.icon} ${styles.crossIcon}`} />
                  </div>
                </Table.Cell>
              )}
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </Form>
  );
}
