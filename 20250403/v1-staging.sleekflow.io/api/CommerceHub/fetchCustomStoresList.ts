import { postWithExceptions } from "../apiRequest";
import { CustomStoreType } from "core/models/Ecommerce/Catalog/CustomStoreType";

export async function fetchCustomStoresList(): Promise<CustomStoreType[]> {
  const request: Promise<{ data: { stores: CustomStoreType[] } }> =
    postWithExceptions("/CommerceHub/Stores/GetStores", {
      param: {
        continuation_token: null,
        limit: 200,
      },
    });
  const result = await request;
  return result.data.stores;
}
