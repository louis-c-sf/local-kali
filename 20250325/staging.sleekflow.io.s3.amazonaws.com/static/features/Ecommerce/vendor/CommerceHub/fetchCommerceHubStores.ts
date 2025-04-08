import { StoreOptionType } from "core/models/Ecommerce/Cart/ProductProviderInterface";
import { fetchCustomStoresList } from "api/CommerceHub/fetchCustomStoresList";

export async function fetchCommerceHubStores(): Promise<StoreOptionType[]> {
  const stores = await fetchCustomStoresList();

  return stores.map((store) => {
    const languages = store.languages.map((lang) => lang.language_iso_code);
    const defaultIdx = store.languages.findIndex((lang) => lang.is_default);
    return {
      vendor: "commerceHub",
      isShowInInbox: store.is_view_enabled,
      name: store.names[0]?.value ?? "-",
      id: store.id,
      language: languages[defaultIdx > -1 ? defaultIdx : 0],
      languages: store.languages.map((lang) => ({
        code: lang.language_iso_code,
        name: lang.language_name,
      })),
    };
  });
}
