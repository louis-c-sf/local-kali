import {
  ShopifyProductVariantMultiCurrencyType,
  ShopifyProductType,
} from "types/ShopifyProductType";
import { formatCurrency } from "utility/string";
import {
  ProductVariantGenericType,
  ProductOptionGenericType,
  ProductVariantOptionGenericType,
} from "core/models/Ecommerce/Cart/ProductProviderInterface";
import { ProductGenericType } from "core/models/Ecommerce/Cart/ProductGenericType";

export function matchesCurrencyCode(code: string) {
  return (c: ShopifyProductVariantMultiCurrencyType) => c.currencyCode === code;
}

export function formatAmount(
  productVariants: ProductVariantGenericType[],
  currency: string
) {
  const currenciesMapping = productVariants.reduce<
    ShopifyProductVariantMultiCurrencyType[]
  >((acc, curr) => {
    const multiCurrency = curr.multipleCurrencies?.find(
      matchesCurrencyCode(currency)
    );
    if (!multiCurrency) {
      return acc;
    }
    return [...acc, multiCurrency];
  }, []);
  const priceRange =
    currenciesMapping.length > 0
      ? currenciesMapping.map((p) => p.amount)
      : productVariants.map(
          (p) => p.prices.find(({ code }) => code === currency)?.amount ?? 0
        );
  const minValue = Math.min(...priceRange);
  const maxValue = Math.max(...priceRange);
  if (minValue === maxValue) {
    return `${formatCurrency(maxValue, currency)}`;
  }
  return `${formatCurrency(minValue, currency)} - ${formatCurrency(
    maxValue,
    currency
  )}`;
}

export function denormalizeShopifyProducts(
  products: ShopifyProductType[],
  shopifyCurrency: string
): ProductGenericType[] {
  return products
    .filter((p) =>
      p.variants.some(
        (v) =>
          v.multipleCurrencies?.some(matchesCurrencyCode(shopifyCurrency)) ??
          true
      )
    )
    .map((product) => {
      const [image] = product.images;
      const variantsDenormalized = product.variants.map((p) => {
        const { price, ...variantCommonFields } = p;
        return {
          ...variantCommonFields,
          prices: [{ code: shopifyCurrency, amount: price }],
        };
      });
      const descriptionEscaped = (product.body_html ?? "")
        .replace(/<br.*?>/gi, "\n")
        .replace(/<.*?>/g, "");
      return {
        productId: product.id,
        names: [{ value: product.title, language_iso_code: "" }],
        amount: `${formatAmount(variantsDenormalized, shopifyCurrency)}`,
        status: product.status,
        descriptions: [
          {
            image: null,
            text: { value: descriptionEscaped, language_iso_code: "" },
            type: "text",
            youtube: null,
          },
        ],
        image: image?.src,
        options: product.options.map((value) => ({
          id: value.id,
          name: value.name,
          values: [...value.values],
        })),
        variantsOptions: formatVariants(
          variantsDenormalized,
          shopifyCurrency,
          product.options
        ),
        variants: variantsDenormalized,
      };
    });
}

export function formatVariants(
  productVariants: ProductVariantGenericType[],
  currency: string,
  options: ProductOptionGenericType[]
): ProductVariantOptionGenericType[] {
  return productVariants.reduce(
    (values: ProductVariantOptionGenericType[], curr) => {
      let contentVal = {};
      options.map((o, index) => {
        const valueKey = `option${index + 1}`;
        if (o.values.includes(curr[valueKey])) {
          contentVal = {
            ...contentVal,
            [o.name]: curr[valueKey],
          };
        }
      });

      return [
        ...values,
        {
          ...contentVal,
          stock: curr.inventory_quantity,
          price:
            curr.multipleCurrencies?.find((c) => c.currencyCode === currency)
              ?.amount ??
            curr.prices.find(({ code }) => code === currency)?.amount ??
            0,
          id: curr.id,
        },
      ];
    },
    []
  );
}
