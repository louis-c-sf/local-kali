import React from "react";
import { UserProfileGroupType } from "./UserProfileGroupType";
import produce from "immer";
import { update, whereEq, evolve } from "ramda";
import { LIMIT } from "./ListsDashboard";

export interface ListPagination {
  page: number;
  pagesCount: number;
  itemsCount: number;
}

export type BatchItemType = { id: number; checked: boolean };

export interface ListDashboardState {
  list: UserProfileGroupType[];
  mounting: boolean;
  loading: boolean;
  batchButtonEnabled: boolean;
  batchItems: BatchItemType[];
  batchOperationToggleChecked: boolean;
  batchOperationInProgress: boolean;
  createCampaignClicked: boolean;
  error: any;
  checkedIds: number[];
  pagination: ListPagination;
  exportId: number | undefined;
  search: {
    query: string;
    loading: boolean;
    activeQuery?: string;
  };
}

export type ListDashboardAction =
  | { type: "RESET_STATE" }
  | { type: "PAGE_LOADING"; page: number }
  | {
      type: "PAGE_LOADED";
      data: { userGroups: UserProfileGroupType[]; totalGroups: number };
      page: number;
    }
  | { type: "BATCH_SELECT_TOGGLE"; checked: boolean }
  | { type: "ITEM_SELECT_TOGGLE"; checked: boolean; id: number }
  | { type: "BATCH_DELETE_START" }
  | { type: "BATCH_DELETE_END" }
  | { type: "CREATE_CAMPAIGN" }
  | { type: "ERROR"; error: any }
  | { type: "EXPORT_STARTED"; id: number }
  | { type: "EXPORT_COMPLETED" }
  | { type: "EXPORT_ERROR"; error: any }
  | { type: "LIST_STATUS_UPDATE"; list: UserProfileGroupType }
  | { type: "BOOKMARK_STARTED"; listId: number }
  | { type: "BOOKMARK_RESET"; listId: number }
  | { type: "BOOKMARK_COMPLETED" }
  | { type: "REORDER_COMPLETED"; items: UserProfileGroupType[] }
  | { type: "REORDER_RESTORED"; items: UserProfileGroupType[] }
  | { type: "SEARCH_TYPED"; text: string }
  | { type: "SEARCH_RESET" };

export const defaultState = (): ListDashboardState => {
  return {
    exportId: undefined,
    list: [],
    loading: false,
    mounting: true,
    batchButtonEnabled: false,
    batchItems: [],
    checkedIds: [],
    batchOperationToggleChecked: false,
    batchOperationInProgress: false,
    createCampaignClicked: false,
    error: "",
    pagination: {
      page: 1,
      pagesCount: 0,
      itemsCount: 0,
    },
    search: {
      query: "",
      loading: false,
      activeQuery: undefined,
    },
  };
};

