import { Epic } from "redux-observable/src/epic";
import { Action, LoginType } from "types/LoginType";
import { map, catchError, filter, mergeMap } from "rxjs/operators";
import { submitClearCart$ } from "api/CommerceHub/Cart/submitClearCart";
import { Union } from "ts-toolbelt";

type ClearActionType = Union.Select<
  Action,
  { type: "INBOX.CART.CLEAR" | "INBOX.SHOPIFY_MODAL.CLOSE" }
>;

export const clearCartEpic: Epic<Action, Action, LoginType> = (action$) => {
  return action$.pipe(
    filter(
      (action) =>
        (action.type === "INBOX.CART.CLEAR" ||
          action.type === "INBOX.SHOPIFY_MODAL.CLOSE") &&
        action.vendor === "commerceHub"
    ),

    mergeMap((_) => {
      const action = _ as ClearActionType;

      return submitClearCart$(
        action.storeId as string,
        action.userProfileId
      ).pipe(map(() => ({ type: "INBOX.CART.CLEARED" } as Action)));
    }),

    catchError((err, obs) => {
      console.error(err);
      return obs;
    })
  );
};
