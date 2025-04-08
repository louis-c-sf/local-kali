import { Epic, ofType } from "redux-observable";
import { switchMap, map, mapTo, catchError } from "rxjs/operators";
import { Action, LoginType } from "../../../types/LoginType";
import { submitDeleteScheduledMessage$ } from "../../../api/Chat/Message/submitDeleteScheduledMessage$";

export const deleteMessageEpic: Epic<Action, Action, LoginType> = ($action) => {
  return $action.pipe(
    ofType("INBOX.SCHEDULE.MESSAGE_DELETE_CONFIRM"),
    switchMap((action) => {
      if (action.type !== "INBOX.SCHEDULE.MESSAGE_DELETE_CONFIRM") {
        throw "bad type";
      }

      return submitDeleteScheduledMessage$(action.messageId).pipe(
        map(
          () =>
            ({
              type: "INBOX.SCHEDULE.MESSAGE_DELETED",
              messageId: action.messageId,
            } as Action)
        ),
        catchError((err) =>
          mapTo({ type: "INBOX.API.ERROR", error: err } as Action)
        )
      );
    })
  );
};
