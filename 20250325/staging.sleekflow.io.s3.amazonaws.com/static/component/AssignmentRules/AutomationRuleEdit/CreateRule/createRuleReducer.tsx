import produce from "immer";
import { createContext } from "react";

export type CreateRuleStateType = {
  strategy: "customize" | "template" | null;
};

export type CreateRuleActionType =
  | {
      type: "CHANGE_STRATEGY";
      strategy: CreateRuleStateType["strategy"];
    }
  | {
      type: "RESET";
    };

export function createRuleDefaultState(): CreateRuleStateType {
  return {
    strategy: null,
  };
}

export const createRuleReducer = produce(
  (draft: CreateRuleStateType, action: CreateRuleActionType) => {
    switch (action.type) {
      case "RESET":
        draft.strategy = null;
        return;

      case "CHANGE_STRATEGY":
        draft.strategy = action.strategy;
        return;
    }
  }
);

export const CreateRuleContext = createContext<CreateRuleStateType>(
  createRuleDefaultState()
);
