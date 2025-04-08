import React, {
  useContext,
  ReactNode,
  useState,
  useCallback,
  useEffect,
} from "react";
import { fetchCurrenciesSupported } from "api/SleekPay/fetchCurrenciesSupported";
import { RegionContextType } from "core/models/Region/RegionContextType";
import { CurrencyType } from "core/models/Ecommerce/Catalog/CurrencyType";

const DEFAULT_CURRENCY: CurrencyType = {
  currencyCode: "hkd",
  countryCode: "HK",
} as const;

const RegionContextInternal = React.createContext<RegionContextType>({
  booted: false,
  currenciesSupported: [{ ...DEFAULT_CURRENCY }],
  boot: async () => {},
});

export function useSupportedRegions(props?: { forceBoot?: boolean }) {
  const { forceBoot = false } = props ?? {};
  const context = useContext(RegionContextInternal);

  useEffect(() => {
    if (!forceBoot || context.booted) {
      return;
    }
    context.boot();
  }, [forceBoot, context]);

  return context;
}

export function RegionContext(props: { children: ReactNode }) {
  const [booted, setBooted] = useState(false);
  const [currencies, setCurrencies] = useState<CurrencyType[]>([
    { ...DEFAULT_CURRENCY },
  ]);

  const boot = useCallback(async () => {
    try {
      const result = await fetchCurrenciesSupported();
      setCurrencies(
        result.stripeSupportedCurrenciesMappings.map((m) => ({
          countryCode: m.platformCountry,
          currencyCode: m.currency,
        }))
      );
      setBooted(true);
    } catch (e) {
      console.error(e);
    }
  }, []);

  return (
    <RegionContextInternal.Provider
      value={{
        currenciesSupported: currencies,
        booted,
        boot,
      }}
    >
      {props.children}
    </RegionContextInternal.Provider>
  );
}
