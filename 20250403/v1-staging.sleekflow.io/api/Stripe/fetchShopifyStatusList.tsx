import { getWithExceptions } from "api/apiRequest";
import { ShopifyConfigsType } from "types/CompanyType";

export const fetchShopifyStatusList = async (): Promise<
  ShopifyConfigsType[]
> => {
  return await getWithExceptions("/company/Shopify/status/list", {
    param: {
      limit: 100,
      offset: 0,
    },
  });
};
