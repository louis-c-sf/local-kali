import { Union } from "ts-toolbelt";
import { Action } from "types/LoginType";
import { CartResponseType } from "api/CommerceHub/Cart/submitCreateCart";
import {
  toGenericProduct,
  getProductDescription,
} from "features/Ecommerce/vendor/CommerceHub/toGenericProduct";
import { ProductType } from "core/models/Ecommerce/Catalog/ProductType";

export function createUpdateCartAction(
  response: CartResponseType,
  currency: string
): UpdateCartActionType {
  return {
    type: "INBOX.SHOPIFY_MODAL.UPDATED",
    vendor: "commerceHub",
    storeId: response.store_id,
    items: response.line_items.map((item) => {
      const productNormalized: ProductType = {
        ...item.product_variant_snapshot,
        product_variants: [
          {
            id: item.product_variant_snapshot.id,
            attributes: [],
            category_ids: [],
            descriptions: [...item.product_variant_snapshot.descriptions],
            images: [...item.product_variant_snapshot.images],
            names: [...item.product_variant_snapshot.names],
            prices: [...item.product_variant_snapshot.prices],
            product_id: item.product_variant_snapshot.product_id,
            sku: item.product_variant_snapshot.sku,
            store_id: item.product_variant_snapshot.store_id,
          },
        ],
        id: item.product_variant_snapshot.product_id,
      };
      const productDenormalized = toGenericProduct(productNormalized);
      const priceMatch = productNormalized.prices.find(
        (pr) => pr.currency_iso_code === currency
      );
      const discount = item.line_item_discount?.value ?? 0;

      return {
        ...productDenormalized,
        selectedVariantId: item.product_variant_id,
        quantity: item.quantity,
        totalAmount: item.quantity * (priceMatch?.amount ?? 0),
        discountAmount: discount > 0 ? discount.toFixed(2) : "",
        image: item.product_variant_snapshot.images[0]?.image_url ?? "",
      };
    }),
  };
}

type UpdateCartActionType = Union.Select<
  Action,
  { type: "INBOX.SHOPIFY_MODAL.UPDATED" }
>;
