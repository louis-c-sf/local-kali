import produce from "immer";

export type EditableTeamsState = {
  teamsEditForm: {
    show: boolean;
  };
};
export type EditableTeamsAction =
  | {
      type: "EDIT_TEAM_CLICK";
    }
  | {
      type: "EDIT_TEAM_CANCEL";
    }
  | {
      type: "EDIT_TEAM_COMPLETE";
    }
  | { type: string };

export function createEditTeamReducer() {
  return produce((state: EditableTeamsState, action: EditableTeamsAction) => {
    switch (action.type) {
      case "EDIT_TEAM_COMPLETE":
        state.teamsEditForm.show = false;
        break;
      case "EDIT_TEAM_CLICK":
        state.teamsEditForm.show = true;
        break;
      case "EDIT_TEAM_CANCEL":
        state.teamsEditForm.show = false;
        break;
    }
  });
}
