import { postWithExceptions } from "api/apiRequest";
import { ProductsPaginatedResponseType } from "api/CommerceHub/fetchStoreProducts";

export async function fetchSearchStoreProducts(
  storeId: string,
  searchQuery: string,
  continuationToken: string | null,
  limit: number,
  visibleOnly: boolean,
  fuzzy: boolean
): Promise<ProductsPaginatedResponseType> {
  let searchText: string;
  if (fuzzy) {
    searchText = searchQuery.endsWith("*") ? searchQuery : `${searchQuery}*`;
  } else {
    searchText = `"${searchQuery}"`;
  }
  const filterGroups = [];
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

  return await postWithExceptions("/CommerceHub/Products/SearchProducts", {
    param: {
      continuation_token: continuationToken,
      store_id: storeId,
      limit: limit,
      filter_groups: filterGroups,
      search_text: searchText,
    },
  });
}
