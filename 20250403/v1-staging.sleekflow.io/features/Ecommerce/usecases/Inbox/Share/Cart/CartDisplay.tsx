import { PaymentLinkSetType } from "core/models/Ecommerce/Payment/PaymentLinkType";
import { useTranslation } from "react-i18next";
import React from "react";
import CartItem from "./CartItem";
import { FormikState, FormikHelpers } from "formik";
import styles from "./CartDisplay.module.css";
import CartShare from "./CartShare";
import { PaymentCartFormType } from "../ShareProductModal";
import { GenericCartItemType } from "core/models/Ecommerce/Catalog/GenericCartItemType";

export type CartDisplayFormikType = FormikState<PaymentCartFormType> &
  FormikHelpers<PaymentCartFormType>;

export function CartDisplay(props: {
  currency: string;
  closeModal: () => void;
  hiddenShareProduct: boolean;
  onSubmitPaymentLink?: (paymentLink: PaymentLinkSetType) => void;
  quantity: number;
  loading: boolean;
  selectedOrderItems: GenericCartItemType[];
  form: CartDisplayFormikType;
  storeId: string | number;
}) {
  const { currency, onSubmitPaymentLink } = props;
  const { t } = useTranslation();

  return (
    <div className={styles.cart}>
      <div className={styles.orders}>
        <div className={styles.quantity}>
          {t("chat.shopifyProductsModal.cart.quantity")}: {props.quantity}
        </div>
        <div className={styles.cartItems}>
          {props.selectedOrderItems.map((order, index) => (
            <CartItem
              index={index}
              key={`order_index_${index}`}
              currency={currency}
              product={order}
              storeId={props.storeId}
              values={props.form.values}
            />
          ))}
        </div>
      </div>
      {props.quantity > 0 && (
        <CartShare
          selectedOrders={props.selectedOrderItems}
          currency={currency}
          loading={props.loading}
          hiddenShareProduct={props.hiddenShareProduct}
          isSendingDirectly={!onSubmitPaymentLink}
          form={props.form}
        />
      )}
    </div>
  );
}
