import { ProductType } from "core/models/Ecommerce/Catalog/ProductType";
import { ProductGenericType } from "core/models/Ecommerce/Cart/ProductGenericType";

export function toGenericProduct(item: ProductType) {
  const defaultVariant = item.default_product_variant;
  const prices = defaultVariant?.prices ?? item.prices ?? [];
  const price = prices[0]?.amount ?? 0;

  const allVariants = (item.product_variants ?? []).map((variant) => ({
    inventory_quantity: 0,
    id: variant.id,
    prices: variant.prices.map((p) => ({
      amount: p.amount,
      code: p.currency_iso_code,
    })),
  }));

  const product: ProductGenericType = {
    productId: item.id,
    amount: `${price}`,
    names: [...item.names],
    descriptions: [...item.descriptions],
    image: item.images[0]?.image_url ?? "",
    variants: allVariants,
    options: [], //todo
    status: "", //todo
    variantsOptions: [],
    shareUrl: item.url ?? undefined,
    sku: item.sku ?? undefined,
  };
  return product;
}

export function getProductName(
  product: ProductType | ProductGenericType,
  language: string
) {
  const match = product.names.find((t) => t.language_iso_code === language);
  return (match ?? product.names[0])?.value;
}

export function getProductDescription(
  product: ProductType | ProductGenericType,
  language: string
) {
  const match = product.descriptions.find(
    (d) => d.text.language_iso_code === language
  );
  return (match ?? product.descriptions[0])?.text.value;
}
