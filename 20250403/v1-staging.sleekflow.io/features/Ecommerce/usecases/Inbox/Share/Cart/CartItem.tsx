import { useAppDispatch, useAppSelector } from "AppRootContext";
import { StepperInput } from "component/shared/form/StepperInput/StepperInput";
import React, { useState, useCallback } from "react";
import { SelectedDiscountType } from "types/ShopifyProductType";
import { PaymentCartFormType } from "../ShareProductModal";
import styles from "../Cart/CartDisplay.module.css";
import DeleteIcon from "../assets/deleteIcon.svg";
import { useTranslation } from "react-i18next";
import { formatCurrency } from "utility/string";
import { FieldError } from "component/shared/form/FieldError";
import dummyImage from "../assets/dummyImage.svg";
import NumberFormat from "react-number-format";
import { GenericCartItemType } from "core/models/Ecommerce/Catalog/GenericCartItemType";
import { useProductCartContext } from "features/Ecommerce/usecases/Inbox/Share/ShareProductModal/ProductCartContext";
import { clamp } from "ramda";
import { getProductName } from "features/Ecommerce/vendor/CommerceHub/toGenericProduct";
import { useDebouncedCallback } from "use-debounce";

function CartItem(props: {
  index: number;
  currency: string;
  product: GenericCartItemType;
  storeId: number | string;
  values: PaymentCartFormType;
}) {
  const {
    image,
    productId,
    variantsOptions,
    selectedVariantId,
    quantity,
    options,
    discountAmount,
  } = props.product;
  const { values } = props;
  const productCart = useProductCartContext();
  const shoppingCartService = productCart.shoppingCartService;
  const supportsInventory = productCart.productProvider.getIsSupportInventory();
  const userProfileId = useAppSelector((s) => s.profile.id);
  const totals = useAppSelector((s) => s.inbox.product?.totals);
  const language = useAppSelector((s) => s.inbox.product?.language);

  const variantOption = shoppingCartService.getSelectedVariantOption(
    props.product,
    props.currency
  );

  const { currency } = props;
  const loginDispatch = useAppDispatch();

  const foundStockQuantity = variantOption?.stock ?? 0;
  const unitPrice = props.product.totalAmount;
  const { t } = useTranslation();
  const [errMsg, setErrMsg] = useState("");

  function updateQuantity(value: number) {
    loginDispatch({
      type: "INBOX.CART.UPDATE.QUANTITY",
      variantId: selectedVariantId,
      productId: productId,
      storeId: props.storeId,
      quantity: value,
      currency,
      form: props.values,
    });
  }

  const updateDiscountAmount = (value: string) => {
    const total = calculateAmount(quantity, unitPrice, 0);
    const discount = Number(value);
    if (discount > total) {
      setErrMsg(t("form.error.number.max").replace("{max}", `${total - 4}`));
      return;
    } else {
      setErrMsg("");
    }
    loginDispatch({
      type: "INBOX.CART.UPDATE.DISCOUNT",
      storeId: props.storeId,
      currency: currency,
      variantId: selectedVariantId,
      productId: productId,
      discount: value,
      quantity: quantity,
      form: props.values,
    });
    // commerceHub cart will be recalculated with rxjs epic,
    // while for Shopify we call the recalculate manually for now
    // todo move to Shopify epic as well?
    if (productCart.vendor !== "commerceHub") {
      loginDispatch({
        type: "INBOX.CART.RECALCULATE",
        storeId: props.storeId,
        userProfileId,
        currency,
        language: "",
        percentage: totals?.percentageDiscount ?? 0,
        selectedDiscount: totals?.discountType ?? "none",
      });
    }
  };

  function removeItem() {
    loginDispatch({
      type: "INBOX.CART.ITEM_DELETE",
      storeId: props.storeId,
      quantity: quantity,
      currency: currency,
      productId: props.product.productId,
      variantId: props.product.selectedVariantId,
    });
  }

  function isPaymentDiscountSelected() {
    return values.selectedTab === "payment" && totals?.discountType === "fixed";
  }

  return (
    <div className={styles.cartItem}>
      <img className={styles.image} src={image || dummyImage} />
      <div className={styles.description}>
        <div className={styles.title}>
          {getProductName(props.product, language ?? "")}
        </div>
        {variantsOptions.length > 1 && (
          <div className={styles.options}>
            {options.map((item) => (
              <OptionItem
                key={item.id}
                name={item.name}
                selectedValue={variantOption[item.name] as string}
              />
            ))}
          </div>
        )}
        <div className={styles.quantity}>
          <StepperInput
            amount={quantity}
            onChange={updateQuantity}
            min={1}
            max={supportsInventory ? foundStockQuantity : Infinity}
            disabled={supportsInventory ? foundStockQuantity <= 0 : false}
          />
          <div className={styles.deleteIcon}>
            <img onClick={removeItem} src={DeleteIcon} />
          </div>
          <div className={styles.amount}>
            {formatCurrency(props.product.totalAmount, currency)}
          </div>
        </div>
        {isPaymentDiscountSelected() && (
          <>
            <div className={styles.discount}>
              <div className={styles.label}>
                <label>
                  {t("chat.shopifyProductsModal.cart.item.label.discount")}
                </label>
              </div>
              <div className={`ui input ${styles.discountInput}`}>
                <NumberFormat
                  placeholder="0.00"
                  value={
                    discountAmount === ""
                      ? ""
                      : Number(discountAmount).toFixed(2) || 0
                  }
                  onValueChange={(v) => {
                    const validValue = clamp(
                      0,
                      v.floatValue ?? 0,
                      props.product.totalAmount
                    );
                    updateDiscountAmount(String(validValue || ""));
                  }}
                  displayType={"input"}
                  thousandSeparator={","}
                  decimalSeparator={"."}
                  prefix={"$ "}
                />
              </div>
              <FieldError className={styles.error} text={errMsg} />
            </div>
            <div className={styles.afterDiscount}>
              <label className={styles.label}>
                {t("chat.shopifyProductsModal.cart.item.label.afterDiscount")}:
              </label>
              <div className={styles.subTotal}>
                {formatCurrency(
                  props.product.totalAmount -
                    (Number(props.product.discountAmount) || 0) * quantity,
                  currency
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function calculateAmount(quantity: number, amount: number, discount: number) {
  return quantity * amount - discount;
}

function OptionItem(props: { name: string; selectedValue: string }) {
  const { name, selectedValue } = props;
  return (
    <div className={styles.option}>
      <label>{name}</label>
      <div>{selectedValue}</div>
    </div>
  );
}

export default CartItem;
