import { get } from "../../apiRequest";
import { GET_SHOPIFY_ABANDONED_CART } from "../../apiPath";
import { ProductItem } from "../../../component/Chat/ShopifyWidget/ProductItemsAccordion";

export async function fetchAbandonedCart(id: string): Promise<{
  date: string;
  abandonedURL: string;
  lineItems: ProductItem[];
  totalDiscounts: number;
  totalPrice: number;
  currency: string;
}> {
  return await get(GET_SHOPIFY_ABANDONED_CART.replace("{userProfileId}", id), {
    param: {},
  });
}
