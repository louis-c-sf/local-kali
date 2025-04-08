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
  distinctUntilChanged,
} from "rxjs/operators";
import { Union } from "ts-toolbelt";
import { createUpdateCartAction } from "../createUpdateCartAction";
import { recalculateCartInBackground } from "./recalculateCartInBackground";
import {
  submitUpdateCartDiscount$,
  CommerceHubDiscountType,
  CartItemPayloadType,
} from "api/CommerceHub/Cart/submitUpdateCartDiscount";
import { SelectedDiscountType } from "types/ShopifyProductType";
import { equals } from "ramda";

type UpdateDiscountActionType = Union.Select<
  Action,
  { type: "INBOX.CART.UPDATE.DISCOUNT" }
>;

const discountTypeMap: Record<SelectedDiscountType, CommerceHubDiscountType> = {
  none: null,
  percentage: "RateOff",
  fixed: "AbsoluteOff",
};

export const updateItemDiscountEpic: Epic<Action, Action, LoginType> = (
  action$,
  state$
) => {
  return action$.pipe(
    filter(
      (action) =>
        action.type === "INBOX.CART.UPDATE.DISCOUNT" &&
        state$.value.inbox.product?.vendor === "commerceHub"
    ),
    distinctUntilChanged(equals),
    switchMap((_) => {
      const action = _ as UpdateDiscountActionType;

      const cartItems = (
        state$.value.inbox.product?.cart ?? []
      ).map<CartItemPayloadType>((item) => {
        return {
          id: item.productId as string,
          variantId: item.selectedVariantId as string,
          discount: Number(item.discountAmount) || 0,
          quantity: item.quantity,
        };
      });

      return submitUpdateCartDiscount$(
        state$.value.profile.id,
        action.storeId as string,
        discountTypeMap[
          state$.value.inbox.product?.totals?.discountType ?? "none"
        ] ?? null,
        0,
        action.currency,
        cartItems
      ).pipe(
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
        retryWhen((errors) => errors.pipe(delay(400), take(10)))
      );
    }),

    catchError((err, obs) => {
      console.error(err);
      return obs;
    })
  );
};
