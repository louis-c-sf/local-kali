import { SortType } from "../../API/Objects/contracts";
import { equals } from "ramda";
import React, { useState } from "react";
import {
  ObjectsGridStateType,
  ObjectsGridActionType,
} from "./ObjectsGridContextType";

interface ResponseType<TItem extends any> {
  continuation_token?: string;
  count: number;
  records: Array<TItem>;
}

export function useLoadGroupPaginatedPage<
  Item extends any,
  Filter extends any
>(props: {
  pageSize: number;
  pagesPerGroup: number;
  fetchData: (
    filters: Filter,
    sorts: SortType[],
    limit: number,
    pageToken?: string
  ) => Promise<ResponseType<Item>>;
  state: ObjectsGridStateType<Item, Filter>;
  dispatch: React.Dispatch<ObjectsGridActionType<Item, Filter>>;
}) {
  const { fetchData, pageSize, pagesPerGroup, dispatch, state } = props;

  const [loading, setLoading] = useState(false);

  async function loadPage(
    pageGroup: number,
    override: {
      filter?: Filter;
      sort?: SortType[] | null;
    }
  ) {
    let pageToken: string | null = null;
    if (pageGroup > state.continuousPager.pageGroup) {
      pageToken = state.continuousPager.nearestGroupTokens.next;
    } else if (pageGroup < state.continuousPager.pageGroup) {
      pageToken = state.continuousPager.nearestGroupTokens.prev;
    } else if (state.continuousPager.pageGroup !== 1 && pageToken === null) {
      return;
    }

    setLoading(true);
    const filter = override.filter ?? state.filter;
    const sort = override.sort === undefined ? state.sort : override.sort;

    const isFilterChanged = !equals(state.filterPrevious, filter);
    const pageGroupNumber = pageToken !== undefined ? pageGroup : 1;

    try {
      const results = await fetchData(
        filter,
        sort ?? [],
        pageSize * pagesPerGroup,
        pageToken ?? undefined
      );

      const action: ObjectsGridActionType<Item, Filter> = {
        type: "DATA_LOADED",
        pageGroup: pageGroupNumber,
        continuationToken: results.continuation_token ?? null,
        resetTokens: isFilterChanged,
        filter,
        groupResults: results.records as Item[],
      };
      dispatch(action);
      return results;
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function loadNextGroup() {
    loadPage(state.continuousPager.pageGroup + 1, { filter: state.filter });
  }

  function loadPrevGroup() {
    loadPage(state.continuousPager.pageGroup - 1, { filter: state.filter });
  }

  function changePage(page: number) {
    dispatch({ type: "SET_PAGE", page });
  }

  function changeSort(by: SortType[] | null) {
    loadPage(state.continuousPager.pageGroup, {
      sort: by,
    });
  }

  function changeFilter(filter: Filter) {
    dispatch({ type: "FILTER_UPDATE", values: filter });
  }

  return {
    changePage,
    changeSort,
    changeFilter,
    loadPage,
    loadNextGroup,
    loadPrevGroup,
    loading,
  };
}
