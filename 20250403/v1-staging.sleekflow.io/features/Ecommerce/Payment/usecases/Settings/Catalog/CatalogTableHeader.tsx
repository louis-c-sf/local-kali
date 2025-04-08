import React from "react";
import { useTranslation } from "react-i18next";
import { Table } from "semantic-ui-react";
import styles from "./CatalogTab.module.css";

const CatalogTableHeader = () => {
  const { t } = useTranslation();
  return (
    <Table.Header>
      <Table.Row className={styles.headerRow}>
        <Table.HeaderCell>
          {t("settings.paymentLink.catalog.table.linkedCatalog.name")}
        </Table.HeaderCell>
        <Table.HeaderCell>
          {t("settings.paymentLink.catalog.table.storeType.name")}
        </Table.HeaderCell>
        <Table.HeaderCell>
          {t("settings.paymentLink.catalog.table.showHide.name")}
        </Table.HeaderCell>
        <Table.HeaderCell>
          {t("settings.paymentLink.catalog.table.paymentEnabled.name")}
        </Table.HeaderCell>
        <Table.HeaderCell>
          {t("settings.paymentLink.catalog.table.action.name")}
        </Table.HeaderCell>
      </Table.Row>
    </Table.Header>
  );
};
export default CatalogTableHeader;
