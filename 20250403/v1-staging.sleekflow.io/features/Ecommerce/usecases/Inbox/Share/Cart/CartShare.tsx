import { Button } from "component/shared/Button/Button";
import React from "react";
import { useTranslation } from "react-i18next";

import PaymentProduct from "../ShareProductModal/PaymentProduct";
import { CART_TAB_TYPE, PaymentCartFormType } from "../ShareProductModal";
import ShareProducts from "../ShareProductModal/ShareProducts";
import styles from "./CartShare.module.css";
import CartSendSelection from "../Cart/CartSendSelection";
import moment from "moment";
import { GenericCartItemType } from "core/models/Ecommerce/Catalog/GenericCartItemType";
import { useProductCartContext } from "../ShareProductModal/ProductCartContext";
import { useAppDispatch, useAppSelector } from "AppRootContext";
import { SelectedDiscountType } from "types/ShopifyProductType";
import { equals } from "ramda";
import { CartDisplayFormikType } from "./CartDisplay";

function CartShare(props: {
  currency: string;
  selectedOrders?: GenericCartItemType[];
  loading: boolean;
  hiddenShareProduct: boolean;
  isSendingDirectly: boolean;
  form: CartDisplayFormikType;
}) {
  const { selectedOrders = [], loading } = props;
  const loginDispatch = useAppDispatch();
  const userProfileId = useAppSelector((s) => s.profile.id);
  const storeId = useAppSelector((s) => s.inbox.product?.storeId);
  const language = useAppSelector((s) => s.inbox.product?.language);

  const { values, setFieldValue, setValues, submitForm } = props.form;
  const totals = useAppSelector((s) => s.inbox.product?.totals, equals);
  const totalsLoading = useAppSelector((s) => !!s.inbox.product?.calcLoading);
  const { t } = useTranslation();
  const { selectedTab } = values;
  const productCart = useProductCartContext();

  const selectedProducts = selectedOrders.reduce(
    (acc: GenericCartItemType[], item) => {
      if (acc.some((p) => p.productId === item.productId)) {
        return [...acc];
      }
      return [...acc, item];
    },
    []
  );

  const isDisabled =
    (totals === undefined || totals.totalAmount < 4 || totalsLoading) &&
    selectedTab === "payment";

  const changeValue = (
    key: keyof PaymentCartFormType | "selectedDiscount" | "percentage",
    value: number | SelectedDiscountType | moment.Moment
  ) => {
    const newValues = { ...values, [key]: value };
    setValues(newValues);

    if (!(storeId && language !== undefined)) {
      throw "Invalid cart state";
    }
    if (key === "selectedDiscount" && productCart.vendor === "commerceHub") {
      return loginDispatch({
        type: "INBOX.CART.CHANGE.DISCOUNT_TYPE",
        userProfileId,
        storeId,
        language,
        currency: props.currency,
        cart: selectedOrders,
        discountType: value as SelectedDiscountType,
        overallDiscountPercent: totals?.percentageDiscount ?? 0,
      });
    }
    if (key === "percentage" && productCart.vendor === "commerceHub") {
      return loginDispatch({
        type: "INBOX.CART.CHANGE.DISCOUNT_TYPE",
        userProfileId,
        storeId,
        language,
        currency: props.currency,
        cart: selectedOrders,
        discountType: "percentage",
        overallDiscountPercent: value as number,
      });
    }
    const newDiscountType =
      key === "selectedDiscount"
        ? (value as SelectedDiscountType)
        : totals?.discountType ?? "none";
    const newPercentage =
      key === "percentage"
        ? (value as number)
        : totals?.percentageDiscount ?? 0;

    loginDispatch({
      type: "INBOX.CART.RECALCULATE",
      userProfileId,
      storeId,
      language,
      currency: props.currency,
      percentage: newPercentage,
      selectedDiscount: newDiscountType,
    });
  };

  return (
    <div className={styles.share}>
      {!props.hiddenShareProduct && (
        <CartSendSelection
          selectedTab={selectedTab}
          setSelectedTab={(tab: CART_TAB_TYPE) =>
            setFieldValue("selectedTab", tab)
          }
        />
      )}
      {selectedTab === "payment" &&
        productCart.paymentGateway.canUsePayments() && (
          <PaymentProduct
            totalAmount={totals?.subtotalAmount ?? 0}
            afterDiscount={totals?.totalAmount ?? 0}
            values={values}
            currency={props.currency}
            setValueChange={changeValue}
            selectedDiscount={totals?.discountType ?? "none"}
            percentage={totals?.percentageDiscount ?? 0}
            totalsLoading={totalsLoading}
          />
        )}
      {selectedTab === "product" && (
        <ShareProducts
          currency={props.currency}
          selectedOrders={selectedProducts}
        />
      )}
      <Button
        onClick={isDisabled ? undefined : submitForm}
        loading={loading}
        primary
        disabled={isDisabled}
        className={styles.button}
      >
        {selectedTab === "product" &&
          t("chat.shopifyProductsModal.cart.button.share", {
            count: selectedProducts.length,
          })}
        {selectedTab === "payment" &&
          (props.isSendingDirectly
            ? t("chat.shopifyProductsModal.cart.button.send")
            : t("chat.shopifyProductsModal.cart.button.insert"))}
      </Button>
    </div>
  );
}

export default CartShare;
