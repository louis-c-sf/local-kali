import { Action, LoginType } from "../../types/LoginType";
import produce from "immer";
import { initialUser } from "../../context/LoginContext";

export const usageReducer = produce(
  (draft: LoginType = initialUser, action: Action) => {
    switch (action.type) {
      case "USAGE_UPDATED":
        draft.usage = {
          ...draft.usage,
          ...action.usage,
        };
        break;
    }
  }
);
