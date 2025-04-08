import React from "react";
import { useTranslation } from "react-i18next";
import { CART_TAB_TYPE } from "features/Ecommerce/usecases/Inbox/Share/ShareProductModal";
import styles from "./CartSendSelection.module.css";
import { useProductCartContext } from "features/Ecommerce/usecases/Inbox/Share/ShareProductModal/ProductCartContext";

function CartSendSelection(props: {
  selectedTab: CART_TAB_TYPE;
  setSelectedTab: (tab: CART_TAB_TYPE) => void;
}) {
  const { t } = useTranslation();
  const { selectedTab, setSelectedTab } = props;
  const productCart = useProductCartContext();

  return (
    <div className={styles.options}>
      <span
        onClick={() => setSelectedTab("product")}
        className={`${styles.option} ${
          selectedTab === "product" ? styles.active : ""
        }`}
      >
        {t("chat.shopifyProductsModal.cart.shareOption.product")}
      </span>
      {productCart.paymentGateway.canUsePayments() && (
        <span
          onClick={() => setSelectedTab("payment")}
          className={`${styles.option} ${
            selectedTab === "payment" ? styles.active : ""
          }`}
        >
          {t("chat.shopifyProductsModal.cart.shareOption.payment")}
        </span>
      )}
    </div>
  );
}
export default CartSendSelection;
