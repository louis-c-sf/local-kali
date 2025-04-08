import React from "react";
import styles from "./MaskedId.module.css";
import { CopyField } from "component/Chat/ShopifyWidget/CopyField";

export function MaskedId(props: { value: string }) {
  return (
    <div className={styles.root}>
      <span className={styles.text}>{showPaymentId(props.value)}</span>
      <CopyField value={props.value} showText={false} />
    </div>
  );
}

function showPaymentId(value: string) {
  return `***${value.substr(-5)}`;
}
