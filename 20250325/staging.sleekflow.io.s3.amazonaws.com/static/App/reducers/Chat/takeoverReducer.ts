import produce from "immer";
import { LoginType, Action } from "../../../types/LoginType";
import { initialUser } from "../../../context/LoginContext";

export const takeoverReducer = produce(
  (state: LoginType = initialUser, action: Action) => {
    switch (action.type) {
      case "INBOX.SESSION.STARTED":
        state.session.started = true;
        break;

      case "INBOX.SESSION.STOPPED":
        state.session.started = false;
        state.session.takeover.locked = false;
        state.session.takeover.sessionsActive = [];
        break;

      case "INBOX.SESSION.TAKEOVER_LOCK":
        state.session.takeover.locked = true;
        state.session.takeover.sessionsActive = action.sessions;
        break;

      case "INBOX.SESSION.TAKEOVER_UNLOCK":
        state.session.takeover.locked = false;
        state.session.takeover.sessionsActive = [];
        break;
    }
  }
);
