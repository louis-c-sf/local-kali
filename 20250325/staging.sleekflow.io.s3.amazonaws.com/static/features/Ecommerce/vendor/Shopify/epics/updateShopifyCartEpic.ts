import { Union } from "ts-toolbelt";
import { Action, LoginType } from "types/LoginType";
import { Epic } from "redux-observable/src/epic";
import { filter, concatMap } from "rxjs/operators";
import { of } from "rxjs";

type UpdateActionType = Union.Select<
  Action,
  { type: "INBOX.CART.UPDATE.QUANTITY" }
>;
type UpdateDiscountActionType = Union.Select<
  Action,
  { type: "INBOX.CART.UPDATE.DISCOUNT" }
>;

export const updateShopifyCartEpic: Epic<Action, Action, LoginType> = (
  action$,
  state$
) => {
  return action$.pipe(
    filter(
      (action) =>
        (action.type === "INBOX.CART.UPDATE.QUANTITY" ||
          action.type === "INBOX.CART.UPDATE.DISCOUNT") &&
        state$.value.inbox.product?.vendor === "shopify"
    ),
    concatMap((_) => {
      const action = _ as UpdateActionType | UpdateDiscountActionType;
      const lang = state$.value.inbox.product?.language;
      if (lang === undefined) {
        throw {
          message: "missing lang state",
          lang,
          action,
          product: state$.value.inbox.product,
        };
      }

      const actionFired: Union.Select<
        Action,
        { type: "INBOX.CART.RECALCULATE" }
      > = {
        type: "INBOX.CART.RECALCULATE",
        userProfileId: state$.value.profile.id,
        storeId: action.storeId,
        currency: action.currency,
        language: lang,
        percentage: state$.value.inbox.product?.totals?.percentageDiscount ?? 0,
        selectedDiscount:
          state$.value.inbox.product?.totals?.discountType ?? "none",
      };
      return of(actionFired);
    })
  );
};
