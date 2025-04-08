import { LoginType, Action } from "../../types/LoginType";
import { initialUser } from "../../context/LoginContext";
import produce from "immer";

export function automationRulesReducer(
  state: LoginType = initialUser,
  action: Action
): LoginType {
  switch (action.type) {
    case "AUTOMATIONS_LOAD_COMPLETE":
      return produce(state, (draft) => {
        draft.automationRules = action.automationRules;
        draft.automations.booted = true;
      });
    case "AUTOMATION_RULE_SELECTED":
      return {
        ...state,
        automations: {
          ...state.automations,
          selected: action.selectedAutomationRule,
        },
      };
    case "UPDATE_SELECTED_AUTOMATION_HISTORIES":
      if (state.automations.selected) {
        return {
          ...state,
          automations: {
            ...state.automations,
            selected: {
              ...state.automations.selected,
              automationHistories: action.automationHistories,
            },
          },
        };
      }
      return state;
  }
  return state;
}
