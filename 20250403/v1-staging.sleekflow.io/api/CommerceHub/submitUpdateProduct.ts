import {
  ProductType,
  LocalizedValueType,
  ImageUploadType,
} from "core/models/Ecommerce/Catalog/ProductType";
import { postWithExceptions } from "api/apiRequest";
import { ProductFormDescriptionType } from "features/Ecommerce/usecases/Settings/CustomStore/EditProduct/useProductForm";

export async function submitUpdateProduct(
  product: UpdateProductPayloadType
): Promise<ResponseType> {
  return await postWithExceptions(
    "/CommerceHub/Products/UpdateDefaultProduct",
    {
      param: product,
    }
  );
}

export interface UpdateProductPayloadType {
  id: string;
  store_id: string;
  sku: string | null;
  url: null | string;
  names: LocalizedValueType[];
  is_view_enabled: boolean;
  descriptions: Array<ProductFormDescriptionType>;
  attributes: ProductType["attributes"];
  images: ImageUploadType[];
  prices: Array<{
    currency_iso_code: string;
    amount: number;
  }>;
  platform_identity: {
    type: "CustomCatalog";
    metadata: {};
  };
  metadata: {};
  category_ids: string[];
}

interface ResponseType {
  success: boolean;
  data: { product: ProductType };
}
