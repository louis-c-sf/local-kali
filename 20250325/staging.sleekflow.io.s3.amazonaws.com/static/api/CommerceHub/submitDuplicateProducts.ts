import { postWithExceptions } from "api/apiRequest";

export async function submitDuplicateProducts(
  storeId: string,
  idList: string[]
) {
  return await postWithExceptions("/CommerceHub/Products/DuplicateProducts", {
    param: {
      store_id: storeId,
      product_ids: idList,
    },
  });
}
