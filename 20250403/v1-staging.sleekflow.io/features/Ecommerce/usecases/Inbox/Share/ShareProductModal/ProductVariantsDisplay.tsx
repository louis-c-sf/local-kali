import { useAppSelector, useAppDispatch } from "AppRootContext";
import { Table, Image, Loader } from "semantic-ui-react";
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSendProductLink } from "component/Chat/Messenger/useSendProductLink";
import { equals } from "ramda";
import {
  formatAmount,
  formatVariants,
} from "features/Ecommerce/usecases/Inbox/Share/ShareProductModal/useFetchProducts";
import styles from "./ProductVariantsDisplay.module.css";
import { BackLink } from "component/shared/nav/BackLink";
import ArrowLeftIcon from "features/Ecommerce/usecases/Inbox/Share/assets/arrow-left.svg";
import dummyImage from "features/Ecommerce/usecases/Inbox/Share/assets/dummyImage.svg";
import SingleVariantProduct from "features/Ecommerce/usecases/Inbox/Share/ShareProductModal/SingleVariantProduct";
import ShareLink from "features/Ecommerce/usecases/Inbox/Share/assets/shareLink.svg";
import { useProductCartContext } from "features/Ecommerce/usecases/Inbox/Share/ShareProductModal/ProductCartContext";
import { VariantResponseType } from "core/models/Ecommerce/Cart/ProductProviderInterface";
import { ProductGenericType } from "core/models/Ecommerce/Cart/ProductGenericType";
import { ProductVariantsTableHeader } from "features/Ecommerce/usecases/Inbox/Share/ShareProductModal/ProductVariants/ProductVariantsTableHeader";
import { ProductVariantsTableContent } from "features/Ecommerce/usecases/Inbox/Share/ShareProductModal/ProductVariants/ProductVariantsTableContent";
import { findVariantPrice } from "App/reducers/Chat/productReducer";
import { formatCurrency } from "utility/string";
import { getProductName } from "features/Ecommerce/vendor/CommerceHub/toGenericProduct";

export function ProductVariantsDisplay(props: {
  updateProduct: (
    productId: number | string,
    product: ProductGenericType
  ) => void;
  currency: string | undefined;
  product: ProductGenericType;
  language: string;
  storeId: number | string;
  clearSelection: () => void;
  closeModal: (productId: number | string) => void;
  hiddenShareProduct: boolean;
}) {
  const { product, storeId, currency = "HKD", updateProduct } = props;
  const productCart = useProductCartContext();
  const [loading, setLoading] = useState(false);
  const { sendProductLink } = useSendProductLink(storeId, props.language);
  const carts = useAppSelector((s) => s.inbox.product?.cart, equals);
  const loginDispatch = useAppDispatch();
  const keys = Object.keys(product.variantsOptions[0] ?? {});

  function addToCart(variantId: number | string, quantity: number) {
    const foundVariant = carts?.find(
      (c) =>
        c.productId === product.productId && c.selectedVariantId === variantId
    );
    if (foundVariant) {
      loginDispatch({
        type: "INBOX.CART.UPDATE.QUANTITY",
        quantity: quantity + foundVariant.quantity,
        variantId: variantId,
        productId: product.productId,
        currency,
        storeId: storeId,
        form: {
          expiredAt: undefined,
          percentage: 0,
          selectedDiscount: "none",
          selectedTab: "product",
        },
      });
    } else {
      loginDispatch({
        type: "INBOX.CART.ADD",
        quantity: quantity,
        variantId: variantId,
        product: product,
        currency,
        vendor: productCart.vendor,
        storeId: props.storeId,
        language: props.language,
      });
    }
  }

  useEffect(() => {
    if (storeId && product.productId && currency) {
      productCart.productProvider
        .fetchProductVariant(storeId, product.productId, currency)
        .then((res: VariantResponseType) => {
          const updatedVariants = res.variants;
          if (updatedVariants.length > 0) {
            updateProduct(product.productId, {
              ...product,
              amount: `${formatAmount(updatedVariants, currency)}`,
              variantsOptions: formatVariants(
                updatedVariants,
                currency,
                product.options
              ),
              variants: updatedVariants,
            });
          }
        });
    }
  }, [storeId, product.productId, currency]);

  async function shareProductLink() {
    try {
      setLoading(true);
      await sendProductLink(product);
      props.closeModal(product.productId);
    } catch (e) {
      console.error(`sendProductLink error ${e}`);
    } finally {
      setLoading(false);
    }
  }

  const defaultVariantId =
    productCart.shoppingCartService.getDefaultVariantId(product);

  return (
    <div className={styles.variantGrid}>
      <BackLink
        icon={<Image src={ArrowLeftIcon} />}
        className={styles.backLink}
        onClick={props.clearSelection}
      />
      <Image className={styles.image} src={product.image || dummyImage} />
      <div className={styles.header}>
        {getProductName(product, props.language)}
      </div>
      <div className={styles.content}>
        <div className={styles.description}>
          {!props.hiddenShareProduct && (
            <span>
              <ProductLink
                onClick={loading ? undefined : shareProductLink}
                disabled={loading}
              />
            </span>
          )}
        </div>
        <div className={styles.amount}>
          {defaultVariantId &&
            formatCurrency(
              findVariantPrice(product, defaultVariantId, currency),
              currency
            )}
        </div>
        {product.variants.length === 1 ? (
          defaultVariantId && (
            <SingleVariantProduct
              product={product}
              addToCart={addToCart}
              variantId={defaultVariantId}
            />
          )
        ) : (
          <div className={`hide-scrollable-table ${styles.table}`}>
            <div className="stick-wrap">
              <Table sortable basic={"very"} className={"dnd"}>
                <ProductVariantsTableHeader keys={keys} />
                <ProductVariantsTableContent
                  product={product}
                  addToCart={addToCart}
                />
              </Table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ProductLink(props: { onClick?: () => void; disabled: boolean }) {
  const { t } = useTranslation();
  return (
    <div
      onClick={props.onClick}
      className={`
        ${styles.link} 
        ${props.disabled ? styles.disabled : ""}
      `}
    >
      {props.disabled ? (
        <Loader inline size={"mini"} active inverted />
      ) : (
        <Image src={ShareLink} />
      )}

      <span className={styles.text}>
        {t("chat.shopifyProductsModal.productLink")}
      </span>
    </div>
  );
}
