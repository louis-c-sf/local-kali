import React, { useState, useEffect, useCallback, ReactNode } from "react";
import styles from "./ShopifyWidget.module.css";
import { useTranslation } from "react-i18next";
import iconStyles from "../../shared/Icon/Icon.module.css";
import ProductItemAccordion from "./ProductItemsAccordion";
import ShopifyFields from "./ShopifyFields";
import moment from "moment";
import { BaseWidget } from "../BaseWidget/BaseWidget";
import { Tabs } from "../BaseWidget/Tabs";
import { ShopifyInfo } from "./ShopifyInfo";
import {
  AbandonedCart,
  OrderHistoryType,
} from "../../../types/Chat/Shopify/OrderHistoryType";
import { fetchOrderHistory } from "../../../api/Chat/Shopify/fetchOrderHistory";
import { fetchAbandonedCart } from "../../../api/Chat/Shopify/fetchAbandonedCart";
import { formatCurrency } from "utility/string";
import { useAccessRulesGuard } from "component/Settings/hooks/useAccessRulesGuard";
import ShopifyBlurredLayout from "./ShopifyBlurredLayout";

export type ShopifyOrderType = "abandonedCart" | "latestOrder" | "orderHistory";
const ORDER_LIMIT = 10;

function ShopifyWidget(props: { id: string }) {
  const { t } = useTranslation();
  const { id } = props;
  const [isLoading, setIsLoading] = useState(true);
  const [abandonedCart, setAbandonedCart] = useState<AbandonedCart>({
    info: {},
    lineItems: [],
    totalPrice: 0,
    currency: "",
  });
  const [orderHistory, setOrderHistory] = useState<OrderHistoryType[]>([]);
  const [currentOrder, setCurrentOrder] = useState<OrderHistoryType>();
  const [tabVisible, setTabVisible] =
    useState<ShopifyOrderType>("abandonedCart");
  const accessRuleGuard = useAccessRulesGuard();
  const getShopifyInfo = useCallback(async () => {
    try {
      const [abandonedCartRes, orderHistoryRes] = await Promise.all([
        fetchAbandonedCart(id),
        fetchOrderHistory(id, ORDER_LIMIT),
      ]);
      if (abandonedCartRes) {
        setAbandonedCart({
          info: {
            date: abandonedCartRes.date,
            abandonedURL: abandonedCartRes.abandonedURL,
          },
          lineItems: abandonedCartRes.lineItems,
          totalPrice:
            abandonedCartRes.totalPrice - abandonedCartRes.totalDiscounts,
          currency: abandonedCartRes.currency,
        });
      } else {
        setTabVisible("latestOrder");
      }
      if (orderHistoryRes) {
        setOrderHistory(
          orderHistoryRes.results.map((result: OrderHistoryType) => {
            const shopifyLink = result.url.match(
              /(http|https):\/\/([0-9.\-A-Za-z]+)+\//gi
            );
            if (shopifyLink && result.orderId) {
              return {
                ...result,
                adminUrl: `${shopifyLink[0]}admin/orders/${result.orderId}`,
              };
            }
            return result;
          })
        );
      }
      setIsLoading(false);
    } catch (e) {
      console.error(e);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      getShopifyInfo();
    }
  }, [id]);
  const isPayRequired = accessRuleGuard.isShopifyNeedToPay();
  const lastOrder = orderHistory.length > 0 ? orderHistory[0] : null;
  return (
    <BaseWidget
      loading={isLoading}
      header={t("chat.shopify.header")}
      icon={<div className={`${iconStyles.icon} ${styles.analyticsIcon}`} />}
    >
      <>
        <Tabs
          active={tabVisible}
          setActive={setTabVisible}
          tabs={{
            abandonedCart:
              abandonedCart.lineItems.length > 0
                ? t("chat.shopify.abandonedCart")
                : null,
            latestOrder: t("chat.shopify.latestOrder"),
            orderHistory: t("chat.shopify.orderHistory"),
          }}
          contents={{
            abandonedCart: (
              <ShopifyWrapper isPaid={isPayRequired} type="abandonedCart">
                <>
                  <ProductItemAccordion
                    productItems={abandonedCart.lineItems}
                    totalPrice={abandonedCart.totalPrice}
                    currency={abandonedCart.currency}
                  />
                  {Object.keys(abandonedCart.info).map((infoKey) => (
                    <ShopifyFields
                      key={infoKey}
                      title={infoKey}
                      value={abandonedCart.info[infoKey]}
                      type="abandoned-cart"
                    />
                  ))}
                </>
              </ShopifyWrapper>
            ),
            latestOrder: (
              <ShopifyWrapper isPaid={isPayRequired} type="latestOrder">
                {lastOrder === null ? null : (
                  <>
                    <ShopifyFields
                      title="orderName"
                      value={lastOrder?.orderName}
                      type="order-detail"
                    />
                    <ProductItemAccordion
                      currency={lastOrder.currency}
                      totalPrice={lastOrder.totalPrice}
                      productItems={lastOrder.lineItems}
                    />
                    <ShopifyInfo order={lastOrder} />
                  </>
                )}
              </ShopifyWrapper>
            ),
            orderHistory: (
              <ShopifyWrapper type="orderHistory" isPaid={isPayRequired}>
                {orderHistory.length === 0 ? null : !currentOrder ? (
                  <>
                    <div className={styles.orderHeaderWrapper}>
                      <div>{t("chat.shopify.order")}</div>
                      <div>{t("chat.shopify.amount")}</div>
                      <div>{t("chat.shopify.orderDate")}</div>
                    </div>
                    {orderHistory.map((order: OrderHistoryType) => {
                      return (
                        <div
                          key={order.id}
                          className={styles.orderValueWrapper}
                        >
                          <div
                            className={styles.hyperlink}
                            onClick={() => setCurrentOrder(order)}
                          >
                            {order.orderName}
                          </div>
                          <div>
                            {formatCurrency(order.totalPrice, order.currency)}
                          </div>
                          <div>
                            {moment(order.createdAt).format(
                              "YYYY-MM-DD h:mm A"
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </>
                ) : (
                  <div>
                    <div
                      className={styles.orderDetailHeader}
                      onClick={() => setCurrentOrder(undefined)}
                    >
                      <i className={"ui icon arrow-left-back"} />
                      {t("chat.shopify.backToOrderHistory")}
                    </div>
                    <ShopifyFields
                      title="orderName"
                      value={currentOrder.orderName}
                      type="order-detail"
                    />
                    <ProductItemAccordion
                      totalPrice={currentOrder.totalPrice}
                      currency={currentOrder.currency}
                      productItems={currentOrder.lineItems}
                    />
                    <ShopifyInfo order={currentOrder} />
                  </div>
                )}
              </ShopifyWrapper>
            ),
          }}
        />
      </>
    </BaseWidget>
  );
}
function ShopifyWrapper(props: {
  isPaid: boolean;
  type: ShopifyOrderType;
  children: ReactNode;
}) {
  const { isPaid, type } = props;
  return isPaid ? <ShopifyBlurredLayout type={type} /> : <>{props.children}</>;
}
export default ShopifyWidget;
