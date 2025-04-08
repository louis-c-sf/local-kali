import { get } from "api/apiRequest";
import CountryType from "types/CountryType";

interface Request {
  countryName?: string;
  countryCode?: string;
}
export async function fetchCompanyCountry(
  param: Request
): Promise<Array<CountryType>> {
  return await get("/company/countrylist", {
    param: {
      ...param,
    },
    config: {
      skipAuth: true,
    },
  });
}
