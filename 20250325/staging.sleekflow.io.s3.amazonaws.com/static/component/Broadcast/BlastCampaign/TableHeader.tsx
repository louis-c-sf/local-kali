import { useTranslation } from "react-i18next";
import { Table, TableCellProps } from "semantic-ui-react";
import React from "react";

export function TableHeader(props: {
  selectAllCheckbox: boolean;
  hasResults: boolean;
  selectAll: () => void;
}) {
  const { t } = useTranslation();
  const headerCells: TableCellProps[] = [
    /*{
          key: "id",
          className: "checkbox",
          content: (
            <div className="checkbox-wrap">
              <Checkbox
                checked={props.selectAllCheckbox}
                disabled={!props.hasResults}
                label=""
                onClick={props.hasResults ? props.selectAll : undefined}
              />
            </div>
          ),
        },*/
    {
      key: "status",
      content: t("broadcast.blast.grid.columns.status.head"),
    },
    {
      key: "name",
      content: t("broadcast.blast.grid.columns.name.head"),
    },
    {
      key: "actions",
      content: " ",
    },
    {
      key: "sent",
      content: t("broadcast.blast.grid.columns.sent.head"),
    },
    {
      key: "delivered",
      content: t("broadcast.blast.grid.columns.delivered.head"),
    },
    {
      key: "channel",
      content: t("broadcast.blast.grid.columns.channel.head"),
    },
    {
      key: "sentAt",
      content: t("broadcast.blast.grid.columns.sentAt.head"),
    },
    {
      key: "deliveredAt",
      content: t("broadcast.blast.grid.columns.deliveredAt.head"),
    },
    {
      key: "createdBy",
      content: t("broadcast.blast.grid.columns.createdBy.head"),
    },
  ];
  return (
    <Table.Header>
      <Table.Row
        cellAs={(props: TableCellProps) => <Table.HeaderCell {...props} />}
        cells={headerCells}
      />
    </Table.Header>
  );
}
