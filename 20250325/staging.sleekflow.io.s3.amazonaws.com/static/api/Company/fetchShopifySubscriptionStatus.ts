import { GET_SHOPIFY_SUBSCRIPTION_STATUS } from "../apiPath";
import { get } from "../apiRequest";

interface SubscriptionStatusResponseType {
  subscriptionStatus: boolean;
  subscriptionPlan: string;
}
export async function fetchShopifySubscriptionStatus(): Promise<SubscriptionStatusResponseType> {
  return get(GET_SHOPIFY_SUBSCRIPTION_STATUS, { param: {} });
}
