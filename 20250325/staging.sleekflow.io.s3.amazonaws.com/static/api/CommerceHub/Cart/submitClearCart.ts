import { postWithExceptions, postWithExceptions$ } from "api/apiRequest";
import { map } from "rxjs/operators";
import { Observable } from "rxjs";
import { CartResponseType } from "api/CommerceHub/Cart/submitCreateCart";

export async function submitClearCart(storeId: string, userProfileId: string) {
  return await postWithExceptions("/CommerceHub/Carts/ClearCart", {
    param: {
      user_profile_id: userProfileId,
      store_id: storeId,
    },
  });
}

export function submitClearCart$(
  storeId: string,
  userProfileId: string
): Observable<ResponseType> {
  return postWithExceptions$("/CommerceHub/Carts/ClearCart", {
    param: {
      user_profile_id: userProfileId,
      store_id: storeId,
    },
  }).pipe(map((response) => response.data as ResponseType));
}

interface ResponseType {
  success: boolean;
  data: {
    cart: CartResponseType;
  };
}
