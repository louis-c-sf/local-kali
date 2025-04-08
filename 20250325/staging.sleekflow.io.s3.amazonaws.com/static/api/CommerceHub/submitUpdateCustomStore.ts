import { postWithExceptions } from "../apiRequest";
import { CustomStoreType } from "core/models/Ecommerce/Catalog/CustomStoreType";

export async function submitUpdateCustomStore(store: CustomStoreType) {
  return await postWithExceptions("/CommerceHub/Stores/UpdateStore", {
    param: store,
  });
}
