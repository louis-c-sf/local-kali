import React, { useEffect, useState } from "react";
import styles from "./Dynamic365Widget.module.css";
import { useTranslation } from "react-i18next";
import iconStyles from "../../shared/Icon/Icon.module.css";
import moment from "moment";
import { BaseWidget } from "../BaseWidget/BaseWidget";
import { Tabs } from "../BaseWidget/Tabs";
import { formatCurrency } from "utility/string";
import { useObjectsApi } from "features/Salesforce/API/Objects/useObjectsApi";
import { fetchObjects } from "features/Salesforce/API/Objects/fetchObjects";
import {
  ExpandType,
  FilterGroupType,
  ObjectNormalizedType,
  PurchaseStoreObjectType,
  SortType,
} from "features/Salesforce/API/Objects/contracts";
import OrderDetail from "./OrderDetail";
import { Button as PageButton } from "features/Stripe/usecases/StripeWidget/Pagination";

const PAGE_LIMIT = 5;
const EXPANDS_VALUE: ExpandType[] = [
  {
    from_field_name: "unified:PurchaseStoreId",
    to_entity_name: "Store",
    to_field_name: "unified:D365Id",
    as_field_name: "PurchaseStore",
  },
];
const SORT_VALUE: SortType[] = [
  {
    field_name: "unified:PurchaseDate",
    direction: "desc",
    is_case_sensitive: false,
  },
];
const getFilterValue = (id: string): FilterGroupType[] => [
  {
    filters: [
      {
        field_name: "d365:_customerid_value",
        operator: "=",
        value: id,
      },
    ],
  },
];

const ITEM_EXPANDS_VALUE: ExpandType[] = [
  {
    from_field_name: "d365:_productid_value",
    to_entity_name: "Product",
    to_field_name: "d365:productid",
    as_field_name: "product",
  },
];
const getItemFilterValue = (id: string): FilterGroupType[] => [
  {
    filters: [
      {
        field_name: "d365:_salesorderid_value",
        operator: "=",
        value: id,
      },
    ],
  },
];

export type OrderHistoryType = ObjectNormalizedType & {
  productDetail?: ObjectNormalizedType[];
};

export const getPurchasePlace = (
  place?: string | null,
  store?: PurchaseStoreObjectType[]
): string => {
  if (place?.toLocaleLowerCase() === "retail" && store && store.length > 0) {
    return store[0]["unified:Name"] || "";
  }
  return place || "";
};

