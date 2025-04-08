import { getWithExceptions } from "api/apiRequest";

export interface ShopifySettingResponseType {
  isEnabledDiscounts: boolean;
}

export async function fetchShopifySetting(): Promise<ShopifySettingResponseType> {
  return getWithExceptions("/company/Shopify/discount-setting", {
    param: {},
  });
}
