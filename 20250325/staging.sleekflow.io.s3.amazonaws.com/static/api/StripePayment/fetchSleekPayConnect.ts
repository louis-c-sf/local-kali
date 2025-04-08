import { getWithExceptions } from "api/apiRequest";

export type SleekPayConnectResponseType = {
  title: string;
  url: string;
  trackingUrl: string;
};

export function fetchSleekPayConnect(
  country: string
): Promise<SleekPayConnectResponseType> {
  return getWithExceptions("/SleekPay/Connect", {
    param: { platformCountry: country },
  });
}
