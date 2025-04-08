import { getWithExceptions } from "api/apiRequest";
import { ShopifyStoreResponseType } from "features/Ecommerce/Payment/usecases/Settings/Catalog/types";

export const fetchShopifyStore = async (
  id: number
): Promise<ShopifyStoreResponseType> => {
  return await getWithExceptions(`/company/shopify/status/${id}`, {
    param: {},
  });
};
