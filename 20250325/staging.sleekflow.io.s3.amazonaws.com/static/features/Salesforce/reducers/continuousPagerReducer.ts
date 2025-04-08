import { Reducer } from "react";
import produce from "immer";
import { GroupingCountedPaginator } from "../../../lib/pagination/GroupingCountedPaginator";
import { equals } from "ramda";
import { ObjectsGridStateType } from "../components/ObjectsGrid/ObjectsGridContextType";
import { GroupingTokenPaginator } from "../../../lib/pagination/GroupingTokenPaginator";

export interface ContinuousPagerStateType<Result extends any> {
  continuousPager: {
    page: number;
    pageGroup: number;
    nearestGroupTokens: {
      prev: string | null;
      next: string | null;
      current: string | null;
    };
    hasMore: boolean;
    groupResults: Array<Result>;
    pageResults: Array<Result>;
  };
}

export function defaultContinuousPagerState<
  Result extends any
>(): ContinuousPagerStateType<Result> {
  return {
    continuousPager: {
      page: 1,
      pageGroup: 1,
      hasMore: true,
      nearestGroupTokens: { next: null, prev: null, current: null },
      groupResults: [],
      pageResults: [],
    },
  };
}

interface SetPageAction {
  type: "SET_PAGE";
  page: number;
}

interface UpdateCountAction {
  type: "SET_TOTAL_COUNT";
  count: number;
}

export type ContinuousPagerActionType<
  LoadedName extends string,
  Result extends any,
  LoadedExtraPayload extends {}
> =
  | PageLoadedAction<LoadedName, Result, LoadedExtraPayload>
  | SetPageAction
  | UpdateCountAction;

export type PageLoadedAction<
  LoadedName extends string,
  Result extends any,
  LoadedExtraPayload extends any
> = {
  type: LoadedName;
  pageGroup: number;
  continuationToken: string | null;
  resetTokens: boolean;
  groupResults: Array<Result>;
} & LoadedExtraPayload;

export function createContinuousPagerReducer<
  LoadedName extends string,
  Result extends any,
  LoadedExtraPayload extends any,
  Action extends ContinuousPagerActionType<
    LoadedName,
    Result,
    LoadedExtraPayload
  >,
  State extends ContinuousPagerStateType<Result>
>(
  loadedActionName: LoadedName,
  pageSize: number,
  pagesPerGroup: number
): Reducer<State, Action> {
  function isSetPageAction(a: { type: string }): a is SetPageAction {
    return "SET_PAGE" === a.type;
  }

  function isPagerLoadedAction(a: {
    type: string;
  }): a is PageLoadedAction<LoadedName, Result, LoadedExtraPayload> {
    return loadedActionName === a.type;
  }

  return produce((draft: State, action: Action) => {
    const slice = draft.continuousPager;

    if (isSetPageAction(action)) {
      slice.page = action.page;
      const paginator = new GroupingTokenPaginator(
        action.page,
        pageSize,
        pagesPerGroup,
        slice.groupResults.length,
        slice.nearestGroupTokens.prev,
        slice.nearestGroupTokens.next
      );

      const pageNumbers = paginator.getGroupPageNumbers();
      const pageIndexOffset = Math.max(
        pageNumbers.findIndex(equals(action.page)),
        0
      );

      slice.pageResults = slice.groupResults.slice(
        pageIndexOffset * pageSize,
        (pageIndexOffset + 1) * pageSize
      );
      return;
    }

    if (isPagerLoadedAction(action)) {
      slice.groupResults = action.groupResults;
      slice.pageResults = action.groupResults.slice(0, pageSize);

      if (!action.resetTokens) {
        if (action.continuationToken) {
          slice.hasMore = true;
        } else {
          slice.hasMore = false;
        }
        if (action.pageGroup > slice.pageGroup) {
          slice.nearestGroupTokens.prev = slice.nearestGroupTokens.current;
          slice.nearestGroupTokens.current = slice.nearestGroupTokens.next;
          slice.nearestGroupTokens.next = action.continuationToken ?? null;
        } else if (action.pageGroup < slice.pageGroup) {
          slice.nearestGroupTokens.next = slice.nearestGroupTokens.current;
          slice.nearestGroupTokens.current = slice.nearestGroupTokens.prev;
          slice.nearestGroupTokens.prev = null;
        } else {
          slice.nearestGroupTokens.next = action.continuationToken;
          slice.nearestGroupTokens.current = null;
          slice.nearestGroupTokens.prev = null;
        }
        slice.page = (action.pageGroup - 1) * pagesPerGroup + 1;
        slice.pageGroup = action.pageGroup;
      } else {
        slice.nearestGroupTokens = {
          prev: null,
          next: action.continuationToken ?? null,
          current: null,
        };
        slice.hasMore = false;
        slice.pageGroup = 1;
        slice.page = 1;
      }
      return;
    }
  }) as Reducer<State, Action>;
}
