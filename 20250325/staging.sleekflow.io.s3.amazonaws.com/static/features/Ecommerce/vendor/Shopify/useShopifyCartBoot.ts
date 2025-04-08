import { useAppSelector } from "AppRootContext";
import { countryCodeMapping } from "config/localizable/useCountryCodeCurrencyMapping";
import { LoginType } from "types/LoginType";
import { equals } from "ramda";
import { useCallback, useState } from "react";
import {
  fetchShopifySetting,
  ShopifySettingResponseType,
} from "api/StripePayment/fetchShopifySetting";
import useFetchSingleShopifyStatus from "../../../../api/Channel/useFetchSingleShopifyStatus";
import { ShopifyConfigsType } from "../../../../types/CompanyType";

export function useShopifyCartBoot(props: { storeId: number | null }) {
  const [settings, setSettings] = useState<ShopifySettingResponseType | null>(
    null
  );
  const [storeStatus, setStoreStatus] = useState<ShopifyConfigsType | null>(
    null
  );

  const userDefaultCurrency = useAppSelector(
    (s) => s.loggedInUserDetail?.defaultCurrency ?? "HKD"
  );

  const storeId = props.storeId;
  const shopifyCurrencies = useAppSelector(
    selectCurrencies(props.storeId),
    equals
  );

  const shopifyCurrency = useAppSelector((s) => {
    if (storeId === null) {
      return userDefaultCurrency;
    }
    return (
      s.company?.shopifyConfigs?.find((s) => s.id === storeId)?.currency ??
      "HKD"
    );
  });

  const {
    boot: shopifyStatusBoot,
    isShopifyPaymentLink,
    loading: isShopifyStatusLoading,
  } = useFetchSingleShopifyStatus(props.storeId);

  const [booted, setBooted] = useState(false);

  const defaultShopifyCurrency =
    shopifyCurrencies && shopifyCurrencies.length > 0
      ? shopifyCurrencies.some((s) => s === userDefaultCurrency.toUpperCase())
        ? userDefaultCurrency.toUpperCase()
        : shopifyCurrencies[0]
      : shopifyCurrency;

  const boot = useCallback(async () => {
    async function bootShopifySetting() {
      return await fetchShopifySetting();
    }
    return await Promise.all([bootShopifySetting(), shopifyStatusBoot()]).then(
      ([settingResult, statusResult]) => {
        setSettings(settingResult);
        setStoreStatus(statusResult);
        setBooted(true);
      }
    );
  }, []);

  return {
    shopifyCurrencies,
    defaultShopifyCurrency,
    boot,
    booted,
    settings,
    storeStatus,
    isShopifyPaymentLink,
    isShopifyStatusLoading,
  };
}

function selectCurrencies(storeId: number | null) {
  return (s: LoginType) => {
    if (storeId === null) {
      return [];
    }
    return (
      s.company?.shopifyConfigs
        ?.find((s) => s.id === storeId)
        ?.supportedCountries.map(
          (country) => countryCodeMapping[country.countryCode]
        ) ?? []
    );
  };
}
