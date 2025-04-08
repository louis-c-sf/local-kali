import React, { useState } from "react";
import { Image } from "semantic-ui-react";
import { formatCurrency } from "utility/string";
import styles from "./ShareProducts.module.css";
import { GenericCartItemType } from "core/models/Ecommerce/Catalog/GenericCartItemType";
import { useAppSelector } from "AppRootContext";
import {
  getProductDescription,
  getProductName,
} from "features/Ecommerce/vendor/CommerceHub/toGenericProduct";

function ShareProducts(props: {
  selectedOrders: GenericCartItemType[];
  currency: string;
}) {
  const calcItems = useAppSelector((s) => s.inbox.product?.totals?.items ?? []);
  const language = useAppSelector((s) => s.inbox.product?.language ?? "");
  const { selectedOrders, currency } = props;
  const [selectedIndex, setSelectedIndex] = useState(0);

  const isFirstRecord = selectedIndex === 0;
  const isLastRecord = selectedIndex === selectedOrders.length - 1;

  const selectedProduct = selectedOrders[selectedIndex];
  const calculationLineMatch = calcItems.find(
    (item) =>
      item.productId === selectedProduct.productId &&
      item.productVariantId === selectedProduct.selectedVariantId
  );

  const productPreview = calculationLineMatch?.preview;

  const description =
    productPreview?.text ??
    `Description: ${getProductDescription(selectedProduct, language)}`;

  return (
    <div className={styles.shareProducts}>
      <div
        className={`${styles.prev} ${styles.arrow} ${
          isFirstRecord ? styles.disabled : ""
        }`}
        onClick={
          isFirstRecord ? undefined : () => setSelectedIndex(selectedIndex - 1)
        }
      ></div>
      <div className={styles.product}>
        <Image
          className={styles.image}
          src={productPreview?.image ?? selectedProduct.image}
        />
        <div className={styles.title}>
          {getProductName(selectedProduct, language)}
        </div>
        <div className={styles.amount}>
          {formatCurrency(selectedProduct.totalAmount, currency)}
        </div>
        <div className={styles.text}>{description}</div>
        <div className={styles.link}>{`{{product_url}}`}</div>
      </div>
      <div
        className={`${styles.next} ${styles.arrow} ${
          isLastRecord ? styles.disabled : ""
        }`}
        onClick={
          isLastRecord ? undefined : () => setSelectedIndex(selectedIndex + 1)
        }
      ></div>
    </div>
  );
}

export default ShareProducts;
