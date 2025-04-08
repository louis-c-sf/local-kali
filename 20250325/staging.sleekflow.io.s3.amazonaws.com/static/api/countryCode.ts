import {
  COUNTRY_CODE_FETCH_API,
  getExternalResource,
  getWithExceptions,
} from "./apiRequest";
import { fetchIpLocationInfo } from "./Company/fetchIpLocationInfo";

export interface IpResponseType {
  ipAddress: string;
}

export const getCountryCode = async () => {
  const ipLocationResult = await fetchIpLocationInfo();
  return {
    ...ipLocationResult,
    countryCode: ipLocationResult.countryCode2,
  };
};
