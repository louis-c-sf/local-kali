import { postWithExceptions } from "api/apiRequest";
import { ProductType } from "core/models/Ecommerce/Catalog/ProductType";

interface ResponseType {
  success: boolean;
  data: { product: ProductType };
}

export async function fetchProduct(
  storeId: string,
  id: string
): Promise<ResponseType> {
  return postWithExceptions("/CommerceHub/Products/GetProduct", {
    param: {
      store_id: storeId,
      product_id: id,
    },
  });
}
