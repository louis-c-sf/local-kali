import { Epic } from "redux-observable/src/epic";
import { Action, LoginType } from "types/LoginType";
import {
  switchMap,
  map,
  catchError,
  filter,
  retryWhen,
  delay,
  take,
} from "rxjs/operators";
import { Observable } from "rxjs";
import {
  fetchCalculatedCart$,
  CalculatedCartResponseType,
} from "api/CommerceHub/Cart/fetchCalculatedCart";
import {
  GenericCartCalculationResult,
  CalculationItemType,
} from "core/models/Ecommerce/Catalog/GenericCartCalculationResult";
import { CommerceHubDiscountType } from "api/CommerceHub/Cart/submitUpdateCartDiscount";
import { SelectedDiscountType } from "types/ShopifyProductType";
import Decimal from "decimal.js-light";
import { money } from "utility/math/money";

export const recalculateCartEpic: Epic<Action, Action, LoginType> = (
  action$,
  state$
) => {
  return action$.pipe(
    filter(
      (action) =>
        ["INBOX.CART.RECALCULATE", "INBOX.CART.LANGUAGE_SELECTED"].includes(
          action.type
        ) &&
        state$.value.inbox.product?.vendor === "commerceHub" &&
        (state$.value.inbox.product?.cart?.length ?? 0) > 0
    ),
    switchMap((action) => {
      let fetch: Observable<CalculatedCartResponseType>;
      let currency: string;
      if (action.type === "INBOX.CART.RECALCULATE") {
        fetch = fetchCalculatedCart$(
          action.userProfileId,
          action.storeId as string,
          action.currency,
          action.language
        );
        currency = action.currency;
      } else if (action.type === "INBOX.CART.LANGUAGE_SELECTED") {
        fetch = fetchCalculatedCart$(
          state$.value.profile.id,
          state$.value.inbox.product?.storeId as string,
          state$.value.inbox.product?.currency as string,
          action.language
        );
        currency = state$.value.inbox.product?.currency as string;
      } else {
        throw ["Wrong action", action];
      }

      return fetch.pipe(
        map(toRecalculatedAction(currency)),
        retryWhen((errors) => errors.pipe(delay(400), take(10)))
      );
    }),

    catchError((err, obs) => {
      console.error(err);
      return obs;
    })
  );
};

export function toRecalculatedAction(currency: string) {
  return (response: CalculatedCartResponseType): Action => {
    const discountType = response.cart_discount?.type;
    const rateDiscount = response.cart_discount?.value;
    const discountAmount =
      rateDiscount !== undefined ? money(rateDiscount).mul(100) : money(0);
    const typeMap: Record<
      Exclude<CommerceHubDiscountType, null>,
      SelectedDiscountType
    > = {
      AbsoluteOff: "fixed",
      RateOff: "percentage",
    };
    const resultGeneric: GenericCartCalculationResult = {
      percentageDiscount:
        discountType === "RateOff" ? discountAmount.toNumber() : 0,
      discountType: discountType ? typeMap[discountType] : "none",
      subtotalAmount: response.subtotal_price,
      totalAmount: response.total_price,
      items: response.calculated_line_items.map((item) => {
        const itemMatch = response.line_items.find(
          (lItem) =>
            lItem.product_id === item.product_id &&
            lItem.product_variant_id === item.product_variant_id
        );
        if (!itemMatch) {
          throw {
            message: `Missing item for price evaluation`,
            item,
            response,
          };
        }
        const priceMatch = itemMatch.product_variant_snapshot.prices.find(
          (p) => p.currency_iso_code.toLowerCase() === currency.toLowerCase()
        );
        if (!priceMatch) {
          throw {
            message: `Missing item price `,
            item,
            itemMatch,
            response,
          };
        }

        const itemDiscountBase = item.applied_discounts.reduce((acc, next) => {
          const amount = new Decimal(next.pre_calculated_amount).sub(
            next.post_calculated_amount
          );
          return amount.add(acc);
        }, money(0));

        const itemGeneric: CalculationItemType = {
          totalDiscount: itemDiscountBase.toDecimalPlaces(2).toNumber(),
          quantity: item.quantity,
          productVariantId: item.product_variant_id ?? undefined,
          productId: item.product_id,
          amount: money(priceMatch.amount).toNumber(),
          preview: !item.message_preview
            ? null
            : {
                image: item.message_preview.coverImageUrl,
                text: item.message_preview.text,
              },
        };
        return itemGeneric;
      }),
    };
    return {
      type: "INBOX.CART.RECALCULATED",
      result: resultGeneric,
    };
  };
}