export default function Dynamic365Widget(props: { phoneNumber: string }) {
  const { phoneNumber } = props;
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [tabVisible, setTabVisible] = useState<"latestOrder" | "orderHistory">(
    "latestOrder"
  );
  const [orderHistory, setOrderHistory] = useState<OrderHistoryType[]>([]);
  const [currentOrder, setCurrentOrder] = useState<any>();
  const { getObjectDetailsByIdentity } = useObjectsApi({
    type: "Contact",
  });
  const [orderSummary, setOrderSummary] = useState({
    totalOrders: 0,
    totalPurchases: 0,
  });
  const [visibleAll, setVisibleAll] = useState(false);
  const [continueToken, setContinueToken] = useState<string>();
  const [page, setPage] = useState(1);

  const getD365OrderInfo = async () => {
    try {
      const identity = await getObjectDetailsByIdentity(
        phoneNumber.replace(/[^0-9]+/g, "")
      );
      const d365Id = identity?.records.find(
        (record) => record["unified:D365Id"]
      )?.["unified:D365Id"];
      setOrderSummary({
        totalOrders:
          identity?.records[0]["unified:TotalNumOfPurchaseOrders"] || 0,
        totalPurchases:
          identity?.records[0]["unified:TotalNumOfPurchaseProducts"] || 0,
      });
      if (d365Id) {
        const history = await fetchObjects(
          "SalesOrder",
          getFilterValue(d365Id),
          SORT_VALUE,
          PAGE_LIMIT,
          continueToken,
          EXPANDS_VALUE
        );
        const historyWidthDetail: OrderHistoryType[] = await getD365OrderDetail(
          history.records
        );
        setOrderHistory([...orderHistory, ...historyWidthDetail]);
        setContinueToken(history.continuation_token);
      }
      setIsLoading(false);
    } catch (e) {
      console.error(e);
    }
  };

  const getD365OrderDetail = async (orders: ObjectNormalizedType[]) => {
    try {
      const detailArr = await Promise.all(
        orders.map((order) =>
          fetchObjects(
            "SalesOrderItem",
            getItemFilterValue(order["unified:D365Id"] || ""),
            [],
            100,
            undefined,
            ITEM_EXPANDS_VALUE
          )
        )
      );
      return orders.map((order, index) => ({
        ...order,
        productDetail: detailArr?.[index]?.records || [],
      }));
    } catch (e) {
      console.error(e);
      return orders;
    }
  };

  const handleShowAllHistory = () => {
    setVisibleAll(true);
  };

  const goToPage = (newPage: number) => () => {
    setPage(newPage);
    if (continueToken && page * PAGE_LIMIT >= orderHistory.length) {
      getD365OrderInfo();
    }
  };

  useEffect(() => {
    if (phoneNumber) {
      getD365OrderInfo();
    }
  }, [phoneNumber]);

  const lastOrder = orderHistory.length > 0 ? orderHistory[0] : null;
  return (
    <BaseWidget
      loading={isLoading}
      header={t("chat.dynamic365.header")}
      icon={<div className={`${iconStyles.icon} ${styles.d365Icon}`} />}
    >
      <>
        <Tabs
          active={tabVisible}
          setActive={setTabVisible}
          tabs={{
            latestOrder: t("chat.dynamic365.latestOrder"),
            orderHistory: t("chat.dynamic365.orderHistory"),
          }}
          contents={{
            latestOrder:
              lastOrder === null ? null : <OrderDetail order={lastOrder} />,
            orderHistory:
              orderHistory.length === 0 ? null : !currentOrder ? (
                <>
                  <div className={styles.orderHistorySummary}>
                    <div
                      className={`${styles.summaryBlock} ${styles.summaryBlockBorder}`}
                    >
                      <p className={styles.summaryLabel}>
                        {t("chat.dynamic365.totalOrders")}
                      </p>
                      <p className={styles.summaryValue}>
                        {orderSummary.totalOrders}
                      </p>
                    </div>
                    <div className={styles.summaryBlock}>
                      <p className={styles.summaryLabel}>
                        {t("chat.dynamic365.totalPurchases")}
                      </p>
                      <p className={styles.summaryValue}>
                        {orderSummary.totalPurchases}
                      </p>
                    </div>
                  </div>
                  {orderHistory
                    .filter((_, index) =>
                      visibleAll
                        ? (page - 1) * PAGE_LIMIT <= index &&
                          index < page * PAGE_LIMIT
                        : index < 2
                    )
                    .map((order) => (
                      <div className={styles.orderHistoryItem}>
                        <div className={styles.itemWrapper}>
                          <p className={styles.itemLabel}>
                            {t("chat.dynamic365.orderName")}
                          </p>
                          <p
                            className={`${styles.itemValue} ${styles.hyperlink}`}
                            onClick={() => setCurrentOrder(order)}
                          >
                            {order["unified:OrderId"]}
                          </p>
                        </div>
                        <div className={styles.itemWrapper}>
                          <p className={styles.itemLabel}>
                            {t("chat.dynamic365.totalAmount")}
                          </p>
                          <p className={styles.itemValue}>
                            {formatCurrency(
                              order?.["unified:TotalPrice"] || 0,
                              order?.productDetail?.[0]?.[
                                "unified:PriceCurrency"
                              ] || ""
                            )}
                          </p>
                        </div>
                        <div className={styles.itemWrapper}>
                          <p className={styles.itemLabel}>
                            {t("chat.dynamic365.purchasedDate")}
                          </p>
                          <p className={styles.itemValue}>
                            {moment(order?.["unified:PurchaseDate"]).format(
                              "YYYY-MM-DD h:mm A"
                            )}
                          </p>
                        </div>
                        <div className={styles.itemWrapper}>
                          <p className={styles.itemLabel}>
                            {t("chat.dynamic365.purchasedPlace")}
                          </p>
                          <p className={styles.itemValue}>
                            {getPurchasePlace(
                              order["unified:PurchasePlace"],
                              order["expanded:PurchaseStore"]
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  {orderHistory.length > 2 && !visibleAll && (
                    <div
                      className={`${styles.showAllBtn} ${styles.hyperlink}`}
                      onClick={handleShowAllHistory}
                    >
                      {t("chat.dynamic365.showAll")}
                    </div>
                  )}
                  {visibleAll &&
                    (continueToken || orderHistory.length > PAGE_LIMIT) && (
                      <div className={styles.pagination}>
                        <PageButton
                          arrow="left"
                          disabled={page === 1}
                          action={goToPage(page - 1)}
                        />
                        <span>{t("chat.dynamic365.pageOf", { page })}</span>
                        <PageButton
                          arrow="right"
                          disabled={
                            !continueToken &&
                            page * PAGE_LIMIT >= orderHistory.length
                          }
                          action={goToPage(page + 1)}
                        />
                      </div>
                    )}
                </>
              ) : (
                <>
                  <div
                    className={styles.orderDetailBackBtn}
                    onClick={() => setCurrentOrder(undefined)}
                  >
                    <i className={"ui icon arrow-left-back"} />
                    {t("chat.dynamic365.backToOrderHistory")}
                  </div>
                  <OrderDetail order={currentOrder} />
                </>
              ),
          }}
        />
      </>
    </BaseWidget>
  );
}
