import React, { useCallback } from "react";
import {
  ContactsStateType,
  ContactActionType,
} from "container/Contact/hooks/ContactsStateType";
import {
  UpdatePageEvent,
  SelectAllContext,
  SelectAllMachineEvent,
} from "xstate/selectAllIItemsMachine";
import { State } from "xstate";
import { useSelectAllBehavior } from "xstate/hooks/useSelectAllBehavior";
import {
  ContactsPageFetcher,
  ContactsRequestPageExtensionType,
} from "api/Contacts/types";

export function useFetchContactsContextPage(props: {
  state: ContactsStateType;
  dispatch: React.Dispatch<ContactActionType>;
  fetchContactsPage: ContactsPageFetcher;
  pageSize: number;
  selectAllMachineState: State<SelectAllContext, SelectAllMachineEvent>;
  selectAllSend: ReturnType<typeof useSelectAllBehavior>["send"];
}) {
  const { state, dispatch } = props;
  const scopeState = state.scopeState.default;

  const isAllSelected = props.selectAllMachineState.matches("selectedAll");

  return useCallback(
    async (extend: ContactsRequestPageExtensionType = {}) => {
      dispatch({ type: "PAGE_LOAD_START" });
      try {
        const page = extend.page ?? state.activePage;
        const result = await props.fetchContactsPage(
          page,
          extend.sort ?? scopeState.sortParams,
          props.pageSize,
          extend,
          isAllSelected
        );
        const includeCounts = extend.includeCounts ?? false;
        const total = result.totalFiltered;
        const totalUnfiltered = result.totalUnfiltered;
        let updateItemsTotals = {};
        if (includeCounts) {
          updateItemsTotals = {
            itemsTotal: result.totalFiltered,
            itemsTotalUnfiltered: result.totalUnfiltered,
          };
        }
        dispatch({
          type: "PAGE_LOAD_END",
          ...updateItemsTotals,
          pagesTotal: Math.ceil(total / props.pageSize),
          profiles: result.items || [],
          page,
        });

        let event: UpdatePageEvent = {
          type: "UPDATE_SELECTION",
          pageIds: result.items.map((i) => i.id),
          total,
          totalUnfiltered,
          targetIds:
            result.selectedIds ?? props.selectAllMachineState.context.targetIds,
          pageSize: props.pageSize,
          pageNumber: page,
          pagesCount: Math.ceil(total / props.pageSize),
        };
        // update state machine on external conditions changed
        props.selectAllSend(event);
      } catch (e) {
        console.error(e);
        dispatch({ type: "PAGE_LOAD_STOP" });
      }
    },
    [
      dispatch,
      props.fetchContactsPage,
      state.activePage,
      JSON.stringify(scopeState.sortParams),
      isAllSelected,
    ]
  );
}
