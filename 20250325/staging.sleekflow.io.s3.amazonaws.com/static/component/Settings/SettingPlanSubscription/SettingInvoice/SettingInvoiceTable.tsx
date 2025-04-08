import { useAppSelector } from "AppRootContext";
import { equals } from "ramda";
import React, { useState } from "react";
import { Table } from "semantic-ui-react";
import gridStyles from "../../../../component/shared/grid/Grid.module.css";
import styles from "./SettingInvoiceTable.module.css";
import { useCloudAPIInvoice } from "../hooks/useCloudAPIInvoice";
import { useCompanyInvoice } from "../hooks/useCompanyInvoice";
import { ExcludedAddOn } from "../SettingPlan/SettingPlan";
import { useTranslation } from "react-i18next";
import moment from "moment";
import { useAccessRulesGuard } from "component/Settings/hooks/useAccessRulesGuard";
function SettingInvoiceTable() {
  const billRecords = useAppSelector((s) => s.company?.billRecords, equals);
  const { loading, data } = useCloudAPIInvoice();
  const { t } = useTranslation();
  const [selectedInvoiceType, setSelectedInvoiceType] = useState<
    "subscription" | "topup"
  >("subscription");

  const { denormalizedCloudAPITopUp, denormalizedSubscription } =
    useCompanyInvoice();
  const { header, content } =
    selectedInvoiceType === "subscription"
      ? denormalizedSubscription(billRecords?.filter(ExcludedAddOn))
      : denormalizedCloudAPITopUp(data);
  const headerMapping = {
    billDate: t("settings.plan.modal.invoice.table.header.billDate"),
    status: t("settings.plan.modal.invoice.table.header.status"),
    amount: t("settings.plan.modal.invoice.table.header.amount"),
    facebookBusinessAccount: t(
      "settings.plan.modal.invoice.table.header.facebookBusinessAccount"
    ),
    billDescription: t(
      "settings.plan.modal.invoice.table.header.billDescription"
    ),
  };
  const accessRuleGuard = useAccessRulesGuard();

  return (
    <div className={styles.container}>
      {accessRuleGuard.isCloudAPIAccount() && (
        <div className={styles.tabs}>
          <div className={styles.border}></div>
          <div
            className={`${styles.tab} ${
              selectedInvoiceType === "subscription" ? styles.selectedTab : ""
            }`}
            onClick={() => setSelectedInvoiceType("subscription")}
          >
            {t("settings.plan.modal.invoice.tabs.subscription")}
          </div>
          <div
            className={`${styles.tab} ${
              selectedInvoiceType === "topup" ? styles.selectedTab : ""
            }`}
            onClick={() => setSelectedInvoiceType("topup")}
          >
            {t("settings.plan.modal.invoice.tabs.topup")}
          </div>
        </div>
      )}
      <div className={styles.table}>
        <Table className={gridStyles.grid}>
          <Table.Header>
            <Table.Row>
              {header.map((field) => (
                <Table.HeaderCell>{headerMapping[field]}</Table.HeaderCell>
              ))}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {content?.map((col) => (
              <Table.Row>
                {Object.keys(col)
                  .filter((c) =>
                    selectedInvoiceType === "subscription"
                      ? c !== "facebookBusinessAccount"
                      : true
                  )
                  .map((c) => (
                    <SettingInvoiceTableColumn row={col} name={c} />
                  ))}
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
    </div>
  );
}
export default SettingInvoiceTable;

function SettingInvoiceTableColumn({
  row,
  name,
}: {
  row: Record<string, string>;
  name: string;
}) {
  const { t } = useTranslation();
  if (name === "billDate") {
    return (
      <Table.Cell>
        <a
          className={styles.link}
          href={row["invoice"]}
          target="_blank"
          rel="noreferrer noopener"
        >
          {row[name]}
        </a>
      </Table.Cell>
    );
  } else if (name === "status") {
    return (
      <Table.Cell>
        <div className={styles.paid}>
          {t("settings.plan.modal.invoice.paid")}
        </div>
      </Table.Cell>
    );
  } else if (name === "amount") {
    return (
      <Table.Cell>
        <span>{row["amount"]}</span>
      </Table.Cell>
    );
  } else if (name === "billDescription") {
    return (
      <Table.Cell>
        <span>{row["billDescription"]}</span>
      </Table.Cell>
    );
  } else if (name === "facebookBusinessAccount") {
    return (
      <Table.Cell>
        <span>{row["facebookBusinessAccount"]}</span>
      </Table.Cell>
    );
  } else {
    return <></>;
  }
}
