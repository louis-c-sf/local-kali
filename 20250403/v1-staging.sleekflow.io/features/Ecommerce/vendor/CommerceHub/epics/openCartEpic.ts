import { Union } from "ts-toolbelt";
import { Action, LoginType } from "types/LoginType";
import { Epic } from "redux-observable/src/epic";
import { submitCreateCart$ } from "api/CommerceHub/Cart/submitCreateCart";
import {
  map,
  switchMap,
  catchError,
  filter,
  concatMap,
  take,
  retryWhen,
  delay,
} from "rxjs/operators";
import { from, of, ObservableInput } from "rxjs";
import { createUpdateCartAction } from "features/Ecommerce/vendor/CommerceHub/createUpdateCartAction";
import { submitClearCart$ } from "api/CommerceHub/Cart/submitClearCart";
import { fetchStoreCurrencies } from "api/CommerceHub/fetchStoreCurrencies";

type OpenActionType = Union.Select<
  Action,
  { type: "INBOX.SHOPIFY_MODAL.OPEN"; vendor: "commerceHub" }
>;

export const openCartEpic: Epic<Action, Action, LoginType> = (
  action$,
  state$
) => {
  return action$.pipe(
    filter(
      (action) =>
        action.type === "INBOX.SHOPIFY_MODAL.OPEN" &&
        action.vendor === "commerceHub"
    ),
    switchMap((_) => {
      const action = _ as OpenActionType;

      return submitClearCart$(action.storeId, action.userProfileId).pipe(
        map(() => action)
      );
    }),
    concatMap((_) => {
      const action = _ as OpenActionType;
      return from(fetchStoreCurrencies(action.storeId)).pipe(
        map((response) => ({
          action: action as OpenActionType,
          currency:
            response.data.currencies.shift()?.currency_iso_code ?? "HKD",
        }))
      );
    }),
    concatMap(({ action, currency }) => {
      return submitCreateCart$(
        action.storeId,
        action.userProfileId,
        currency
      ).pipe(
        //todo error message + manual retry on fail
        filter((response) => {
          const data = response.data;
          const currentInbox = state$.value.inbox;
          const isSameStore =
            data.cart.store_id === currentInbox.product?.storeId;
          //todo check by user profile id
          // const isSameProfile = data.cart.userProfileId === state$.value.profile?.id;
          // return isSameStore && isSameProfile
          return isSameStore;
        }),
        map((response) => createUpdateCartAction(response.data.cart, currency)),
        retryWhen((errors) => errors.pipe(delay(400), take(10)))
      ) as ObservableInput<Action>;
    }),

    catchError((err, obs) => {
      console.error(err);
      return obs;
    })
  );
};
