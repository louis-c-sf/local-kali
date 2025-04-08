import { postWithExceptions } from "api/apiRequest";

export async function postSyncProduct(shopifyId: string | number) {
  return await postWithExceptions(
    `/Shopify/Product/sync?shopifyId=${shopifyId}`,
    {
      param: {},
    }
  );
}
