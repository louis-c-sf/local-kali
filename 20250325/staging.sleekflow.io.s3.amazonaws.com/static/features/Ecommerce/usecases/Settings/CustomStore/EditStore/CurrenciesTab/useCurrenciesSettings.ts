import { useState } from "react";
import { CustomStoreType } from "core/models/Ecommerce/Catalog/CustomStoreType";
import { fetchCurrencies } from "api/CommerceHub/fetchCurrencies";
import { fetchCustomStore } from "api/CommerceHub/fetchCustomStore";
import { submitUpdateCustomStore } from "api/CommerceHub/submitUpdateCustomStore";
import { adjust } from "ramda";
import { fetchStoreProducts } from "api/CommerceHub/fetchStoreProducts";
import { useFlashMessageChannel } from "component/BannerMessage/flashBannerMessage";
import { useTranslation } from "react-i18next";

interface CurrencyValueType {
  currency_iso_code: string;
  currency_name: string;
  currency_symbol: string;
  enabled: boolean;
}

export function useCurrenciesSettings(storeId: string) {
  const [booted, setBooted] = useState<{
    storeInit: CustomStoreType;
    hasProducts: boolean;
  }>();
  const [values, setValues] = useState<CurrencyValueType[]>([]);
  const [loading, setLoading] = useState(false);
  const flash = useFlashMessageChannel();
  const { t } = useTranslation();

  const toggleCurrency = (code: string) => {
    setValues((values) => {
      const idx = values.findIndex((v) => v.currency_iso_code === code);
      if (idx > -1) {
        return adjust(
          idx,
          (curr) => ({ ...curr, enabled: !curr.enabled }),
          values
        );
      }
      return values;
    });
  };

  const saveCurrencies = async () => {
    if (!booted?.storeInit) {
      return;
    }
    setLoading(true);
    try {
      await submitUpdateCustomStore({
        ...booted.storeInit,
        currencies: values
          .filter((v) => v.enabled)
          .map((v) => {
            const { enabled, ...valueNormalized } = v;
            return valueNormalized;
          }),
      });
      flash(t("settings.commerce.flash.settingsSaved"));
    } catch (e) {
      flash(t("flash.settings.payment.error"));
      console.error(e, values, booted.storeInit);
    } finally {
      setLoading(false);
    }
  };

  return {
    boot: async () => {
      setLoading(true);
      const promises = [
        fetchCurrencies(),
        fetchCustomStore(storeId),
        fetchStoreProducts(storeId, null, 1, false),
      ] as const;
      try {
        const [currencies, store, products] = await Promise.all(promises);
        const currenciesInitial = currencies.data.currencies.map((c) => {
          return {
            ...c,
            enabled: store.currencies.some(
              (sc) => sc.currency_iso_code === c.currency_iso_code
            ),
          };
        });
        setBooted({
          storeInit: store,
          hasProducts: products.data.count > 0,
        });
        setValues(currenciesInitial);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    },
    booted,
    loading,
    values,
    toggleCurrency: toggleCurrency,
    saveCurrencies: saveCurrencies,
  };
}
