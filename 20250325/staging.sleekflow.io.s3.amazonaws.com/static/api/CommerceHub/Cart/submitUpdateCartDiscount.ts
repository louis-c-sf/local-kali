import { postWithExceptions$ } from "api/apiRequest";
import { map } from "rxjs/operators";
import { Observable } from "rxjs";
import { CartResponseType } from "api/CommerceHub/Cart/submitCreateCart";

export type CommerceHubDiscountType = "AbsoluteOff" | "RateOff" | null;

export interface CartItemPayloadType {
  id: string;
  variantId: string;
  quantity: number;
  discount?: number;
}

export function submitUpdateCartDiscount$(
  userProfileId: string,
  storeId: string,
  type: CommerceHubDiscountType,
  overallDiscount: number,
  currency: string,
  items: Array<CartItemPayloadType>
): Observable<ResponseType> {
  const cartDiscount =
    type === null
      ? null
      : {
          description: null,
          metadata: {},
          title: null,
          type: type,
          value: type === "AbsoluteOff" ? 0 : overallDiscount / 100,
        };
  const payload: PayloadType = {
    currency_iso_code: currency,
    cart_discount: cartDiscount,
    line_items: items.map((item) => {
      return {
        product_variant_id: item.variantId,
        description: null,
        metadata: {},
        product_id: item.id,
        quantity: item.quantity,
        line_item_discount:
          type === "RateOff" || type === null
            ? null
            : {
                type: "AbsoluteOff",
                value: item.discount ?? 0,
                description: null,
                title: null,
                metadata: {},
              },
      };
    }),
    store_id: storeId,
    user_profile_id: userProfileId,
  };

  return postWithExceptions$("/CommerceHub/Carts/UpdateCart", {
    param: payload,
  }).pipe(map((response) => response.data as ResponseType));
}

interface DiscountPayloadType {
  title: null;
  description: null;
  value: number;
  type: CommerceHubDiscountType;
  metadata: {};
}

interface PayloadType {
  user_profile_id: string;
  store_id: string;
  currency_iso_code: string;
  line_items: Array<{
    product_variant_id: string;
    description: null;
    line_item_discount: null | DiscountPayloadType;
    metadata: {};
    product_id: string;
    quantity: number;
  }>;
  cart_discount: DiscountPayloadType | null;
}

interface ResponseType {
  success: boolean;
  data: {
    cart: CartResponseType;
  };
}
