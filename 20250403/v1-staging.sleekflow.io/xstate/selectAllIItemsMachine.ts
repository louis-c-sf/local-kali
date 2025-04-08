import {
  AnyEventObject,
  assign,
  DoneEventObject,
  Machine,
  State,
  StateSchema,
} from "xstate";
import { equals } from "ramda";

export interface SelectAllContext {
  total: number;
  totalUnfiltered: number;
  targetIds: string[];
  targetIdsCount: number;
  pageIds: string[];
  error: string | undefined;
  hasSelectedAll: boolean;
}

export interface SelectAllStateSchema extends StateSchema {
  states: {
    unloaded: {};
    selectedNone: {};
    selectedSome: {};
    selectedPage: {};
    selectedAll: {};
    pending: {};
  };
}

export interface SelectAllEvent {
  type: "SELECT_ALL";
}

interface SelectEvent {
  type: "SELECT";
  id: string;
}

interface TogglePageEvent {
  type: "TOGGLE_PAGE";
}

interface DeselectEvent {
  type: "DESELECT";
  id: string;
}
export interface DeselectAllEvent {
  type: "DESELECT_ALL";
}

export interface UpdatePageEvent {
  type: "UPDATE_SELECTION";
  pageIds: string[];
  total: number;
  totalUnfiltered: number;
  targetIds: string[];
  pageSize: number;
  pageNumber: number;
  pagesCount: number;
}

interface TotalResponseEvent {
  type: "done.invoke.loadTotalsPromise";
  total: number;
  idList: string[];
}

export type SelectAllMachineEvent =
  | { type: "DESELECT_ALL" }
  | { type: "CANCEL" }
  | SelectAllEvent
  | SelectEvent
  | DeselectEvent
  | TotalResponseEvent
  | TogglePageEvent
  | UpdatePageEvent;

export interface TotalResponseData {
  total: number;
  targetIds: string[];
}

interface AsyncTotalResponseEvent extends DoneEventObject {
  data: TotalResponseData;
}

export type SelectAllMachineStateType = State<
  SelectAllContext,
  SelectAllMachineEvent,
  SelectAllStateSchema
>;

export const selectAllItemsMachine = Machine<
  SelectAllContext,
  SelectAllStateSchema,
  SelectAllMachineEvent
