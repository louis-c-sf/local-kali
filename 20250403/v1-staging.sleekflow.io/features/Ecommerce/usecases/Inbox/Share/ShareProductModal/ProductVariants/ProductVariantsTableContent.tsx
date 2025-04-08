import { ProductGenericType } from "core/models/Ecommerce/Cart/ProductGenericType";
import { useProductCartContext } from "../ProductCartContext";
import { useAppSelector } from "AppRootContext";
import { Table } from "semantic-ui-react";
import React, { useState } from "react";
import { GenericCartItemType } from "core/models/Ecommerce/Catalog/GenericCartItemType";
import { useTranslation } from "react-i18next";
import styles from "../../ShareProductModal.module.css";
import { StepperInput } from "component/shared/form/StepperInput/StepperInput";
import { Button } from "component/shared/Button/Button";
import StockAvailable from "../../assets/tsx/StockAvailable";
import { AddProductGuard } from "../AddProductGuard";

export function ProductVariantsTableContent(props: {
  product: ProductGenericType;
  addToCart: (variantId: number | string, quantity: number) => void;
}) {
  const { product, addToCart } = props;
  const productCart = useProductCartContext();
  const supportsInventory = productCart.productProvider.getIsSupportInventory();
  const carts = useAppSelector((s) => s.inbox.product?.cart);

  return (
    <tbody>
      {product.variantsOptions.map((content) => (
        <Table.Row key={JSON.stringify(content)}>
          {Object.entries(content).map(([key, value]) => {
            const stockQuantity = content.stock ?? 0;
            const available = supportsInventory ? stockQuantity > 0 : true;

            if (key === "stock") {
              return (
                <StockStatusCell
                  quantity={content.stock}
                  isAvailable={available}
                />
              );
            } else if (key === "price") {
              return <Table.Cell>${value}</Table.Cell>;
            } else if (key === "id") {
              const variantId = value;
              const selectedProductVariant = carts?.find(
                (c) =>
                  c.productId === product.productId &&
                  c.selectedVariantId === variantId
              );

              return (
                <AddToCartCell
                  variantId={variantId}
                  stockQuantity={supportsInventory ? stockQuantity : Infinity}
                  selectedProductVariant={selectedProductVariant}
                  onAdd={addToCart}
                  isAvailable={available}
                  product={props.product}
                  supportsInventory={supportsInventory}
                />
              );
            }
            return <Table.Cell>{value}</Table.Cell>;
          })}
        </Table.Row>
      ))}
    </tbody>
  );
}

function StockStatusCell(props: { quantity: number; isAvailable: boolean }) {
  const { quantity } = props;
  return (
    <Table.Cell className={styles.stockAvailable}>
      <StockAvailable
        className={props.isAvailable ? styles.available : styles.outOfStock}
      />
      <span className={styles.quantity}>
        {props.isAvailable ? quantity : 0}
      </span>
    </Table.Cell>
  );
}

function AddToCartCell(props: {
  variantId: number | string;
  onAdd: (variantId: number | string, quantity: number) => void;
  selectedProductVariant?: GenericCartItemType;
  product: ProductGenericType;
  isAvailable: boolean;
  stockQuantity: number;
  supportsInventory: boolean;
}) {
  const { variantId, selectedProductVariant, onAdd } = props;
  const selectedQuantity = selectedProductVariant?.quantity ?? 0;

  const { t } = useTranslation();
  const [quantity, setQuantity] = useState(props.isAvailable ? 1 : 0);
  const calcLoading = useAppSelector(
    (s) => s.inbox.product?.calcLoading ?? false
  );
  const guard = new AddProductGuard(
    props.supportsInventory,
    props.product,
    quantity,
    selectedQuantity,
    props.stockQuantity
  );

  const isAddedToCart = selectedProductVariant !== undefined;

  return (
    <Table.Cell>
      <div className={styles.addToCartCell}>
        <div className={styles.stepper}>
          <StepperInput
            amount={quantity}
            onChange={(value) => setQuantity(value)}
            min={1}
            max={guard.maxProduct}
            disabled={!props.isAvailable || guard.maxProduct === 0}
          />
        </div>
        <Button
          blue
          className={styles.addToCart}
          disabled={guard.disableAddButton || calcLoading}
          loading={calcLoading}
          onClick={() => {
            onAdd(variantId, quantity);
            if (
              props.stockQuantity - (quantity + selectedQuantity) <
              quantity
            ) {
              setQuantity(1);
            }
          }}
        >
          {isAddedToCart && quantity === selectedQuantity
            ? t("chat.shopifyProductsModal.products.button.added")
            : t("chat.shopifyProductsModal.products.button.add")}
        </Button>
      </div>
    </Table.Cell>
  );
}
