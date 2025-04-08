import { getWithExceptions } from "api/apiRequest";
import { ShopifyProductsResponseType } from "types/ShopifyProductType";

interface ShopifyProductRequestType {
  shopifyId: number;
  title?: string;
  offset?: number;
  limit: number;
}
export function fetchProducts(
  request: ShopifyProductRequestType
): Promise<ShopifyProductsResponseType> {
  return getWithExceptions("/Shopify/Product", {
    param: {
      ...request,
      ...(request.offset !== undefined
        ? {
            offset: request.offset,
            limit: request.limit,
          }
        : {}),
    },
  });
}
