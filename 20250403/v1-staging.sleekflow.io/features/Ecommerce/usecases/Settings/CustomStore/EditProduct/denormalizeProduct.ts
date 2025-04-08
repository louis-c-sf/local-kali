import {
  ProductType,
  ProductVariantType,
} from "core/models/Ecommerce/Catalog/ProductType";
import { ProductFormType } from "features/Ecommerce/usecases/Settings/CustomStore/EditProduct/useProductForm";
import { CustomStoreType } from "core/models/Ecommerce/Catalog/CustomStoreType";

export function denormalizeProduct(
  input: ProductType,
  store: CustomStoreType
): ProductFormType {
  const imageUrl = input.images[0]?.image_url ?? null;
  const imageBlob = input.images[0]?.blob_name ?? null;
  const pricesInput =
    input.prices ?? input.default_product_variant?.prices ?? [];

  const namesActualized = store.languages.map(
    ({ language_iso_code }) =>
      input.names.find((n) => n.language_iso_code === language_iso_code) ?? {
        language_iso_code,
        value: "",
      }
  );

  const descriptionsActualized = store.languages.map<
    ProductVariantType["descriptions"][number]
  >(
    ({ language_iso_code }) =>
      input.descriptions.find(
        (n) => n.text.language_iso_code === language_iso_code
      ) ?? {
        type: "text",
        text: { language_iso_code, value: "" },
        image: null,
        youtube: null,
      }
  );

  const pricesActualized = store.currencies.map(({ currency_iso_code }) => {
    const priceMatch = pricesInput.find(
      (p) => p.currency_iso_code === currency_iso_code
    );
    return priceMatch ? { ...priceMatch } : { currency_iso_code, amount: 0 };
  });

  return {
    uploadedImageBlobName: imageBlob,
    uploadedImageUrl: imageUrl,
    descriptions: [...descriptionsActualized],
    prices: [...pricesActualized],
    url: input.url || "",
    names: [...namesActualized],
    sku: input.sku ?? "",
    deleteImage: false,
  };
}
