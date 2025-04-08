import {
  ProductType,
  ImageUploadType,
} from "core/models/Ecommerce/Catalog/ProductType";
import {
  ProductFormDescriptionType,
  ProductFormType,
} from "features/Ecommerce/usecases/Settings/CustomStore/EditProduct/useProductForm";
import { UpdateProductPayloadType } from "api/CommerceHub/submitUpdateProduct";
export const normalizedDescription = (
  desc: ProductFormDescriptionType
): ProductFormDescriptionType => ({
  type: "text",
  text: desc.text,
  image: null, //todo
  youtube: null,
});
export function createUpdateProductPayload(
  values: ProductFormType,
  storeId: string,
  id: string | null,
  prototype: ProductType | null
): UpdateProductPayloadType {
  let imageUpdated: ImageUploadType[] = [];

  if (values.uploadedImageUrl) {
    imageUpdated = [
      {
        image_url: values.uploadedImageUrl,
        blob_name: values.uploadedImageBlobName,
      },
    ];
  } else if (values.uploadedImageBlobName) {
    imageUpdated = [
      { image_url: null, blob_name: values.uploadedImageBlobName },
    ];
  } else if (prototype?.images && !values.deleteImage) {
    imageUpdated = [...prototype.images];
  }
  return {
    descriptions: values.descriptions.map(normalizedDescription),
    is_view_enabled: prototype?.is_view_enabled ?? false,
    attributes: [], //todo
    metadata: {},
    platform_identity: { metadata: {}, type: "CustomCatalog" },
    sku: values.sku,
    store_id: storeId,
    url: values.url,
    images: imageUpdated,
    id: id ?? "",
    names: values.names,
    category_ids: [],
    prices: values.prices.map((p) => ({
      amount: p.amount,
      currency_iso_code: p.currency_iso_code,
    })),
  };
}
