import {
  DataGridStateType,
  DataGridActionType,
  ShowItemAction,
  DataLoadedAction,
  SortUpdateAction,
  UpdateFilterAction,
} from "../components/ObjectsGrid/DataGridStateType";
import produce from "immer";
import { Reducer } from "react";
import { mergeDeepRight, equals } from "ramda";

export function createFilteredGridReducer<
  Filter,
  Item,
  State extends DataGridStateType<Filter, Item>,
  Action extends DataGridActionType<Filter, Item>
>(defaultFilter: Filter): Reducer<State, Action> {
  function isDataLoadedAction<Filter>(
    action: Action
  ): action is Action & DataLoadedAction<Filter> {
    return action.type === "DATA_LOADED";
  }

  function isShowItemAction<Item>(
    action: Action
  ): action is Action & ShowItemAction<Item> {
    return action.type === "SHOW_LEAD";
  }

  function isSortUpdateAction(
    action: Action
  ): action is Action & SortUpdateAction {
    return action.type === "SORT_UPDATE";
  }

  function isFilterUpdateAction<Filter>(
    action: Action
  ): action is Action & UpdateFilterAction<Filter> {
    return action.type === "FILTER_UPDATE";
  }

  return produce((draft: State, action: Action) => {
    if (isDataLoadedAction<Filter>(action)) {
      draft.filterPrevious = action.filter;
      draft.filter = action.filter;
    } else if (isShowItemAction<Item>(action)) {
      draft.detailData = action.data;
      draft.detailVisible = true;
    } else if (action.type === "FILTER_RESET") {
      draft.filter = defaultFilter;
      draft.isFilterApplied = false;
    } else if (action.type === "HIDE_LEAD") {
      draft.detailData = null;
      draft.detailVisible = false;
    } else if (isFilterUpdateAction<Filter>(action)) {
      const newFilter = mergeDeepRight(
        draft.filter as {},
        action.values
      ) as Filter;
      draft.isFilterApplied = !equals(newFilter, defaultFilter);
      draft.filter = newFilter;
    } else if (isSortUpdateAction(action)) {
      draft.sort = action.sort;
    }
  }) as Reducer<State, Action>;
}