const reducer = (state: ListDashboardState, action: ListDashboardAction) => {
  switch (action.type) {
    case "RESET_STATE": {
      return defaultState();
    }

    case "PAGE_LOADING":
      return {
        ...state,
        loading: true,
        pagination: { ...state.pagination, page: action.page },
      };

    case "PAGE_LOADED":
      return {
        ...state,
        loading: false,
        list: action.data.userGroups,
        checkedIds: [],
        batchItems: checkAll(action.data.userGroups, false),
        batchOperationToggleChecked: false,
        batchButtonEnabled: false,
        batchOperationInProgress: false,
        pagination: {
          page: action.page,
          pagesCount: Math.ceil(action.data.totalGroups / LIMIT),
          itemsCount: action.data.totalGroups,
        },
        mounting: false,
        search: {
          ...state.search,
          activeQuery: state.search.query,
        },
      };

    case "BATCH_SELECT_TOGGLE":
      let batchItems = checkAll(state.list, action.checked);

      return {
        ...state,
        batchOperationToggleChecked: action.checked,
        batchButtonEnabled: action.checked,
        batchItems: batchItems,
        checkedIds: getCheckedIds(state.list, batchItems),
      };

    case "ITEM_SELECT_TOGGLE":
      const updateIndex = state.batchItems.findIndex(
        whereEq({ id: action.id })
      );
      const itemsUpdated = update(
        updateIndex,
        { id: action.id, checked: action.checked },
        state.batchItems
      );
      let checkedNumber = itemsUpdated.filter(
        whereEq({ checked: true })
      ).length;
      return {
        ...state,
        batchItems: itemsUpdated,
        batchOperationToggleChecked: checkedNumber === state.list.length,
        batchButtonEnabled: checkedNumber > 0,
        checkedIds: getCheckedIds(state.list, itemsUpdated),
      };

    case "BATCH_DELETE_START":
      return { ...state, loading: true, batchOperationInProgress: true };

    case "BATCH_DELETE_END":
      return {
        ...state,
        loading: false,
        batchOperationInProgress: false,
        batchItems: checkAll(state.list, false),
        batchButtonEnabled: false,
        batchOperationToggleChecked: false,
        checkedIds: [],
      };

    case "CREATE_CAMPAIGN":
      return {
        ...state,
        createCampaignClicked: true,
      };

    case "ERROR":
      return {
        ...state,
        loading: false,
        batchOperationInProgress: false,
        error: action.error,
      };

    case "EXPORT_STARTED":
      return {
        ...state,
        exportId: action.id,
      };

    case "EXPORT_COMPLETED":
      return {
        ...state,
        exportId: undefined,
      };

    case "EXPORT_ERROR":
      console.error(action.type, action.error);
      return {
        ...state,
      };

    case "LIST_STATUS_UPDATE":
      if (!action?.list?.id) {
        return { ...state };
      }
      let listUpdated: UserProfileGroupType[];
      if (
        state.pagination.pagesCount === 1 &&
        state.list.length < LIMIT &&
        !state.list.some(whereEq({ id: action.list.id }))
      ) {
        listUpdated = [action.list, ...state.list];
      } else {
        listUpdated = state.list.reduce(
          (acc: UserProfileGroupType[], item: UserProfileGroupType) => {
            if (item.id === action.list.id) {
              return acc.concat(action.list);
            }
            return acc.concat(item);
          },
          []
        );
      }

      return {
        ...state,
        list: listUpdated,
      };

    case "BOOKMARK_STARTED":
      return produce(state, (draft) => {
        const updateItem = draft.list.find(
          (group) => group.id === action.listId
        );
        if (updateItem) {
          updateItem.isBookmarked = !updateItem.isBookmarked;
        }
        draft.loading = true;
      });

    case "BOOKMARK_RESET":
      return produce(state, (draft) => {
        const updateItem = draft.list.find(
          (group) => group.id === action.listId
        );
        if (updateItem) {
          updateItem.isBookmarked = !updateItem.isBookmarked;
        }
        draft.loading = false;
      });

    case "BOOKMARK_COMPLETED":
      return { ...state, loading: false };

    case "REORDER_COMPLETED":
      return { ...state, list: [...action.items] };

    case "REORDER_RESTORED":
      return { ...state, list: [...action.items] };

    case "SEARCH_TYPED":
      return evolve(
        {
          search: {
            query: () => action.text,
          },
        },
        state
      );

    case "SEARCH_RESET":
      return evolve(
        {
          search: {
            query: () => "",
            activeQuery: () => undefined,
          },
        },
        state
      );
  }

  return state;
};
export default reducer;

function checkAll(list: Array<UserProfileGroupType>, checked: boolean) {
  return list.map(({ id }) => ({ id, checked }));
}

function getCheckedIds(
  list: UserProfileGroupType[],
  batchItems: BatchItemType[]
): number[] {
  return list.reduce<number[]>((all, item) => {
    if (batchItems.find(whereEq({ id: item.id, checked: true }))) {
      return [...all, item.id];
    }
    return all;
  }, []);
}
