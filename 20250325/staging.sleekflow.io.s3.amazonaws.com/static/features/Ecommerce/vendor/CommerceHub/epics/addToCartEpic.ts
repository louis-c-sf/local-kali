import { Epic } from "redux-observable/src/epic";
import { Action, LoginType } from "types/LoginType";
import { of } from "rxjs";
import {
  switchMap,
  catchError,
  filter,
  concatMap,
  retry,
  retryWhen,
  delay,
  take,
} from "rxjs/operators";
import { Union } from "ts-toolbelt";
import { submitUpdateItem$ } from "api/CommerceHub/Cart/submitUpdateItem";
import { createUpdateCartAction } from "features/Ecommerce/vendor/CommerceHub/createUpdateCartAction";
import { recalculateCartInBackground } from "features/Ecommerce/vendor/CommerceHub/epics/recalculateCartInBackground";

type AddActionType = Union.Select<Action, { type: "INBOX.CART.ADD" }>;

export const addToCartEpic: Epic<Action, Action, LoginType> = (
  action$,
  state$
) => {
  return action$.pipe(
    filter(
      (action) =>
        action.type === "INBOX.CART.ADD" &&
        state$.value.inbox.product?.vendor === "commerceHub"
    ),
    switchMap((action) => {
      const actionTyped = action as AddActionType;

      return submitUpdateItem$({
        product_id: actionTyped.product.productId as string,
        product_variant_id: actionTyped.variantId as string,
        quantity: actionTyped.quantity,
        store_id: actionTyped.storeId as string,
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
          const updateCart = createUpdateCartAction(
            response.data.cart,
            actionTyped.currency
          );

          const recalculate = recalculateCartInBackground(
            actionTyped.storeId as string,
            state$.value.profile.id,
            actionTyped.currency,
            state$.value.inbox.product?.totals?.discountType ?? "none",
            state$.value.inbox.product?.totals?.percentageDiscount ?? 0,
            state$.value.inbox.product?.language
          );

          return of(updateCart, recalculate);
        }),

        retryWhen((errors) => errors.pipe(delay(1000), take(5)))
      );
    }),

    catchError((err, obs) => {
      console.error(err);
      return obs;
    })
  );
};
