import React, {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import styles from "./StripeWidget.module.css";
import iconStyles from "component/shared/Icon/Icon.module.css";
import { BaseWidget } from "component/Chat/BaseWidget/BaseWidget";
import { useTranslation } from "react-i18next";
import { Tabs } from "component/Chat/BaseWidget/Tabs";
import { PaymentList } from "./PaymentList";
import { useAppDispatch, useAppSelector } from "AppRootContext";
import {
  fetchConversationPaymentsHistory,
  PaymentHistoryResponseType,
} from "api/Stripe/fetchConversationPaymentsHistory";
import { uniq } from "ramda";
import { useRefundDialogContext } from "../Refund/contracts/RefundDialogContext";
import { RefundDialog } from "../Refund/RefundDialog";
import { RefundList } from "./RefundList";
import {
  PaymentHistoryRecordType,
  PaymentStatusType,
} from "core/models/Ecommerce/Payment/PaymentLinkType";
import { TabMapType, StatusDisplayEnum } from "./contracts";
import { buildPaymentsSelectors } from "./selectors";
import { TFunction } from "i18next";

const PAGE_SIZE = 3;
const MAX_RECORDS = 100;

const INIT_TOTALS: { [k in StatusDisplayEnum]: number } = {
  Pending: 0,
  Canceled: 0,
  Paid: 0,
  Refunded: 0,
} as const;

export function getTabMap(t: TFunction): TabMapType {
  return {
    Pending: {
      statuses: ["Pending"],
      content: t("chat.paymentLink.status.pending"),
    },
    Paid: {
      statuses: ["Paid", "Refunded", "PartialRefund"],
      content: t("chat.paymentLink.status.paid"),
    },
    Canceled: {
      statuses: ["Canceled"],
      content: t("chat.paymentLink.status.canceled"),
    },
    Refunded: {
      statuses: [
        "Refunded",
        "RefundFailed",
        "PartialRefund",
        "RefundCanceled",
        "RefundPending",
      ],
      content: t("chat.paymentLink.status.refund"),
    },
  };
}

export function StripeWidget() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<StatusDisplayEnum>();
  const [loading, setLoading] = useState(false);
  const [booted, setBooted] = useState(false);
  const [page, setPage] = useState(1);

  const { payment, opened } = useRefundDialogContext();
  const tabMap = getTabMap(t);

  const profileId = useAppSelector((s) => s.profile.id);
  const payments = useAppSelector((s) =>
    s.inbox.paymentHistory.records.filter(
      (rec) => rec.profileId === s.profile.id
    )
  );

  const loginDispatch = useAppDispatch();

  const prefetchRecords = useCallback(
    async (status: PaymentStatusType, from: number, to?: number) => {
      return await fetchConversationPaymentsHistory(
        profileId,
        status,
        from,
        to ?? MAX_RECORDS
      );
    },
    [profileId]
  );

  const dispatchRecordsLoaded = useCallback(
    (statuses: PaymentStatusType[], results: PaymentHistoryResponseType[]) => {
      const dataHeap = results.reduce<PaymentHistoryRecordType[]>(
        (acc, next) => [
          ...acc,
          ...next.stripePaymentCustomerPaymentHistoryRecords,
        ],
        []
      );

      const totals = Object.keys(tabMap).reduce((accTabStatus, key) => {
        const count = tabMap[key].statuses.reduce(
          (acc: number, next: string) => {
            const index = statuses.findIndex((s) => s === next);
            return acc + results[index].totalNumberOfRecords;
          },
          INIT_TOTALS[key]
        );
        return { ...accTabStatus, [key]: count };
      }, {});

      loginDispatch({
        type: "INBOX.PAYMENT_HISTORY.LOADED",
        data: dataHeap,
        profileId,
        totals,
      });
    },
    [profileId, loginDispatch]
  );

  useEffect(() => {
    setLoading(true);
    const fetchStatuses = Object.values(tabMap).reduce<PaymentStatusType[]>(
      (acc, next) => uniq([...acc, ...next.statuses]) as PaymentStatusType[],
      []
    );
    const fetchAllHistories = fetchStatuses.map(
      async (status: PaymentStatusType) => await prefetchRecords(status, 0)
    );
    Promise.all(fetchAllHistories)
      .then((results) => {
        dispatchRecordsLoaded(fetchStatuses, results);
        setBooted(true);
        setPage(1);
        setActiveTab(undefined);
      })
      .catch(console.error)
      .finally(() => {
        setLoading(false);
      });
    return () => {
      setBooted(false);
    };
  }, [prefetchRecords, dispatchRecordsLoaded]);

  function switchTab(status: StatusDisplayEnum) {
    setActiveTab(status);
    setPage(1);
  }

  const { getPagesCount, getPaymentsByStatus, getPaymentsPage } =
    buildPaymentsSelectors(payments, PAGE_SIZE, tabMap);

  const tabs = Object.entries(tabMap).reduce<{
    [k in StatusDisplayEnum]?: ReactNode;
  }>((acc, [statusString, map]) => {
    const status = statusString as StatusDisplayEnum;
    if (getPaymentsByStatus(map.statuses).length > 0) {
      return { ...acc, [status]: map.content };
    }
    return acc;
  }, {});

  const allCount = Object.values(tabMap).reduce((acc, next) => {
    const { statuses } = next;
    return acc + getPaymentsByStatus(statuses).length;
  }, 0);

  const activeNonEmptyTab =
    activeTab ??
    Object.entries(tabMap).reduce<StatusDisplayEnum | null>(
      (acc, [tab, map]) => {
        if (acc !== null) {
          return acc;
        }
        if (getPaymentsByStatus(map.statuses).length > 0) {
          return tab as StatusDisplayEnum;
        }
        return acc;
      },
      null
    );

  if (booted && !loading && allCount === 0) {
    return null;
  }

  if (!activeNonEmptyTab) {
    return null;
  }

  return (
    <BaseWidget
      loading={!booted && loading}
      header={t("chat.paymentLink.statusWidget.header")}
      icon={<div className={`${styles.icon} ${iconStyles.icon}`} />}
    >
      <>
        <Tabs
          active={activeNonEmptyTab}
          setActive={switchTab}
          tabs={tabs}
          contents={{
            Pending: (
              <PaymentList
                key={"Pending"}
                payments={getPaymentsPage(tabMap.Pending.statuses, page)}
                loadPage={setPage}
                page={page}
                pagesTotal={getPagesCount("Pending")}
              />
            ),
            Paid: (
              <PaymentList
                key={"Paid"}
                payments={getPaymentsPage(tabMap.Paid.statuses, page)}
                loadPage={setPage}
                page={page}
                pagesTotal={getPagesCount("Paid")}
              />
            ),
            Canceled: (
              <PaymentList
                key={"Canceled"}
                payments={getPaymentsPage(tabMap.Canceled.statuses, page)}
                loadPage={setPage}
                page={page}
                pagesTotal={getPagesCount("Canceled")}
              />
            ),
            Refunded: (
              <RefundList
                key={"Refunded"}
                payments={getPaymentsPage(tabMap.Refunded.statuses, page)}
                loadPage={setPage}
                page={page}
                pagesTotal={getPagesCount("Refunded")}
              />
            ),
          }}
        />
        {opened && payment && <RefundDialog />}
      </>
    </BaseWidget>
  );
}
