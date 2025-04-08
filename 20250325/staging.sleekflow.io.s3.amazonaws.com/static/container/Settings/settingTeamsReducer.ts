import produce from "immer";
import { reduceReducers } from "../../utility/reduce-reducers";
import {
  AllCheckableAction,
  AllCheckableState,
  createCheckAllReducer,
} from "../../lib/reducers/checkAllReducer";
import { StaffType } from "../../types/StaffType";

type initStaffListType = {
  [key: string]: StaffType[];
};

export type SettingTeamsState = {
  itemsLoading: boolean;
  formLoading: boolean;
  deleteLoading: boolean;
  editMode: "create" | "update" | "post-create" | null;
  editTeamId: number | null;
  isSearching: boolean;
  initStaffList: initStaffListType;
} & AllCheckableState<number>;

export type SettingTeamsAction =
  | {
      type: "ITEMS_LOAD_START";
    }
  | {
      type: "ITEMS_LOAD_COMPLETE";
    }
  | {
      type: "CREATE_START";
    }
  | {
      type: "CREATE_CANCEL";
    }
  | {
      type: "EDIT_START";
    }
  | {
      type: "DELETE_PROMPT";
    }
  | {
      type: "DELETE_START";
    }
  | {
      type: "DELETE_CANCEL";
    }
  | {
      type: "DELETE_COMPLETE";
    }
  | {
      type: "SAVE_TEAM_START";
    }
  | {
      type: "SAVE_TEAM_ERROR";
    }
  | {
      type: "SAVE_TEAM_COMPLETE";
      teamId: number;
    }
  | {
      type: "SAVE_MEMBERS_START";
    }
  | {
      type: "SAVE_MEMBERS_ERROR";
    }
  | {
      type: "SAVE_MEMBERS_COMPLETE";
    }
  | AllCheckableAction<number>
  | {
      type: "UPDATE_INIT_STAFF_LIST";
      initStaffList: initStaffListType;
    };

const settingReducer = produce(
  (state: SettingTeamsState, action: SettingTeamsAction) => {
    switch (action.type) {
      case "ITEMS_LOAD_START":
        state.itemsLoading = true;
        break;

      case "ITEMS_LOAD_COMPLETE":
        state.itemsLoading = false;
        break;

      case "CREATE_START":
        state.editMode = "create";
        break;

      case "CREATE_CANCEL":
        state.editMode = null;
        break;

      case "EDIT_START":
        state.editMode = "update";
        break;

      case "DELETE_START":
        state.deleteLoading = true;
        break;

      case "DELETE_COMPLETE":
        state.deleteLoading = false;
        break;

      case "SAVE_TEAM_START":
      case "SAVE_MEMBERS_START":
        state.formLoading = true;
        break;

      case "SAVE_TEAM_ERROR":
      case "SAVE_MEMBERS_ERROR":
        state.formLoading = false;
        break;

      case "SAVE_TEAM_COMPLETE":
        state.formLoading = false;
        if (state.editMode === "create") {
          state.editMode = "post-create";
          state.editTeamId = action.teamId;
        } else if (state.editMode === "post-create") {
          state.editMode = null;
        }
        break;

      case "SAVE_MEMBERS_COMPLETE":
        state.formLoading = false;
        state.editMode = null;
        state.editTeamId = null;
        break;

      case "UPDATE_INIT_STAFF_LIST":
        state.initStaffList = action.initStaffList;
        break;
    }
  }
);

export const settingTeamsReducer: React.Reducer<
  SettingTeamsState,
  SettingTeamsAction
> = reduceReducers(settingReducer, createCheckAllReducer());

export function defaultState(): SettingTeamsState {
  return {
    editMode: null,
    formLoading: false,
    deleteLoading: false,
    isSearching: false,
    itemsLoading: true,
    editTeamId: null,
    checkableItems: {
      allChecked: false,
      allIds: [],
      checkedIds: [],
    },
    initStaffList: {},
  };
}
