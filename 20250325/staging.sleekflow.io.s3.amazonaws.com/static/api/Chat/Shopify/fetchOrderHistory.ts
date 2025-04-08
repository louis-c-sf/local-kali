import { getWithExceptions } from "../../apiRequest";
import { ShopifyOrderResponseType } from "../../../types/Chat/Shopify/OrderHistoryType";

export async function fetchOrderHistory(
  id: string,
  limit: number
): Promise<ShopifyOrderResponseType> {
  return await getWithExceptions(`/userprofile/shopify/order/${id}`, {
    param: {
      offset: 0,
      limit: limit,
    },
  });
}
