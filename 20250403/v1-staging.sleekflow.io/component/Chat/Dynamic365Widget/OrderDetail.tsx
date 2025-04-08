import React from "react";
import widgetStyles from "./Dynamic365Widget.module.css";
import { useTranslation } from "react-i18next";
import moment from "moment";
import { Accordion } from "../BaseWidget/Accordion";
import { formatCurrency } from "utility/string";
import { project } from "ramda";
import { InfoTooltip } from "component/shared/popup/InfoTooltip";
import { getPurchasePlace, OrderHistoryType } from "./Dynamic365Widget";

export default function OrderDetail(props: { order: OrderHistoryType }) {
  const { order } = props;
  const { t } = useTranslation();

  return (
    <>
      <div className={widgetStyles.orderHistoryItem}>
        <div className={widgetStyles.itemWrapper}>
          <p className={widgetStyles.itemLabel}>
            {t("chat.dynamic365.orderName")}
          </p>
          <p className={widgetStyles.itemValue}>{order["unified:OrderId"]}</p>
        </div>
        <div className={widgetStyles.itemWrapper}>
          <p className={widgetStyles.itemLabel}>
            {t("chat.dynamic365.purchasedDate")}
          </p>
          <p className={widgetStyles.itemValue}>
            {moment(order?.["unified:PurchaseDate"]).format(
              "YYYY-MM-DD h:mm A"
            )}
          </p>
        </div>
        <div className={widgetStyles.itemWrapper}>
          <p className={widgetStyles.itemLabel}>
            {t("chat.dynamic365.purchasedPlace")}
          </p>
          <p className={widgetStyles.itemValue}>
            {getPurchasePlace(
              order["unified:PurchasePlace"],
              order["expanded:PurchaseStore"]
            )}
          </p>
        </div>
        <Accordion
          initOpen={true}
          head={`${order.productDetail?.length || 0} ${t(
            "chat.dynamic365.items"
          )}`}
          headSuffix={formatCurrency(
            order?.["unified:TotalPrice"] || 0,
            order.productDetail?.[0]?.["unified:PriceCurrency"] || ""
          )}
        >
          {order.productDetail?.map((product) => (
            <div
              key={project["unified:Sku"]}
              className={widgetStyles.detailWrapper}
            >
              <div className={widgetStyles.detailImg}>
                {product["unified:ProductUrl"] && (
                  <img
                    className={widgetStyles.detailProductImg}
                    src={product["unified:ProductUrl"]}
                    alt={product["unified:Name"] || ""}
                  />
                )}
              </div>
              <div className={widgetStyles.detailItemWrapper}>
                <div className={widgetStyles.detailProductTitle}>
                  <InfoTooltip
                    placement={"left"}
                    children={product["unified:Name"]}
                    trigger={
                      <div className={widgetStyles.detailProductName}>
                        {product["unified:Name"]}
                      </div>
                    }
                  />
                  <span>
                    {formatCurrency(
                      product?.["unified:UnitPrice"] || 0,
                      product?.["unified:PriceCurrency"] || ""
                    )}
                  </span>
                </div>
                <p className={widgetStyles.detailProductSpec}>
                  {`${t("chat.dynamic365.size")}: ${product["unified:Size"]}`}
                </p>
                <p className={widgetStyles.detailProductSpec}>
                  {`${t("chat.dynamic365.collectionName")}: ${
                    product["expanded:product"]?.[0]?.[
                      "unified:CollectionName"
                    ] || ""
                  }`}
                </p>
                <p className={widgetStyles.detailProductSpec}>
                  {`${t("chat.dynamic365.productType")}: ${
                    product["expanded:product"]?.[0]?.["unified:ProductType"] ||
                    ""
                  }`}
                </p>
                <p className={widgetStyles.detailProductSpec}>
                  {`${t("chat.dynamic365.metalType")}: ${
                    product["expanded:product"]?.[0]?.["unified:MetalType"] ||
                    ""
                  }`}
                </p>
                <p className={widgetStyles.detailProductItem}>
                  {`${t("chat.dynamic365.sku")}: ${product["unified:Sku"]}`}
                </p>
                <p className={widgetStyles.detailProductItem}>
                  {`${t("chat.dynamic365.quantity")}: ${
                    product["unified:Quantity"]
                  }`}
                </p>
                <p className={widgetStyles.detailProductItem}>
                  {`${t("chat.dynamic365.warrantyUntil")}: ${moment(
                    product["unified:WarrantyUntil"]
                  ).format("YYYY-MM-DD")}`}
                </p>
              </div>
            </div>
          ))}
        </Accordion>
      </div>
    </>
  );
}
