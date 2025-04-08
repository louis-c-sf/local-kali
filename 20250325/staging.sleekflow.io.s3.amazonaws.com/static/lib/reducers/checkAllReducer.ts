import produce from "immer";
import { equals, innerJoin, reject, uniq } from "ramda";

export type AllCheckableState<TId> = {
  checkableItems: {
    allIds: TId[];
    allChecked: boolean;
    checkedIds: TId[];
  };
};
export type AllCheckableAction<TId> =
  | {
      type: "CHECKED_ITEM";
      id: TId;
    }
  | {
      type: "UNCHECKED_ITEM";
      id: TId;
    }
  | {
      type: "CHECKED_ALL";
    }
  | {
      type: "UNCHECKED_ALL";
    }
  | {
      type: "CHECKABLE_IDS_UPDATED";
      newIdList: TId[];
    };

//todo add tests
export function createCheckAllReducer<
  TId,
  TState extends AllCheckableState<TId>
>() {
  return produce(
    (
      draft: AllCheckableState<TId>,
      action: { type: string } | AllCheckableAction<TId>
    ) => {
      function isCheckableAction(x: {
        type: string;
      }): x is AllCheckableAction<any> {
        return [
          "CHECKED_ITEM",
          "UNCHECKED_ITEM",
          "CHECKED_ALL",
          "UNCHECKED_ALL",
          "CHECKABLE_IDS_UPDATED",
        ].includes(x.type);
      }

      if (!isCheckableAction(action)) {
        return;
      }
      const subState = draft.checkableItems;
      switch (action.type) {
        case "CHECKED_ITEM":
          subState.checkedIds = uniq([...subState.checkedIds, action.id]);
          subState.allChecked =
            subState.checkedIds.length === subState.allIds.length;
          break;

        case "UNCHECKED_ITEM":
          subState.checkedIds = reject(equals(action.id), subState.checkedIds);
          subState.allChecked = false;
          break;

        case "CHECKED_ALL":
          subState.checkedIds = draft.checkableItems.allIds;
          subState.allChecked = true;
          break;

        case "UNCHECKED_ALL":
          subState.checkedIds = [];
          subState.allChecked = false;
          break;

        case "CHECKABLE_IDS_UPDATED":
          subState.allIds = action.newIdList;
          subState.checkedIds = innerJoin(
            equals,
            subState.checkedIds,
            action.newIdList
          );
          const allIds = subState.allIds;
          subState.allChecked =
            allIds.length > 0 && allIds.length === subState.checkedIds.length;
          break;
      }
    }
  );
}
