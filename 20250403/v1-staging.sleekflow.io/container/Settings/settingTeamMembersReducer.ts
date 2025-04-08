import produce from "immer";
import { reduceReducers } from "../../utility/reduce-reducers";
import {
  AllCheckableAction,
  AllCheckableState,
  createCheckAllReducer,
} from "../../lib/reducers/checkAllReducer";
import {
  createEditTeamReducer,
  EditableTeamsAction,
  EditableTeamsState,
} from "../../component/Settings/SettingTeams/editTeamReducer";

export type SettingTeamMembersState = {
  showForm: boolean;
  itemsLoading: boolean;
  formLoading: boolean;
  deleteLoading: boolean;
  isSearching: boolean;
} & AllCheckableState<string> &
  EditableTeamsState;

export type SettingTeamMembersAction =
  | {
      type: "ITEMS_LOAD_START";
    }
  | {
      type: "ITEMS_LOAD_COMPLETE";
    }
  | {
      type: "ADD_MEMBERS_CLICK";
    }
  | {
      type: "ADD_MEMBERS_CANCEL";
    }
  | {
      type: "ADD_MEMBERS_START";
    }
  | {
      type: "ADD_MEMBERS_COMPLETE";
    }
  | {
      type: "DELETE_START";
    }
  | {
      type: "DELETE_COMPLETE";
    }
  | AllCheckableAction<string>
  | EditableTeamsAction;

const settingMembersReducer = produce(
  (state: SettingTeamMembersState, action: SettingTeamMembersAction) => {
    switch (action.type) {
      case "ITEMS_LOAD_START":
        state.itemsLoading = true;
        break;

      case "ITEMS_LOAD_COMPLETE":
        state.itemsLoading = false;
        break;

      case "ADD_MEMBERS_CLICK":
        state.showForm = true;
        break;

      case "ADD_MEMBERS_START":
        state.formLoading = true;
        break;

      case "ADD_MEMBERS_COMPLETE":
        state.formLoading = false;
        state.showForm = false;
        break;

      case "ADD_MEMBERS_CANCEL":
        state.showForm = false;
        break;

      case "DELETE_START":
        state.deleteLoading = true;
        break;

      case "DELETE_COMPLETE":
        state.deleteLoading = false;
        state.showForm = false;
        break;
    }
  }
);

export const settingTeamMembersReducer = reduceReducers(
  settingMembersReducer,
  createCheckAllReducer(),
  createEditTeamReducer()
);

export function defaultState(): SettingTeamMembersState {
  return {
    formLoading: false,
    deleteLoading: false,
    isSearching: false,
    showForm: false,
    itemsLoading: false,
    checkableItems: {
      allChecked: false,
      allIds: [],
      checkedIds: [],
    },
    teamsEditForm: {
      show: false,
    },
  };
}
