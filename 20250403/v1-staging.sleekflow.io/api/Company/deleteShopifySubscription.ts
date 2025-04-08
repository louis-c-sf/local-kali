import { deleteMethod } from "api/apiRequest";

export function deleteShopifySubscription() {
  return deleteMethod("/shopify/subscription", { param: {} });
}
