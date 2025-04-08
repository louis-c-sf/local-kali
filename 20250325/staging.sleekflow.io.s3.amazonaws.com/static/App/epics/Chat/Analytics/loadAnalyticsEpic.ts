import { Epic, ofType } from "redux-observable";
import { LoginType, Action } from "../../../../types/LoginType";
import { switchMap, map, mapTo, catchError } from "rxjs/operators";
import { fetchWebclientInfo$ } from "../../../../api/Chat/Analytics/fetchWebclientInfo";

export const loadAnalyticsEpic: Epic<Action, Action, LoginType> = ($action) => {
  return $action.pipe(
    ofType("INBOX.ANALYTICS.INIT"),
    switchMap((action) => {
      if (action.type !== "INBOX.ANALYTICS.INIT") {
        throw "bad type";
      }
      return fetchWebclientInfo$(action.webClientUUID).pipe(
        map(
          (response) =>
            ({
              type: "INBOX.ANALYTICS.INIT_LOADED",
              summary: [...response.results],
              onlineStatus: response.onlineStatus,
              conversationId: action.conversationId,
            } as Action)
        ),
        catchError((err, observable) => {
          console.error(err);
          return observable;
        })
      );
    })
  );
};
