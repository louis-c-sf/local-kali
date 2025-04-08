import produce from "immer";
import { Reducer } from "react";
import { Action, LoginType } from "../../types/LoginType";
import { propEq } from "ramda";
import { initialUser } from "../../context/LoginContext";

export const broadcastReducer: Reducer<LoginType | undefined, Action> = produce(
  (draft: LoginType = initialUser, action: Action) => {
    switch (action.type) {
      case "UPDATE_BROADCAST":
        draft.broadcastCampaign = action.broadcastCampaign;
        break;

      case "BROADCAST_DUPLICATED":
        if (!draft.broadcastCampaign) {
          draft.broadcastCampaign = [];
        }
        const indexOriginal = draft.broadcastCampaign.findIndex(
          propEq("id", action.from.id)
        );
        if (indexOriginal > -1) {
          draft.broadcastCampaign.splice(indexOriginal + 1, 0, action.to);
        } else {
          draft.broadcastCampaign.push(action.to);
        }
        break;
    }
  }
);
