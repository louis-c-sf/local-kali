import { fetchCustomStoresList } from "api/CommerceHub/fetchCustomStoresList";
import { useState } from "react";
import { CustomStoreType } from "core/models/Ecommerce/Catalog/CustomStoreType";
import { fetchStoreCurrencies } from "api/CommerceHub/fetchStoreCurrencies";

export function useCommerceHubCartBoot(props: { storeId: string | null }) {
  const [storesCache, setStoresCache] = useState<CustomStoreType[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState("HKD");
  const [currencies, setCurrencies] = useState<string[]>([]);
  const [booted, setBooted] = useState(false);

  const boot = async () => {
    if (props.storeId === null) {
      return;
    }
    return await Promise.all([
      fetchCustomStoresList().then((result) => {
        setStoresCache(result);
      }),

      fetchStoreCurrencies(props.storeId).then((result) => {
        setCurrencies(
          result.data.currencies.map((cur) => cur.currency_iso_code)
        );
      }),
    ]).then(() => setBooted(true));
  };

  return {
    boot: boot,
    booted,
    supportedCurrencies: currencies,
    storesCache: storesCache,
    selectedCurrency,
    setSelectedCurrency,
    store: storesCache.find((st) => st.id === props.storeId),
  };
}
