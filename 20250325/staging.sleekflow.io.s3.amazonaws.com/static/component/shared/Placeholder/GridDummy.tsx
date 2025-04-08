import React from "react";
import { Checkbox, Placeholder, Table } from "semantic-ui-react";
import styles from "./GridDummy.module.css";

function GridDummy(props: {
  loading: boolean;
  columnsNumber: number;
  hasCheckbox: boolean;
  rowSteps?: number;
  renderHeader?: () => JSX.Element;
  renderBody?: () => JSX.Element;
}) {
  let columnsNumber = props.columnsNumber;
  if (props.hasCheckbox) {
    columnsNumber = columnsNumber - 1;
  }
  let rowSteps = Math.min(Math.abs(props.rowSteps ?? 10), 30);

  return (
    <>
      {props.renderHeader ? (
        props.renderHeader()
      ) : (
        <Table.Header>
          <Table.Row>
            {props.hasCheckbox && (
              <Table.HeaderCell className={"checkbox"} key={1}>
                <div className="checkbox">
                  <div className="checkbox-wrap">
                    <Checkbox disabled />
                  </div>
                </div>
              </Table.HeaderCell>
            )}
            {Array(columnsNumber)
              .fill(0)
              .map((_, i) => (
                <Table.HeaderCell key={`h${i}`} className={styles.th}>
                  <Placeholder>
                    <Placeholder.Line length={"short"} />
                  </Placeholder>
                </Table.HeaderCell>
              ))}
          </Table.Row>
        </Table.Header>
      )}
      {props.renderBody ? (
        props.renderBody()
      ) : (
        <Table.Body>
          {Array(rowSteps)
            .fill(1)
            .map((_, i) => (
              <Table.Row style={{ opacity: (rowSteps - i) / 10 }} key={i}>
                {props.hasCheckbox && (
                  <Table.Cell className={"checkbox"} key={"000"}>
                    <div className="checkbox-wrap">
                      <Checkbox disabled />
                    </div>
                  </Table.Cell>
                )}
                {Array(columnsNumber)
                  .fill(0)
                  .map((_, j) => (
                    <Table.Cell key={j} className={styles.td}>
                      <Placeholder>
                        <Placeholder.Line length={"full"} />
                      </Placeholder>
                    </Table.Cell>
                  ))}
              </Table.Row>
            ))}
        </Table.Body>
      )}
    </>
  );
}

export default GridDummy;
