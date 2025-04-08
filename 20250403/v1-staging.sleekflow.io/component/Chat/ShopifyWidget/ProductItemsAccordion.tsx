import React from "react";
import { useTranslation } from "react-i18next";
import styles from "./ShopifyWidget.module.css";
import { InfoTooltip } from "../../shared/popup/InfoTooltip";
import { Accordion } from "../BaseWidget/Accordion";
import { formatCurrency } from "utility/string";

export interface ProductItem {
  imageURL: string;
  price: number;
  sku: string;
  title: string;
  variant_title: string;
  quantity: number;
  totalDiscount: number;
  currency: string;
}

export default function ProductItemAccordion(props: {
  productItems: ProductItem[];
  totalPrice?: number;
  currency?: string;
}) {
  const { t } = useTranslation();

  const { productItems, currency, totalPrice = 0 } = props;
  const numberOfItems = productItems.reduce((acc, productItem) => {
    return acc + productItem.quantity;
  }, 0);

  return (
    <Accordion
      initOpen={true}
      head={`${numberOfItems} ${t("chat.shopify.items")}`}
      headSuffix={formatCurrency(totalPrice, currency)}
    >
      {productItems.map((i) => (
        <div key={JSON.stringify(i)} className={styles.productItem}>
          <InfoTooltip
            placement={"left"}
            children={i.title}
            trigger={<div className={styles.productItemTitle}>{i.title}</div>}
          />
          <div className={styles.productItemContainer}>
            <div>
              <img
                className={styles.productItemImage}
                src={i.imageURL}
                alt={i.title}
              />
              <div className={styles.quantityContainer}>{i.quantity}</div>
            </div>
            <div>
              <div>{i.variant_title}</div>
              <div className={styles.productPriceRow}>
                <div className={styles.productPrice}>
                  {formatCurrency(
                    i.totalDiscount
                      ? i.price * i.quantity - i.quantity * i.totalDiscount
                      : i.price * i.quantity,
                    currency
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </Accordion>
  );
}
