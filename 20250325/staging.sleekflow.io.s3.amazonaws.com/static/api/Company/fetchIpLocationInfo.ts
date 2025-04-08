import { getWithExceptions } from "api/apiRequest";

interface Response {
  countryCode2: string;
  countryCode3: string;
  countryName: string;
  stateProvince: string;
  district: string;
  zipCode: string;
  latitude: string;
  longitude: string;
  currency: {
    currencyName: string;
    currencyCode: string;
    currencySymbol: string;
  };
}
export async function fetchIpLocationInfo(): Promise<Response> {
  return await getWithExceptions("/location-info-v2", {
    param: {},
    config: {
      skipAuth: true,
    },
  });
}
