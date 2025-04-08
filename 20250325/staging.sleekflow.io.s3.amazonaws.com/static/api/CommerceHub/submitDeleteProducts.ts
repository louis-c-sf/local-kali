import { postWithExceptions } from "api/apiRequest";

export async function submitDeleteProducts(storeId: string, idList: string[]) {
  return await postWithExceptions("/CommerceHub/Products/DeleteProducts", {
    param: {
      store_id: storeId,
      product_ids: idList,
    },
  });
}
