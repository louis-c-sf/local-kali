import { useAppSelector } from "AppRootContext";
import { StepperInput } from "component/shared/form/StepperInput/StepperInput";
import { Button } from "component/shared/Button/Button";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./SingleVariantProduct.module.css";
import { ProductGenericType } from "core/models/Ecommerce/Cart/ProductGenericType";
import { useProductCartContext } from "./ProductCartContext";
import { AddProductGuard } from "./AddProductGuard";

function SingleVariantProduct(props: {
  product: ProductGenericType;
  variantId: string | number;
  addToCart: (variantId: number | string, quantity: number) => void;
}) {
  const productCart = useProductCartContext();
  const { t } = useTranslation();
  const stockQuantity = productCart.shoppingCartService.getDefaultVariantStock(
    props.product
  );
  const isSupportInventory =
    productCart.productProvider.getIsSupportInventory();
  const available = isSupportInventory ? stockQuantity > 0 : true;

  const [quantity, setQuantity] = useState(available ? 1 : 0);

  const cartProductQuantity = useAppSelector(
    (s) =>
      s.inbox.product?.cart?.find(
        (c) =>
          c.productId === props.product.productId &&
          c.selectedVariantId === props.variantId
      )?.quantity ?? 0
  );
  const calcLoading = useAppSelector(
    (s) => s.inbox.product?.calcLoading ?? false
  );

  const guard = new AddProductGuard(
    isSupportInventory,
    props.product,
    quantity,
    cartProductQuantity,
    stockQuantity
  );

  return (
    <div className={styles.singleVariant}>
      {isSupportInventory && (
        <div className={styles.quantity}>
          {t(
            "chat.shopifyProductsModal.products.singleVariant.inStockQuantity",
            {
              count: stockQuantity,
            }
          )}
        </div>
      )}
      <div className={styles.stepper}>
        <label className={styles.label}>
          {t(
            "chat.shopifyProductsModal.products.singleVariant.selectedQuantity"
          )}
        </label>
        <StepperInput
          amount={quantity}
          onChange={(value) => setQuantity(value)}
          min={1}
          max={guard.maxProduct}
          disabled={!available || guard.maxProduct === 0}
        />
      </div>
      <div>
        <Button
          blue
          className={styles.addToCart}
          disabled={guard.disableAddButton || calcLoading}
          onClick={() => {
            props.addToCart(props.variantId, quantity);
            if (stockQuantity - (quantity + cartProductQuantity) < quantity) {
              setQuantity(1);
            }
          }}
          loading={calcLoading}
        >
          {t("chat.shopifyProductsModal.products.button.addToCart")}
        </Button>
      </div>
    </div>
  );
}

export default SingleVariantProduct;
