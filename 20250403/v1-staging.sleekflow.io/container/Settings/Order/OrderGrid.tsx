import React, { useState } from "react";
import styles from "./OrderGrid.module.css";
import { Dropdown, Table } from "semantic-ui-react";
import { useTranslation } from "react-i18next";
import { useTableHeaderAdaptive } from "./useTableHeaderAdaptive";
import moment from "moment";
import { NavLink } from "react-router-dom";
import { StripeOrderType } from "../../../types/Stripe/Settings/StripeOrderType";
import { useCurrentUtcOffset } from "../../../component/Chat/hooks/useCurrentUtcOffset";
import useCompanyChannels from "../../../component/Chat/hooks/useCompanyChannels";
import { TableContextMenu } from "../../../component/shared/grid/TableContextMenu";
import { ChannelsIconList } from "../../../component/shared/grid/ChannelsIconList";
import { ChannelType } from "../../../component/Chat/Messenger/types";
import { StripeStatusLabel } from "./StripeStatusLabel";
import { getNextLoopItem } from "../../../utility/getNextLoopItem";
import { formatCurrency } from "../../../utility/string";
import { showPaymentCurrency } from "features/Stripe/usecases/StripeWidget/PaymentItem";
import { InfoTooltip } from "component/shared/popup/InfoTooltip";
import { RefundDialog } from "features/Stripe/usecases/Refund/RefundDialog";
import { useRefundDialogContext } from "features/Stripe/usecases/Refund/contracts/RefundDialogContext";
import { usePaymentsPolicy } from "core/policies/Ecommerce/Payments/usePaymentsPolicy";
import { PaymentHistoryRecordNormalizedType } from "core/models/Ecommerce/Payment/PaymentLinkType";
import { htmlEscape } from "../../../lib/utility/htmlEscape";

export type SortType = { field: string; direction: "asc" | "desc" };

