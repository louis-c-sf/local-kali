import { Epic } from "redux-observable/src/epic";
import { Action, LoginType } from "types/LoginType";
import { of } from "rxjs";
import {
  switchMap,
  catchError,
  filter,
  concatMap,
  retryWhen,
  delay,
  take,
  startWith,
} from "rxjs/operators";
import { Union } from "ts-toolbelt";
import { submitUpdateItem$ } from "api/CommerceHub/Cart/submitUpdateItem";
import { createUpdateCartAction } from "../createUpdateCartAction";
import { recalculateCartInBackground } from "./recalculateCartInBackground";

type UpdateActionType = Union.Select<
  Action,
  { type: "INBOX.CART.UPDATE.QUANTITY" }
>;

export const updateCartItemEpic: Epic<Action, Action, LoginType> = (
  action$,
  state$
) => {
  return action$.pipe(
    filter(
      (action) =>
        action.type === "INBOX.CART.UPDATE.QUANTITY" &&
        state$.value.inbox.product?.vendor === "commerceHub"
    ),
    switchMap((_) => {
      const action = _ as UpdateActionType;
      return submitUpdateItem$({
        product_id: action.productId as string,
        product_variant_id: action.variantId as string,
        quantity: action.quantity,
        store_id: action.storeId as string,
        user_profile_id: state$.value.profile.id,
      }).pipe(
        filter((response) => {
          const data = response.data;
          const currentInbox = state$.value.inbox;
          const isSameStore =
            data.cart.store_id === currentInbox.product?.storeId;
          return isSameStore;
        }),

        concatMap((response) =>
          of(
            createUpdateCartAction(response.data.cart, action.currency),
            recalculateCartInBackground(
              action.storeId as string,
              state$.value.profile.id,
              action.currency,
              state$.value.inbox.product?.totals?.discountType ?? "none",
              state$.value.inbox.product?.totals?.percentageDiscount ?? 0,
              state$.value.inbox.product?.language
            )
          )
        ),

        retryWhen((errors) => errors.pipe(delay(1000), take(5))),

        startWith({ type: "INBOX.CART.LOADING" } as Action)
      );
    }),

    catchError((err, obs) => {
      console.error(err);
      return obs;
    })
  );
};
