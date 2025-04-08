import { postWithExceptions$ } from "api/apiRequest";
import { map } from "rxjs/operators";
import { Observable } from "rxjs";
import { ProductType } from "core/models/Ecommerce/Catalog/ProductType";

export function submitCreateCart$(
  storeId: string,
  userProfileId: string,
  currency: string
): Observable<ResponseType> {
  return postWithExceptions$("/CommerceHub/Carts/GetCart", {
    param: {
      user_profile_id: userProfileId,
      store_id: storeId,
      currency_iso_code: currency,
    },
  }).pipe(map((response) => response.data as ResponseType));
}

interface ResponseType {
  success: boolean;
  data: {
    cart: CartResponseType;
  };
}

export interface CartResponseType {
  calculated_line_items: Array<{
    // applied_discounts: []
    line_item_calculated_amount: number;
    message_preview: { coverImageUrl: string; text: string };
    metadata: {};
    product_id: string;
    product_variant_id: string;
    quantity: number;
  }>;
  id: string;
  store_id: string;
  cart_status: "Active" | string;
  created_at: string;
  updated_at: string;
  line_items: Array<CommerceHubCartItemType>;
}

export interface CommerceHubCartItemType {
  product_variant_snapshot: ProductType & { product_id: string };
  product_variant_id: string;
  product_id: string;
  description: null;
  quantity: number;
  line_item_discount: null | {
    value: number;
    type: "AbsoluteOff";
    metadata: {};
  };
}
