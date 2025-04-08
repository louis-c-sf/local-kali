import { useState } from "react";
import { ProductFormType } from "./useProductForm";
import { ProductType } from "core/models/Ecommerce/Catalog/ProductType";
import { useCustomStoreBoot } from "../EditStore/useCustomStoreBoot";
import { denormalizeProduct } from "features/Ecommerce/usecases/Settings/CustomStore/EditProduct/denormalizeProduct";
import { fetchProduct } from "api/CommerceHub/fetchProduct";
import { CurrencyType } from "core/models/Ecommerce/Catalog/CurrencyType";
import { useSupportedRegions } from "core/models/Region/useSupportedRegions";
import { isObject } from "lodash-es";
import { CustomStoreType } from "core/models/Ecommerce/Catalog/CustomStoreType";

export function useEditProductBoot(props: {
  storeId: string;
  productId?: string;
  onMissing: (reason: string) => void;
}) {
  const [booted, setBooted] = useState<{
    product: ProductFormType;
    productPrototype: ProductType;
    store: CustomStoreType;
  }>();
  const storeBoot = useCustomStoreBoot(props.storeId);
  const { currenciesSupported } = useSupportedRegions({ forceBoot: true });

  async function boot() {
    let currenciesLoaded: string[];
    let storeLoaded: CustomStoreType;

    try {
      const { store, currencies } = await storeBoot.boot();
      storeLoaded = store;
      currenciesLoaded = currencies;
    } catch (e) {
      if (isObject(e) && (e as any).code === "STORE_MISSING") {
        return props.onMissing(`No store loaded by id ${props.storeId}`);
      }
      throw e;
    }

    const currenciesAvailable = currenciesLoaded.reduce<CurrencyType[]>(
      (acc, next) => {
        const currencyMatch = currenciesSupported.find(
          (cu) => cu.currencyCode.toUpperCase() === next.toUpperCase()
        );
        return currencyMatch ? [...acc, currencyMatch] : acc;
      },
      []
    );

    let product: ProductType;

    if (props.productId) {
      const result = await fetchProduct(props.storeId, props.productId);
      product = result.data.product;
    } else {
      const languages = storeLoaded.languages;
      product = createBlankProduct(
        languages.map((ln) => ln.language_iso_code),
        props.storeId,
        currenciesLoaded //todo ensure with currenciesSupported?
      );
    }

    const productFormData = denormalizeProduct(product, storeLoaded);
    setBooted({
      productPrototype: product,
      product: productFormData,
      store: storeLoaded,
    });

    return productFormData;
  }

  return {
    boot,
    booted: booted,
    updatePrototype(data: ProductType) {
      setBooted((prev) => {
        if (!prev) {
          return undefined;
        }
        return { ...prev, productPrototype: { ...data } };
      });
    },
  };
}

function createBlankProduct(
  languages: string[],
  storeId: string,
  currencies: string[]
): ProductType {
  return {
    names: languages.map((lang) => ({ value: "", language_iso_code: lang })),
    prices: currencies.map((curr) => ({
      currency_iso_code: curr,
      amount: 0,
    })),
    url: "",
    descriptions: languages.map((lang) => ({
      text: { value: "", language_iso_code: lang },
      language_iso_code: lang,
      youtube: null,
      image: null,
      type: "text",
    })),
    metadata: {},
    images: [],
    category_ids: [],
    id: "",
    platform_identity: { metadata: {}, type: "CustomCatalog" },
    product_variant_attributes: [],
    product_variant_prices: [],
    product_variants: [],
    sku: "",
    store_id: storeId,
    attributes: [], //todo
    is_view_enabled: false,
    default_product_variant: {
      id: "",
      prices: currencies.map((curr) => ({
        currency_iso_code: curr,
        amount: 0,
      })),
      product_id: "",
      sku: "",
      store_id: storeId,
    },
  };
}
