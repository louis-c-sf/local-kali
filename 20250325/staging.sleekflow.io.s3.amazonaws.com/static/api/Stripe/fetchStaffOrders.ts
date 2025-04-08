import { Moment } from "moment/moment";
import { getWithExceptions } from "../apiRequest";
import { StripeOrderListResponseType } from "../../types/Stripe/Settings/StripeOrderType";

export type OrdersApiOptionsType = {
  status?: string;
  sort?: { field: string; direction: "asc" | "desc" };
  dateFrom?: Moment;
  dateTo?: Moment;
};

type SystemAwareOptionsType = {
  platformGenerated?: boolean;
};

export async function fetchStaffOrders(
  userId: string,
  limit: number,
  offset: number,
  countryCode: string,
  options?: OrdersApiOptionsType & SystemAwareOptionsType
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

  if (options?.platformGenerated) {
    param.isSystem = "true";
  }

  const url = `/SleekPay/company/staff/${userId}/payments`;

  return await getWithExceptions(url, { param });
}