>({
  id: "selectAll",
  initial: "unloaded",
  context: {
    total: 0,
    totalUnfiltered: 0,
    targetIds: [],
    targetIdsCount: 0,
    pageIds: [],
    error: undefined,
    hasSelectedAll: false,
  },
  on: {
    UPDATE_SELECTION: {
      target: ".selectedNone",
      actions: assign({
        targetIds: (c, e) => deselectAll(),
        targetIdsCount: (c, e) => resetTargetIdsCount(),
        pageIds: (c, e) => e.pageIds,
        total: (c, e) => e.total,
        totalUnfiltered: (c, e) => e.totalUnfiltered,
      }),
    },
  },
  states: {
    unloaded: {},

    selectedNone: {
      on: {
        SELECT: {
          target: "selectedSome",
          actions: assign({
            targetIds: (c, e) => selectId(c, e),
            targetIdsCount: (c, e) => incrementTargetIdsCount(c, e),
          }),
        },
        TOGGLE_PAGE: {
          target: "selectedPage",
          actions: [assign(selectPage)],
          cond: (c) => c.pageIds.length > 0,
        },
      },
    },

    selectedSome: {
      on: {
        "": [
          {
            target: "selectedPage",
            cond: (c: SelectAllContext, e) => {
              return equals(
                c.targetIds.sort(byIdAsc()),
                c.pageIds.sort(byIdAsc())
              );
            },
          },
          {
            target: "selectedNone",
            cond: (c: SelectAllContext, e) => {
              return c.targetIds.length === 0;
            },
          },
        ],

        SELECT: {
          actions: [
            assign({
              targetIds: (c, e) => selectId(c, e),
              targetIdsCount: (c, e) => incrementTargetIdsCount(c, e),
            }),
          ],
        },

        DESELECT: {
          actions: [
            assign({
              targetIds: (c, e) => deselectId(c, e),
              targetIdsCount: (c, e) => decrementTargetIdsCount(c, e),
            }),
          ],
        },
        TOGGLE_PAGE: {
          target: "selectedPage",
          actions: [assign(selectPage)],
        },
        DESELECT_ALL: "selectedNone",
        SELECT_ALL: "pending",
      },
    },

    selectedPage: {
      on: {
        DESELECT: {
          target: "selectedSome",
          actions: [
            assign({
              targetIds: (c, e) => deselectId(c, e),
              targetIdsCount: (c, e) => decrementTargetIdsCount(c, e),
            }),
          ],
        },

        TOGGLE_PAGE: {
          target: "selectedNone",
          actions: [
            assign({
              targetIds: (c, e) => deselectAll(),
              targetIdsCount: (c, e) => resetTargetIdsCount(),
            }),
          ],
        },
        SELECT_ALL: "pending",
      },
    },

    pending: {
      invoke: {
        id: "loadTotalsPromise",
        src: "loadTotals",
        target: "selectedAll",

        onDone: {
          target: "selectedAll",
          actions: [
            assign({
              total: (c, event: AsyncTotalResponseEvent) => event.data.total,
              targetIdsCount: (c, event: AsyncTotalResponseEvent) =>
                event.data.total,
              targetIds: (c, event: AsyncTotalResponseEvent) =>
                event.data.targetIds,
              hasSelectedAll: (c, e) => true,
            }),
          ],
        },

        onError: {
          target: "selectedNone",
          actions: [
            assign({
              error: (c, event: any) => event.error,
            }),
          ],
        },
      },
    },

    selectedAll: {
      on: {
        DESELECT: {
          target: "selectedSome",
          actions: [
            assign({
              targetIds: (c, e: DeselectEvent) =>
                c.targetIds.filter((id) => id !== e.id),
              targetIdsCount: (c, e) => c.targetIds.length - 1,
            }),
          ],
        },

        DESELECT_ALL: {
          target: "selectedNone",
          actions: [
            assign({
              targetIds: (c, e) => deselectAll(),
              targetIdsCount: (c, e) => resetTargetIdsCount(),
              hasSelectedAll: (c, e) => false,
            }),
          ],
        },

        TOGGLE_PAGE: {
          target: "selectedNone",
          actions: [
            assign({
              targetIds: (c, e) => deselectAll(),
              targetIdsCount: (c, e) => resetTargetIdsCount(),
            }),
          ],
        },

        UPDATE_SELECTION: [
          {
            target: "selectedSome",
            actions: assign({
              targetIds: (c, e) => e.targetIds,
              targetIdsCount: (c, e) => e.targetIds.length,
              pageIds: (c, e) => [...e.pageIds],
              total: (c, e) => e.total,
            }),
            cond: (c, e) => {
              return (
                (e.pageIds.length < e.pageSize &&
                  e.pageNumber < e.pagesCount) ||
                e.pagesCount === 1
              );
            },
          },
          {
            actions: assign({
              targetIds: (c, e) => e.targetIds,
              targetIdsCount: (c, e) => e.targetIds.length,
              pageIds: (c, e) => [...e.pageIds],
              total: (c, e) => e.total,
            }),
          },
        ],
      },
    },
  },
});

function incrementTargetIdsCount(c: SelectAllContext, e: AnyEventObject) {
  return c.targetIdsCount + 1;
}

function decrementTargetIdsCount(
  c: Pick<SelectAllContext, "targetIdsCount">,
  e: AnyEventObject
) {
  return c.targetIdsCount - 1;
}

function selectPage(c: SelectAllContext) {
  return {
    targetIds: [...c.pageIds],
    targetIdsCount: c.pageIds.length,
  };
}

function selectId(c: SelectAllContext, e: SelectEvent): string[] {
  const id = (e as SelectEvent).id;
  const targetIds = c.targetIds;
  return targetIds.includes(id) ? [...targetIds] : targetIds.concat(id);
}

function deselectId(c: SelectAllContext, e: AnyEventObject) {
  const deselectedId = (e as DeselectEvent).id;
  return c.targetIds.filter((id) => id !== deselectedId);
}

function deselectAll() {
  return [];
}

function resetTargetIdsCount() {
  return 0;
}

function byIdAsc() {
  return (a: string, b: string) => {
    if (a.toLowerCase() === b.toLowerCase()) return 0;
    return a.toLowerCase() > b.toLowerCase() ? -1 : 1;
  };
}

export function getPageSize(s: SelectAllMachineStateType) {
  const c = s.context as SelectAllContext;
  return c.pageIds?.length || 0;
}

export function isAllSelected(s: SelectAllMachineStateType) {
  return Boolean(s.matches("selectedAll"));
}

export function isPageSelected(s: SelectAllMachineStateType) {
  return Boolean(s.matches("selectedPage"));
}

export function isPending(s: SelectAllMachineStateType) {
  return s.matches("pending");
}
export function isSelected(id: string, s: SelectAllMachineStateType) {
  const c = s.context as SelectAllContext;

  return s.matches("selectedAll") || c.targetIds?.includes(id) || false;
}
