import { ShoppingVendorType } from "features/Ecommerce/usecases/Inbox/Share/ShareProductModal/ProductCartContext";
import styles from "features/Ecommerce/usecases/Inbox/Share/ShopifyProductButton.module.css";
import { CatalogIcon } from "features/Ecommerce/components/Icon/CatalogIcon";
import React from "react";

export function StoreConfigOption(props: {
  name: string;
  vendor: ShoppingVendorType;
}) {
  return (
    <div className={styles.shopifyItem}>
      <CatalogIcon vendor={props.vendor} />
      <span className={styles.name}>{props.name}</span>
    </div>
  );
}
