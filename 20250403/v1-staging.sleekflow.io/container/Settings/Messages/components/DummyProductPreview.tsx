import React from "react";
import { Image } from "semantic-ui-react";
import styles from "./DummyProductPreview.module.css";
import PreviewImage from "./assets/PreviewPlaceholderImage.svg";

export default function DummyProductPreview() {
  return (
    <div className={styles.dummy}>
      <div className={styles.image}>
        <Image src={PreviewImage} />
      </div>
      <div className={styles.content}>
        <p>Product Name</p>
        <p>HK$ 500.00</p>
        <p>(Product description)</p>
        <div className={styles.link}>https://shopify.comp/product</div>
      </div>
    </div>
  );
}
