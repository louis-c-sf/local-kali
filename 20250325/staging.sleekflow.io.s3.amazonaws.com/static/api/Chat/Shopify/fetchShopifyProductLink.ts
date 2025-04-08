import { getWithExceptions } from "api/apiRequest";
import { ProductLinkResponseType } from "core/models/Ecommerce/Cart/LinkSharingServiceInterface";

export function fetchShopifyProductLink(
  productId: number,
  shopifyId: number
): Promise<ProductLinkResponseType[]> {
  return getWithExceptions("/Shopify/Product/Share", {
    param: {
      shopifyId,
      productId,
    },
  });
}
