import React from "react";
import { Image } from "semantic-ui-react";
import styles from "features/Ecommerce/usecases/Inbox/Share/ShareProductModal.module.css";
import dummyImage from "../../Share/assets/dummyImage.svg";
import { ProductGenericType } from "core/models/Ecommerce/Cart/ProductGenericType";
import { useProductCartContext } from "features/Ecommerce/usecases/Inbox/Share/ShareProductModal/ProductCartContext";
import { findVariantPrice } from "App/reducers/Chat/productReducer";
import { useAppSelector } from "AppRootContext";
import { formatCurrency } from "utility/string";
import { getProductName } from "features/Ecommerce/vendor/CommerceHub/toGenericProduct";

export default function ProductList(props: {
  products: ProductGenericType[];
  onClick: (id: number | string) => void;
}) {
  const { products } = props;
  const { shoppingCartService: cart } = useProductCartContext();
  const currency = useAppSelector((s) => s.inbox.product?.currency) as string;
  const language = useAppSelector((s) => s.inbox.product?.language) as string;

  return (
    <div className={styles.productListContainer}>
      {products.map((p) => (
        <ShopifyProduct
          key={p.productId}
          onClick={props.onClick}
          product={p}
          variantId={cart.getDefaultVariantId(p)}
          currency={currency}
          language={language}
        />
      ))}
    </div>
  );
}

function ShopifyProduct(props: {
  product: ProductGenericType;
  onClick: (id: number | string) => void;
  variantId: string | number | undefined;
  currency: string;
  language: string;
}) {
  const { product } = props;
  const price = props.variantId
    ? findVariantPrice(props.product, props.variantId, props.currency)
    : null;
  const amountNum = parseFloat(product.amount) || null;
  return (
    <div
      onClick={() => props.onClick(product.productId)}
      className={styles.productGrid}
    >
      <Image
        className={styles.productImage}
        src={product.image || dummyImage}
        alt="product image"
      />
      <div className={styles.content}>
        <div className={styles.title}>
          {getProductName(product, props.language)}
        </div>
        <div className={styles.amount}>
          {formatCurrency(price ?? amountNum ?? 0, props.currency)}
        </div>
      </div>
    </div>
  );
}
