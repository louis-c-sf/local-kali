import { postWithExceptions$ } from "api/apiRequest";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { CommerceHubDiscountType } from "api/CommerceHub/Cart/submitUpdateCartDiscount";

export function fetchCalculatedCart$(
  userProfileId: string,
  storeId: string,
  currency: string,
  language: string
): Observable<CalculatedCartResponseType> {
  return postWithExceptions$("/CommerceHub/Carts/GetCalculatedCart", {
    param: {
      user_profile_id: userProfileId,
      store_id: storeId,
      currency_iso_code: currency,
      language_iso_code: language,
    },
  }).pipe(
    map((response) => (response.data as ResponseType).data.calculated_cart)
  );
}

export interface CalculatedCartResponseType {
  subtotal_price: number;
  total_price: number;
  cart_discount?: {
    value: number;
    type: CommerceHubDiscountType;
    metadata: {};
  };
  line_items: Array<{
    product_id: string;
    product_variant_id: string;
    product_variant_snapshot: {
      prices: Array<{ currency_iso_code: string; amount: number }>;
    };
  }>;
  calculated_line_items: Array<{
    applied_discounts: Array<{
      level: "ItemLevel" | "OrderLevel";
      applied_discount: {
        value: number;
        type: "RateOff" | "AbsoluteOff";
        metadata: {};
      };
      pre_calculated_amount: number;
      post_calculated_amount: number;
    }>;

    line_item_pre_calculated_amount: number;
    line_item_calculated_amount: number;
    message_preview: {
      coverImageUrl: string;
      text: string;
    };
    product_variant_id: string;
    product_id: string;
    quantity: number;
    metadata: {};
  }>;
}

interface ResponseType {
  success: boolean;
  data: {
    calculated_cart: CalculatedCartResponseType;
  };
}
