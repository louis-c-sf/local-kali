import { GET_SHOPIFY_PRODUCT_VARIANTS } from "api/apiPath";
import { getWithExceptions } from "api/apiRequest";
import { ShopifyProductVariantType } from "types/ShopifyProductType";

interface ShopifyProductVariantRequestType {
  shopifyId: number;
  productId: number;
}

export function fetchProductVariant(
  shopifyProductVariantRequest: ShopifyProductVariantRequestType
): Promise<ShopifyProductVariantType[]> {
  return getWithExceptions(GET_SHOPIFY_PRODUCT_VARIANTS, {
    param: {
      ...shopifyProductVariantRequest,
    },
  });
}
