import { Action } from "types/LoginType";
import { Union } from "ts-toolbelt";
import { SelectedDiscountType } from "types/ShopifyProductType";

export function recalculateCartInBackground(
  storeId: string,
  userProfileId: string,
  currency: string,
  discountType: SelectedDiscountType,
  percentage: number,
  language: string | undefined
): Union.Select<Action, { type: "INBOX.CART.RECALCULATE" }> {
  if (language === undefined) {
    throw "Missing language in state";
  }
  return {
    type: "INBOX.CART.RECALCULATE",
    userProfileId: userProfileId,
    storeId: storeId,
    currency: currency,
    language: language,
    selectedDiscount: discountType,
    percentage,
  };
}
