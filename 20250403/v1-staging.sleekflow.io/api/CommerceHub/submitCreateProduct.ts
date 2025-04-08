import { ProductType } from "core/models/Ecommerce/Catalog/ProductType";
import { postWithExceptions } from "api/apiRequest";
import { UpdateProductPayloadType } from "api/CommerceHub/submitUpdateProduct";

export async function submitCreateProduct(
  product: UpdateProductPayloadType
): Promise<ResponseType> {
  return await postWithExceptions(
    "/CommerceHub/Products/CreateDefaultProduct",
    { param: product }
  );
}

interface ResponseType {
  success: boolean;
  data: { product: ProductType };
}
