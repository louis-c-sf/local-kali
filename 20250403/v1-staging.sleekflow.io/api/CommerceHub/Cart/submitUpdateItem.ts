import { postWithExceptions$ } from "api/apiRequest";
import { map } from "rxjs/operators";
import { Observable } from "rxjs";
import { CartResponseType } from "api/CommerceHub/Cart/submitCreateCart";

export function submitUpdateItem$(
  request: RequestType
): Observable<ResponseType> {
  return postWithExceptions$("/CommerceHub/Carts/UpdateCartItem", {
    param: request,
  }).pipe(map((response) => response.data as ResponseType));
}

interface RequestType {
  user_profile_id: string;
  store_id: string;
  product_variant_id: string;
  product_id: string;
  quantity: number;
}

interface ResponseType {
  success: boolean;
  data: {
    cart: CartResponseType;
  };
}
