import { Action, LoginType } from "../../types/LoginType";
import produce from "immer";
import { initialUser } from "../../context/LoginContext";

export const settingsReducer = produce(
  (draft: LoginType = initialUser, action: Action) => {
    switch (action.type) {
      case "TEAMS_UPDATED":
        draft.settings.teamsSettings.teams = action.teams;
        draft.settings.teamsSettings.teamsLoaded = true;
        break;
    }
  }
);
