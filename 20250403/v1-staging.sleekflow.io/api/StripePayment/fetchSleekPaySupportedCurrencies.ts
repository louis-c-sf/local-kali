import { getWithExceptions } from "api/apiRequest";

export type SleekPaySupportedCurrenciesType = {
  stripeSupportedCurrenciesMappings: {
    currency: string;
    platformCountry: string;
  }[];
};

export function fetchSleekPaySupportedCurrencies(): Promise<SleekPaySupportedCurrenciesType> {
  return getWithExceptions("/SleekPay/supported-currencies", {
    param: {},
  });
}
