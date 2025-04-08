import {
  FilterGroupType,
  ObjectNormalizedExpandedType,
} from "../../API/Objects/contracts";
import React from "react";
import {
  FetchObjectsInterface,
  ObjectsGridStateType,
  ObjectsGridActionType,
} from "./ObjectsGridContextType";
import { useLoadGroupPaginatedPage } from "features/Salesforce/components/ObjectsGrid/useLoadGroupPaginatedPage";

export function useLoadObjectsPage<
  Item extends ObjectNormalizedExpandedType<any>,
  Filter
>(props: {
  pageSize: number;
  pagesPerGroup: number;
  normalizeFilters: (filter: Filter) => FilterGroupType[];
  fetchData: FetchObjectsInterface<Item>;
  state: ObjectsGridStateType<Item, Filter>;
  dispatch: React.Dispatch<ObjectsGridActionType<Item, Filter>>;
}) {
  const loader = useLoadGroupPaginatedPage<Item, Filter>({
    dispatch: props.dispatch,
    pageSize: props.pageSize,
    pagesPerGroup: props.pagesPerGroup,
    state: props.state,
    fetchData: async (filters, sorts, limit, pageToken) => {
      let sortNormalized = sorts ? [...sorts] : null;
      if (sortNormalized && sortNormalized.length > 0) {
        sortNormalized = sortNormalized.map((s) => ({
          ...s,
          field_name: `unified:${s.field_name}`,
        }));
      }

      return await props.fetchData(
        props.normalizeFilters(filters),
        sortNormalized ?? [],
        limit,
        pageToken
      );
    },
  });

  return {
    changePage: loader.changePage,
    changeSort: loader.changeSort,
    loadPage: loader.loadPage,
    loadNextGroup: loader.loadNextGroup,
    loadPrevGroup: loader.loadPrevGroup,
    loading: loader.loading,
  };
}
