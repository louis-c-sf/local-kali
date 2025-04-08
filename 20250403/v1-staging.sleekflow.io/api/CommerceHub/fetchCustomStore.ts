import { postWithExceptions } from "../apiRequest";
import { CustomStoreType } from "core/models/Ecommerce/Catalog/CustomStoreType";

export async function fetchCustomStore(id: string): Promise<CustomStoreType> {
  const result = await postWithExceptions("/CommerceHub/Stores/GetStore", {
    param: { id },
  });
  return result.data.store;
}
