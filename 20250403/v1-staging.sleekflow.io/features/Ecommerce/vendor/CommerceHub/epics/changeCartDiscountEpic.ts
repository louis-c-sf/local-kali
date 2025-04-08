import { Epic } from "redux-observable/src/epic";
import { Action, LoginType } from "types/LoginType";
import { of } from "rxjs";
import {
  switchMap,
  catchError,
  filter,
  concatMap,
  retryWhen,
  take,
  delay,
} from "rxjs/operators";
import { Union } from "ts-toolbelt";
import { createUpdateCartAction } from "features/Ecommerce/vendor/CommerceHub/createUpdateCartAction";
import { recalculateCartInBackground } from "features/Ecommerce/vendor/CommerceHub/epics/recalculateCartInBackground";
import {
  submitUpdateCartDiscount$,
  CommerceHubDiscountType,
  CartItemPayloadType,
} from "api/CommerceHub/Cart/submitUpdateCartDiscount";
import { SelectedDiscountType } from "types/ShopifyProductType";

type UpdateDiscountActionType = Union.Select<
  Action,
  { type: "INBOX.CART.CHANGE.DISCOUNT_TYPE" }
>;

const discountTypeMap: Record<SelectedDiscountType, CommerceHubDiscountType> = {
  none: null,
  percentage: "RateOff",
  fixed: "AbsoluteOff",
};

export const changeCartDiscountEpic: Epic<Action, Action, LoginType> = (
  action$,
  state$
) => {
  return action$.pipe(
    filter(
      (action) =>
        action.type === "INBOX.CART.CHANGE.DISCOUNT_TYPE" &&
        state$.value.inbox.product?.vendor === "commerceHub"
    ),
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
        discountTypeMap[action.discountType] ?? null,
        action.overallDiscountPercent,
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
              action.discountType,
              action.overallDiscountPercent,
              state$.value.inbox.product?.language
            )
          )
        ),
        retryWhen((err) => err.pipe(delay(400), take(10)))
      );
    }),

    catchError((err, retry) => {
      console.error(err);
      return retry;
    })
  );
};
