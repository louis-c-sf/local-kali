import { get } from "api/apiRequest";
interface ShopifyOwnerResponseType {
  shopifyConfigId: number;
}
export default function fetchShopifyOwner(): Promise<ShopifyOwnerResponseType> {
  return get("/company/shopify/billing-owner", { param: {} });
}
