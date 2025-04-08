import { post } from "api/apiRequest";

export default async function postShopifySetting(isEnabledDiscounts: boolean) {
  return post("/company/Shopify/discount-setting", {
    param: { isEnabledDiscounts },
  });
}
