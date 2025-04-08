import { postWithExceptions } from "api/apiRequest";
import { ProductType } from "core/models/Ecommerce/Catalog/ProductType";

export interface ProductsPaginatedResponseType {
  data: {
    continuation_token: string | null;
    products: ProductType[];
    count: number;
  };
}

export async function fetchStoreProducts(
  storeId: string,
  continuationToken: string | null,
  limit: number,
  visibleOnly: boolean
): Promise<ProductsPaginatedResponseType> {
  const filterGroups: any[] = [];
  if (visibleOnly) {
    filterGroups.push({
      filters: [
        {
          operator: "=",
          value: true,
          field_name: "is_view_enabled",
        },
      ],
    });
  }

  return await postWithExceptions("/CommerceHub/Products/GetProducts", {
    param: {
      continuation_token: continuationToken,
      store_id: storeId,
      limit: limit,
      filter_groups: filterGroups,
      sorts: [],
    },
  });
}
