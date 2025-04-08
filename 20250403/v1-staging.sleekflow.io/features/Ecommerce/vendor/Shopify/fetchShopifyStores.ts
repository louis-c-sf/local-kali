import { StoreOptionType } from "core/models/Ecommerce/Cart/ProductProviderInterface";
import { fetchShopifyStatusList } from "api/Stripe/fetchShopifyStatusList";
import { fetchCurrenciesSupported } from "api/SleekPay/fetchCurrenciesSupported";

export async function fetchShopifyStores(): Promise<StoreOptionType[]> {
  const results = await fetchShopifyStatusList();

  return results.map((store) => ({
    id: store.id,
    name: store.name,
    isShowInInbox: store.isShowInInbox,
    vendor: "shopify",
    language: "",
    languages: [],
  }));
}
