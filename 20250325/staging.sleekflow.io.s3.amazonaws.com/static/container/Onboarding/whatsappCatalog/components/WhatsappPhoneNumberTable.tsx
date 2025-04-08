import React from "react";
import { Table } from "semantic-ui-react";
import styles from "./WhatsappPhoneNumberTable.module.css";

export default function WhatsappPhoneNumberTable(props: {
  headerTexts: React.ReactNode[];
  bodyRows: (string | React.ReactNode)[][];
}) {
  const { headerTexts, bodyRows } = props;
  return (
    <Table basic={"very"}>
      <Table.Header>
        <Table.Row>
          {headerTexts.map((text, index) => (
            <Table.HeaderCell key={index} className={styles.headerCell}>
              {text}
            </Table.HeaderCell>
          ))}
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {bodyRows.map((bodyCell, rIndex) => (
          <Table.Row key={rIndex}>
            {bodyCell.map((text, cIndex) => (
              <Table.Cell className={styles.bodyCell} key={cIndex}>
                {text}
              </Table.Cell>
            ))}
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
}
