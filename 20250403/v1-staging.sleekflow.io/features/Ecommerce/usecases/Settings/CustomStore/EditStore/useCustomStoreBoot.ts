import { useState } from "react";
import { CustomStoreType } from "core/models/Ecommerce/Catalog/CustomStoreType";
import { fetchCustomStoresList } from "api/CommerceHub/fetchCustomStoresList";
import { fetchStoreProducts } from "api/CommerceHub/fetchStoreProducts";
import { fetchStoreCurrencies } from "api/CommerceHub/fetchStoreCurrencies";

export function useCustomStoreBoot(storeId: string) {
  const [booting, setBooting] = useState(false);
  const [booted, setBooted] = useState<{
    store: CustomStoreType;
    hasProducts: boolean;
    currencies: string[];
  }>();

  const boot = async function (): Promise<{
    store: CustomStoreType;
    currencies: string[];
  }> {
    setBooting(true);
    try {
      const [stores, countResponse, currencyResponse] = await Promise.all([
        fetchCustomStoresList(),
        fetchStoreProducts(storeId, null, 1, false),
        fetchStoreCurrencies(storeId),
      ]);
      const store = stores.find((s) => s.id === storeId);
      if (!store) {
        throw {
          message: "Missing store",
          storeId,
          stores,
          code: "STORE_MISSING",
        };
      }

      const bootedData = {
        store,
        hasProducts: countResponse.data.count > 0,
        currencies: currencyResponse.data.currencies.map(
          (d) => d.currency_iso_code
        ),
      };
      setBooted(bootedData);

      return bootedData;
    } finally {
      setBooting(false);
    }
  };

  return {
    boot,
    booted,
    booting,
  };
}
