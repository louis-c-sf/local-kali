import produce from "immer";
import { moveItem } from "../../AssignmentRules/helpers/swapOrderables";
import { OptionType } from "../NewColumnModal";

export type ContactFieldAction =
  | { type: "OPTIONS_LOADED"; options: OptionType[] }
  | { type: "OPTION_VALUE_UPDATED"; value: string; index: number }
  | { type: "OPTION_ADDED" }
  | { type: "OPTION_MOVED"; from: number; to: number }
  | { type: "OPTION_REMOVED"; index: number };

export type ContactFieldState = {
  options: OptionType[];
};

export const contactFieldReducer = produce(
  (draft: ContactFieldState, action: ContactFieldAction) => {
    switch (action.type) {
      case "OPTIONS_LOADED":
        draft.options = action.options;
        break;

      case "OPTION_VALUE_UPDATED":
        if (draft.options[action.index]) {
          draft.options[action.index].value = action.value;
        }
        break;

      case "OPTION_ADDED":
        draft.options.push({ id: draft.options.length, value: "" });
        break;

      case "OPTION_REMOVED":
        draft.options.splice(action.index, 1);
        break;

      case "OPTION_MOVED":
        draft.options = moveItem(draft.options, action.from, action.to);
        break;
    }
  }
);
