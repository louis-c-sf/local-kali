import { post } from "api/apiRequest";

export default function createShopifyOwner(shopifyId: string) {
  return post(`/company/shopify/billing-owner/${shopifyId}`, { param: {} });
}
