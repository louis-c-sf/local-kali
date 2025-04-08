import React from "react";
import { Table } from "semantic-ui-react";
import { Filter } from "./Filter/Filter";
import GridDummy from "../../../component/shared/Placeholder/GridDummy";
import { TableView } from "../layouts/TableView";

export function ObjectsGridDummy(props: { title: string }) {
  return (
    <TableView
      title={props.title}
      loading={false}
      filter={<Filter disabled={true} />}
      table={
        <Table>
          <GridDummy
            loading
            columnsNumber={8}
            hasCheckbox={false}
            rowSteps={15}
          />
        </Table>
      }
      pagination={null}
    />
  );
}
