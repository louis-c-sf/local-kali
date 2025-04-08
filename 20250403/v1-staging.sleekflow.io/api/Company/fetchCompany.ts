import { getWithExceptions, getWithExceptions$ } from "../apiRequest";
import { GET_COMPANY } from "../apiPath";
import CompanyType from "../../types/CompanyType";

export async function fetchCompany(): Promise<CompanyType> {
  return await getWithExceptions(GET_COMPANY, { param: {} });
}

export const fetchCompany$ = () => {
  return getWithExceptions$(GET_COMPANY, { param: {} });
};
