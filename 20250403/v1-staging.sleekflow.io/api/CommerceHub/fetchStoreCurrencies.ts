import { postWithExceptions } from "api/apiRequest";

export async function fetchStoreCurrencies(
  storeId: string
): Promise<ResponseType> {
  return await postWithExceptions(
    "/CommerceHub/Currencies/GetSupportedCurrencies",
    { param: { store_id: storeId } }
  );
}

export interface CurrencyResponseItemType {
  currency_iso_code: string;
  currency_name: string;
  currency_symbol: string;
}

interface ResponseType {
  success: boolean;
  data: {
    currencies: Array<CurrencyResponseItemType>;
  };
}
