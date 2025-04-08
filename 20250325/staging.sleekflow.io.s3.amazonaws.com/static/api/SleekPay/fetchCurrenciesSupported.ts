import { getWithExceptions } from "api/apiRequest";

export function fetchCurrenciesSupported(): Promise<{
  stripeSupportedCurrenciesMappings: Array<{
    currency: string;
    platformCountry: string;
  }>;
}> {
  return getWithExceptions("/SleekPay/supported-currencies", { param: {} });
}
