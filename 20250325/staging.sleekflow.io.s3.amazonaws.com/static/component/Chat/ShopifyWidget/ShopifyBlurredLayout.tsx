import React, { useState } from "react";
import BlurredAbandonedCartImg from "./assets/blurredAbandonedCart.svg";
import BlurredLastOrderImg from "./assets/blurredLastOrder.svg";
import BlurredOrderHistoryImg from "./assets/blurredOrderHistory.svg";
import { Image } from "semantic-ui-react";
import { Button } from "component/shared/Button/Button";
import { ShopifyOrderType } from "./ShopifyWidget";
import styles from "./ShopifyBlurredLayout.module.css";
import PayShopifyModal from "./PayShopifyModal";
import { useTranslation } from "react-i18next";

export default function ShopifyBlurredLayout({
  type,
}: {
  type: ShopifyOrderType;
}) {
  const { t } = useTranslation();
  let imgSrc = "";
  if (type === "abandonedCart") {
    imgSrc = BlurredAbandonedCartImg;
  } else if (type === "latestOrder") {
    imgSrc = BlurredLastOrderImg;
  } else if (type === "orderHistory") {
    imgSrc = BlurredOrderHistoryImg;
  }
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className={styles.container}>
        <div className={styles.action}>
          <Button onClick={() => setOpen(true)} primary>
            {t("shopifyWidget.button.renewToUnlock")}
          </Button>
        </div>
        <Image className={styles.image} src={imgSrc} />
      </div>
      {open && <PayShopifyModal setOpen={setOpen} />}
    </>
  );
}
