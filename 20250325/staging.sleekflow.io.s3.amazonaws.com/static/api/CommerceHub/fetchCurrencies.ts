import { postWithExceptions } from "api/apiRequest";

export function fetchCurrencies(): Promise<CurrenciesResponseType> {
  return postWithExceptions("/CommerceHub/Currencies/GetCurrencies", {
    param: {},
  });
}

interface CurrenciesResponseType {
  data: {
    currencies: Array<{
      currency_iso_code: string;
      currency_name: string;
      currency_symbol: string;
    }>;
  };
}
