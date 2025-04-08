import { getWithExceptions } from "../apiRequest";
import { StripeOrderListResponseType } from "types/Stripe/Settings/StripeOrderType";
import { OrdersApiOptionsType } from "./fetchStaffOrders";

export async function fetchCompanyOrders(
  limit: number,
  offset: number,
  countryCode: string,
  options?: OrdersApiOptionsType
): Promise<StripeOrderListResponseType> {
  let param: any = {
    limit,
    offset,
    platformCountry: countryCode,
  };

  if (options?.dateFrom && options?.dateTo) {
    param = {
      ...param,
      startDate: options.dateFrom.format("YYYY-MM-DD"),
      endDate: options.dateTo.format("YYYY-MM-DD"),
    };
  }

  if (options?.status) {
    param.statuses = options.status;
  }
  if (options?.sort) {
    param.sortBy = options.sort.field;
    param.order = options.sort.direction;
  }

  return getWithExceptions("/SleekPay/company/payments", { param });
}
