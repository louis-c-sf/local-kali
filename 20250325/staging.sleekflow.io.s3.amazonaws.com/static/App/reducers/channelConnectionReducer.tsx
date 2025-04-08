import { Action, LoginType } from "../../types/LoginType";
import produce from "immer";
import { initialUser } from "../../context/LoginContext";

export const channelConnectionReducer = produce(
  (draft: LoginType = initialUser, action: Action) => {
    switch (action.type) {
      case "HIDE_CONNECTION_BANNER":
        draft.connectionBanner[action.bannerType] = false;
        break;
      case "SHOW_CONNECTION_BANNER":
        draft.connectionBanner[action.bannerType] = true;
        break;
    }
  }
);
