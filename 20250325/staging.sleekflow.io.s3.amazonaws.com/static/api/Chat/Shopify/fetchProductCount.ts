import { getWithExceptions } from "api/apiRequest";

export interface ProductCountsResponseType {
  count: number;
}
interface ProductCountsRequestType {
  shopifyId: number;
  title?: string;
}
export function fetchProductsCount(
  productCountRequest: ProductCountsRequestType
): Promise<ProductCountsResponseType> {
  return getWithExceptions("/Shopify/Product/Count", {
    param: { ...productCountRequest },
  });
}
