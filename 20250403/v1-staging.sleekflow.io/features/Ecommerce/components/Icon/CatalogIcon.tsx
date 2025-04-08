import iconStyles from "component/shared/Icon/Icon.module.css";
import styles from "./CatalogIcon.module.css";
import React from "react";

export function CatalogIcon(props: { vendor: "shopify" | "commerceHub" }) {
  return (
    <>
      {props.vendor === "shopify" && (
        <span
          className={`${iconStyles.icon} ${styles.typeIcon} ${styles.shopifyIcon}`}
        />
      )}
      {props.vendor === "commerceHub" && (
        <span
          className={`${iconStyles.icon} ${styles.typeIcon} ${styles.customIcon}`}
        />
      )}
    </>
  );
}
