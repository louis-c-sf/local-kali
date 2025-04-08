import { GET_SHOPIFY_LIST_STATUS } from "../apiPath";
import { useQueryData } from "api/apiHook";

export type ShopifyStoreResponseType = {
  accessToken: string;
  currency: string;
  id: string;
  isShowInInbox: boolean;
  name: string;
  status: string;
  usersMyShopifyUrl: string;
};

type ShopifyStoreListParam = {
  limit: number;
  offset: number;
};

export function useFetchShopifyStoreList(param?: ShopifyStoreListParam) {
  const result = useQueryData<ShopifyStoreResponseType[]>(
    GET_SHOPIFY_LIST_STATUS,
    { param: param ?? {} }
  );

  return result;
}
