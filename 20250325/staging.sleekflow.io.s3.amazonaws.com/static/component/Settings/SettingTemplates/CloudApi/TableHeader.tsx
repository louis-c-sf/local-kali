import { useTranslation } from "react-i18next";
import { Table } from "semantic-ui-react";
import React from "react";

export default function TableHeader() {
  const { t } = useTranslation();
  return (
    <Table.Header>
      <Table.Row>
        <Table.HeaderCell className={"checkbox"} />
        <Table.HeaderCell>
          {t("settings.templates.grid.header.name")}
        </Table.HeaderCell>
        <Table.HeaderCell>
          {t("settings.templates.grid.header.messageText")}
        </Table.HeaderCell>
        <Table.HeaderCell>
          {t("settings.templates.grid.header.category")}
        </Table.HeaderCell>
        <Table.HeaderCell>
          {t("settings.templates.grid.header.buttonType")}
        </Table.HeaderCell>
        <Table.HeaderCell>
          {t("settings.templates.grid.header.language")}
        </Table.HeaderCell>
        <Table.HeaderCell>
          {t("settings.templates.grid.header.status")}
        </Table.HeaderCell>
      </Table.Row>
    </Table.Header>
  );
}