export function OrderGrid(props: {
  loading: boolean;
  data: StripeOrderType[];
  sortValue: SortType | null;
  sort: (by: SortType | null) => void;
  refreshOrder: () => void;
  isRefundTab?: boolean;
}) {
  const {
    data,
    loading,
    sortValue,
    sort,
    isRefundTab = false,
    refreshOrder,
  } = props;
  const { t } = useTranslation();
  const [tableNode, setTableNode] = useState<HTMLTableElement | null>(null);
  const { payment, opened, start } = useRefundDialogContext();
  const paymentsPolicy = usePaymentsPolicy();

  function getNextSort(
    fieldName: string,
    current: SortType | null
  ): SortType | null {
    const steps = [undefined, "asc", "desc"] as const;
    const nextStep = getNextLoopItem(current?.direction, steps);
    if (nextStep !== undefined) {
      return {
        field: fieldName,
        direction: nextStep,
      };
    }
    return null;
  }

  function handleSort(fieldName: string) {
    return () => {
      const nextSort = getNextSort(fieldName, sortValue);
      sort(nextSort);
    };
  }

  const utcOffset = useCurrentUtcOffset();
  const channels = useCompanyChannels();

  //todo use the header height var update for sticky elements offset
  useTableHeaderAdaptive({
    tableNode,
    cssVarName: "--head-height",
  });

  function getDateDisplay(date: string) {
    const dateParsed = moment(new Date(date)).utcOffset(utcOffset);
    return dateParsed.isValid() ? dateParsed.format("MMM, D YYYY H:mm A") : "-";
  }

  function getSortClass(sortValue: SortType | null) {
    if (sortValue) {
      const mapping = {
        asc: "ascending",
        desc: "descending",
      } as const;
      return mapping[sortValue.direction];
    }
  }

  function handleRefundPayment(payment: StripeOrderType) {
    return () =>
      start(payment as unknown as PaymentHistoryRecordNormalizedType);
  }

  const orderField = [
    t("settings.paymentLink.order.field.paymentId"),
    t("settings.paymentLink.order.field.shopifyUrl"),
    t("settings.paymentLink.order.field.customerName"),
    t("settings.paymentLink.order.field.amount"),
    t("settings.paymentLink.order.field.status"),
    {
      sorted: getSortClass(sortValue),
      onClick: handleSort("createdAt"),
      content: t("settings.paymentLink.order.field.createdAt"),
      className: "sortable",
    },
    t("settings.paymentLink.order.field.contactOwner"),
    t("settings.paymentLink.order.field.lastChannels"),
    t("settings.paymentLink.order.field.orderItems"),
  ];

  const refundField = [
    t("settings.paymentLink.order.field.paymentId"),
    t("settings.paymentLink.refund.field.refundId"),
    t("settings.paymentLink.order.field.customerName"),
    t("settings.paymentLink.order.field.amount"),
    t("settings.paymentLink.refund.field.refundAmount"),
    t("settings.paymentLink.order.field.status"),
    t("settings.paymentLink.refund.field.reason"),
    {
      sorted: getSortClass(sortValue),
      onClick: handleSort("createdAt"),
      content: t("settings.paymentLink.order.field.createdAt"),
      className: "sortable",
    },
    t("settings.paymentLink.order.field.contactOwner"),
  ];

  const getTableValue = (d: StripeOrderType) => {
    const isRefundPossible = paymentsPolicy.isRefundPossible(d);
    const idValue = {
      key: "id",
      content: d.paymentId,
    };
    const statusValue = {
      key: "status",
      content: (
        <div className={styles.actionsGroup}>
          <StripeStatusLabel status={d.status} />
          <span className={styles.contextActions}>
            {(d.conversationMessage?.conversationId || isRefundPossible) && (
              <TableContextMenu>
                {() => (
                  <>
                    {d.conversationMessage?.conversationId && (
                      <Dropdown.Item>
                        <NavLink
                          to={`/inbox/all/${
                            d.conversationMessage!.conversationId
                          }`}
                        >
                          {t("settings.paymentLink.order.sendMessage")}
                        </NavLink>
                      </Dropdown.Item>
                    )}
                    {isRefundPossible && (
                      <Dropdown.Item onClick={handleRefundPayment(d)}>
                        {t("settings.paymentLink.order.refund")}
                      </Dropdown.Item>
                    )}
                  </>
                )}
              </TableContextMenu>
            )}
          </span>
        </div>
      ),
    };
    const amountValue = {
      key: "amount",
      content: `${showPaymentCurrency(d)} ${formatCurrency(
        ["Pending", "Failed", "Canceled"].includes(d.status)
          ? d.paymentAmount
          : d.payAmount
      )}`,
    };
    const customerValue = {
      key: "customer",
      content: d.customerName ?? "-",
    };
    const createdAtValue = {
      key: "createdAt",
      content: getDateDisplay(d.createdAt),
    };
    if (isRefundTab) {
      return [
        idValue,
        {
          key: "refundId",
          content: d.refundId,
        },
        customerValue,
        amountValue,
        {
          key: "refundAmount",
          content: `${showPaymentCurrency(d)} ${formatCurrency(
            Number(d.refundedAmount) || 0
          )}`,
        },
        statusValue,
        {
          key: "reason",
          content:
            d?.refundReason && d?.refundReason?.length > 20 ? (
              <InfoTooltip
                trigger={<span>{`${d.refundReason.substring(0, 17)}...`}</span>}
                placement={"top"}
                children={d?.refundReason}
              />
            ) : (
              d?.refundReason
            ),
        },
        createdAtValue,
        {
          key: "owner",
          content: d.contactOwner,
        },
      ];
    }
    return [
      idValue,
      {
        key: "url",
        content: d.eshopPlatformOrderTrackingUrl ? (
          <a
            href={htmlEscape(d.eshopPlatformOrderTrackingUrl)}
            target={"_blank"}
            rel={"noopener noreferrer"}
          >
            {t("settings.paymentLink.order.link")}
          </a>
        ) : (
          "-"
        ),
      },
      customerValue,
      amountValue,
      statusValue,
      createdAtValue,
      {
        key: "owner",
        content: d.contactOwner,
      },
      {
        key: "channels",
        content: d.conversationMessage?.lastChannel && (
          <ChannelsIconList
            value={[
              {
                channel: d.conversationMessage?.lastChannel as ChannelType,
              },
            ]}
            channelsAvailable={channels}
          />
        ),
      },
      {
        key: "items",
        content: d.lineItems.map((i) => i.name).join(", "),
      },
    ];
  };

  return (
    <>
      <table
        className={`${styles.grid} ui table very basic payment-orders sortable`}
        ref={setTableNode}
      >
        <Table.Header>
          <Table.Row
            verticalAlign={"middle"}
            cellAs={(props: any) => <Table.HeaderCell {...props} />}
            cells={isRefundTab ? refundField : orderField}
          ></Table.Row>
        </Table.Header>
        <Table.Body>
          {data.map((d, idx) => (
            <Table.Row key={d.paymentId} cells={getTableValue(d)}></Table.Row>
          ))}
        </Table.Body>
      </table>
      {payment && opened && <RefundDialog refreshPaymentList={refreshOrder} />}
    </>
  );
}
