import React from "react";
import styles from "../../../../Chat/ShopifyWidget/ShopifyWidget.module.css";
import { useTranslation } from "react-i18next";
import iconStyles from "../../../../shared/Icon/Icon.module.css";
import ProductItemAccordion from "../../../../Chat/ShopifyWidget/ProductItemsAccordion";
import ShopifyFields from "../../../../Chat/ShopifyWidget/ShopifyFields";
import moment from "moment";
import TShirtImg from "../../assets/blue-t-shirt.png";
import SunglassesImg from "../../assets/sunglasses.png";

interface LineItem {
  sku: string;
  price: number;
  title: string;
  variant_title: string;
  quantity: number;
  currency: string;
  imageURL: string;
  totalDiscount: number;
}

interface AbandonedCart {
  info: any;
  lineItems: LineItem[];
}

const abandonedCart: AbandonedCart = {
  info: {
    date: moment().subtract(1, "days"),
    url: "https://www.myshop...",
  },
  lineItems: [
    {
      sku: "tshirt",
      price: 500,
      title: "",
      currency: "HKD",
      variant_title: "Blue T-shirt",
      quantity: 1,
      imageURL: TShirtImg,
      totalDiscount: 0,
    },
    {
      sku: "sunglasses",
      price: 180,
      title: "",
      currency: "HKD",
      variant_title: "Sunglasses for men",
      quantity: 1,
      imageURL: SunglassesImg,
      totalDiscount: 0,
    },
  ],
};

function ShopifyWidget() {
  const { t } = useTranslation();

  return (
    <div className={styles.collapsed}>
      <div className={styles.header}>
        <div className={`${iconStyles.icon} ${styles.analyticsIcon}`} />
        <div className={styles.text}>{t("chat.shopify.header")}</div>
        <div className={styles.collapser}>
          <i
            className={`
              ${iconStyles.dropdownIcon} ${iconStyles.icon}
              ${styles.dropdownIcon}
          `}
          />
        </div>
      </div>
      <div className={styles.curtain}>
        <div>
          <div className={styles.tabs}>
            <span
              className={`${styles.tab} ${styles.active}`}
              id="abandoned-cart"
            >
              {t("chat.shopify.abandonedCart")}
            </span>
            <span className={styles.tab} id="latest-order">
              {t("chat.shopify.latestOrder")}
            </span>
            <span className={styles.tab} id="order-history">
              {t("chat.shopify.orderHistory")}
            </span>
          </div>
          <div className={styles.content}>
            <ProductItemAccordion productItems={abandonedCart.lineItems} />
            {Object.keys(abandonedCart.info).map((infoKey) => (
              <ShopifyFields
                key={infoKey}
                title={infoKey}
                value={abandonedCart.info[infoKey]}
                type="abandoned-cart"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShopifyWidget;
