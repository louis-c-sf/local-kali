import { Epic } from "redux-observable/src/epic";
import { Action, LoginType } from "types/LoginType";
import {
  switchMap,
  catchError,
  filter,
  retryWhen,
  take,
  delay,
  concatMap,
  startWith,
} from "rxjs/operators";
import { of } from "rxjs";
import { Union } from "ts-toolbelt";
import { submitUpdateItem$ } from "api/CommerceHub/Cart/submitUpdateItem";
import { createUpdateCartAction } from "../createUpdateCartAction";
import { recalculateCartInBackground } from "features/Ecommerce/vendor/CommerceHub/epics/recalculateCartInBackground";

type DeleteActionType = Union.Select<
  Action,
  { type: "INBOX.CART.ITEM_DELETE" }
>;

export const deleteFromCartEpic: Epic<Action, Action, LoginType> = (
  action$,
  state$
) => {
  return action$.pipe(
    filter(
      (action) =>
        action.type === "INBOX.CART.ITEM_DELETE" &&
        state$.value.inbox.product?.vendor === "commerceHub"
    ),
    switchMap((_) => {
      const action = _ as DeleteActionType;

      return submitUpdateItem$({
        product_id: action.productId as string,
        product_variant_id: action.variantId as string,
        quantity: 0,
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
        concatMap((response) => {
          return of(
            createUpdateCartAction(response.data.cart, action.currency),
            recalculateCartInBackground(
              action.storeId as string,
              state$.value.profile.id,
              action.currency as string,
              state$.value.inbox.product?.totals?.discountType ?? "none",
              state$.value.inbox.product?.totals?.percentageDiscount ?? 0,
              state$.value.inbox.product?.language
            )
          );
        }),
        retryWhen((err) => err.pipe(delay(500), take(5))),
        startWith({ type: "INBOX.CART.LOADING" } as Action)
      );
    }),

    catchError((err, obs) => {
      console.error(err);
      return obs;
    })
  );
};
