import { SortType } from "../../API/Objects/contracts";

export type DataGridStateType<Filter extends {}, Item extends any> = {
  filter: Filter;
  filterPrevious: Filter | null;
  /** @deprecated */
  isFilterApplied: boolean;
  detailVisible: boolean;
  detailData: Item | null;
  sort: SortType[] | null;
};

export type ShowItemAction<Item> = {
  type: "SHOW_LEAD";
  data: Item;
};

export type HideItemAction = {
  type: "HIDE_LEAD";
};

export type UpdateFilterAction<Filter extends {}> = {
  type: "FILTER_UPDATE";
  values: Partial<Filter>;
};

export type DataLoadedAction<Filter extends {}> = {
  type: "DATA_LOADED";
  filter: Filter;
};

export type SortUpdateAction = {
  type: "SORT_UPDATE";
  sort: SortType[] | null;
};

export type DataGridActionType<Filter extends {}, Item extends any> =
  | ShowItemAction<Item>
  | HideItemAction
  | UpdateFilterAction<Filter>
  | {
      type: "FILTER_RESET";
    }
  | DataLoadedAction<Filter>
  | SortUpdateAction;

export function defaultDataGridState<Filter extends {}, Item extends any>(
  defaultFilter: Filter
): DataGridStateType<Filter, Item> {
  return {
    filter: { ...defaultFilter },
    isFilterApplied: false,
    sort: null,
    detailData: null,
    detailVisible: false,
    filterPrevious: null,
  };
}
