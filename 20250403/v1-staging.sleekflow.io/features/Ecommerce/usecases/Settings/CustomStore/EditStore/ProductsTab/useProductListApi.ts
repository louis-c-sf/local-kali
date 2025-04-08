import { useState, useReducer } from "react";
import { ProductType } from "core/models/Ecommerce/Catalog/ProductType";
import {
  fetchStoreProducts,
  ProductsPaginatedResponseType,
} from "api/CommerceHub/fetchStoreProducts";
import { defaultState, createProductsListReducer } from "./productsListReducer";
import { useLoadGroupPaginatedPage } from "features/Salesforce/components/ObjectsGrid/useLoadGroupPaginatedPage";
import { fetchSearchStoreProducts } from "api/CommerceHub/fetchSearchStoreProducts";
import { submitDuplicateProducts } from "api/CommerceHub/submitDuplicateProducts";
import { fetchStoreCurrencies } from "api/CommerceHub/fetchStoreCurrencies";
import { submitUpdateProduct } from "api/CommerceHub/submitUpdateProduct";
import {
  createUpdateProductPayload,
  normalizedDescription,
} from "../../EditProduct/createUpdateProductPayload";

export type ProductListInterface = ReturnType<typeof useProductListApi>;

export interface ProductListFilter {
  search: string;
}

export function useProductListApi(props: {
  storeId: string;
  pageSize: number;
  pageGroupsSize: number;
  visibleOnly: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [booted, setBooted] = useState<{ currencies: string[] }>();
  const [query, setQuery] = useState<string>("");
  const [itemLoadingId, setItemLoadingId] = useState<string>();

  const [state, dispatch] = useReducer(
    createProductsListReducer(props.pageSize, props.pageGroupsSize),
    defaultState()
  );
  const pagination = useLoadGroupPaginatedPage<ProductType, ProductListFilter>({
    dispatch,
    state,
    pageSize: props.pageSize,
    pagesPerGroup: props.pageGroupsSize,
    fetchData: async (filters, sorts, limit, offsetToken) => {
      let response: ProductsPaginatedResponseType;
      if (filters.search) {
        response = await fetchSearchStoreProducts(
          props.storeId,
          filters.search,
          offsetToken ?? null,
          props.pageSize * props.pageGroupsSize,
          props.visibleOnly,
          false
        );
      } else {
        response = await fetchStoreProducts(
          props.storeId,
          offsetToken ?? null,
          props.pageSize * props.pageGroupsSize,
          props.visibleOnly
        );
      }
      return {
        continuation_token: response.data.continuation_token ?? undefined,
        count: response.data.count,
        records: response.data.products,
      };
    },
  });

  const boot = async () => {
    setQuery("");
    const [currencies, firstPage] = await Promise.all([
      fetchStoreCurrencies(props.storeId),
      pagination.loadPage(1, { filter: { search: "" } }),
    ]);
    setBooted({
      currencies:
        currencies?.data.currencies.map((c) => c.currency_iso_code) ?? [],
    });
    return firstPage;
  };

  const refresh = async () =>
    pagination.loadPage(state.continuousPager.pageGroup, {});

  return {
    items: state.continuousPager.pageResults,
    groupItemsCount: state.continuousPager.groupResults.length,
    loading: pagination.loading || loading,
    page: state.continuousPager.page,
    prevToken: state.continuousPager.nearestGroupTokens.prev,
    nextToken: state.continuousPager.nearestGroupTokens.next,
    booted,
    query,
    setQuery,
    itemLoadingId,
    boot: boot,

    setPage(number: number) {
      pagination.changePage(number);
    },

    async loadNextPageGroup() {
      return pagination.loadNextGroup();
    },

    async loadPrevPageGroup() {
      return pagination.loadPrevGroup();
    },

    refresh: refresh,

    async searchBy(query: string) {
      return await pagination.loadPage(1, { filter: { search: query } });
    },

    async toggleDisplay(id: string) {
      const productToUpdate = state.continuousPager.groupResults.find(
        (prod) => prod.id === id
      );
      if (!productToUpdate) {
        return;
      }
      const {
        is_view_enabled,
        prices,
        product_variant_prices,
        attributes = [],
        ...fields
      } = productToUpdate;
      setItemLoadingId(id);
      try {
        await submitUpdateProduct({
          ...fields,
          descriptions: fields.descriptions.map(normalizedDescription),
          is_view_enabled: !is_view_enabled,
          prices: prices ?? product_variant_prices,
          attributes,
        });
        refresh();
      } catch (e) {
        console.error(e);
      } finally {
        setItemLoadingId(undefined);
      }
    },

    async duplicateRecords(ids: string[]) {
      setLoading(true);
      try {
        await submitDuplicateProducts(props.storeId, ids);
        await pagination.loadPage(state.continuousPager.pageGroup, {});
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    },
  };
}
