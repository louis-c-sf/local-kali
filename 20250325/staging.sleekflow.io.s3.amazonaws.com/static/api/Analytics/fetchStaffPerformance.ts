import { Moment } from "moment";
import { getWithExceptions } from "../apiRequest";
import { StaffType } from "types/StaffType";

export async function fetchStaffPerformance(
  from: Moment,
  to: Moment,
  limit: number,
  offset: number,
  countryCode: string,
  options?: {
    teamId?: number;
    sort?: SortParamType;
    withSystemStats?: boolean;
  }
): Promise<StaffPerformanceResponseType> {
  const param: any = {
    from: from.format("YYYY-MM-DD"),
    to: to.format("YYYY-MM-DD"),
    platformCountry: countryCode,
    limit,
    offset,
  };
  if (options?.teamId) {
    param.teamId = options.teamId;
  }
  if (options?.sort) {
    param.sortBy = options.sort.field;
    param.sortOrder = options.sort.direction;
  }
  if (options?.withSystemStats) {
    param.isIncludeSystemStatistics = "true";
  }

  return getWithExceptions(`/company/Shopify/order/staff/statistics`, {
    param: param,
  });
}

export type SortParamType = {
  field: string;
  direction: "asc" | "desc";
};

export type StaffPerformanceRecordType = {
  staff: StaffType;
  linkSharedCount: number;
  linkSharedClicks: number;
  paymentLinkSharedCount: number;
  paymentLinkSharedClicks: number;
  paymentLinkSharedPaid: number;
  paymentLinkConvertedAmount: number;
};

export type StaffPerformanceResponseType = {
  data: StaffPerformanceRecordType[];
  count: number;
};
