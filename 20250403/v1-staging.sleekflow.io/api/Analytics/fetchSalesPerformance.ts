import { Moment } from "moment";
import { getWithExceptions } from "../apiRequest";

export async function fetchSalesPerformance(
  from: Moment,
  to: Moment,
  countryCode: string
): Promise<SalesPerformanceResponseType> {
  return getWithExceptions(`/company/Shopify/order/statistics`, {
    param: {
      from: from.format("YYYY-MM-DD"),
      to: to.format("YYYY-MM-DD"),
      platformCountry: countryCode,
    },
  });
}

type StatRecordType = {
  from: string;
  to: string;
  totalPrice: number;
  totalCount: number;
  type: string;
};

export type TeamStatRecordType = StatRecordType & {
  teamId: string;
};

export type ConversionStatusType =
  | "paid"
  | "ConvertedBySleekFlow"
  | "Converted"
  | "NoStatus"
  | "refunded"
  | "partially_refunded";
export type CompanyInfluenceSalesType = {
  type: "Shopify";
  from: string;
  to: string;
  status: "InfluencedSalesBySleekFlow";
  totalPrice: number;
  totalCount: number;
};
export type PeriodStatsType = {
  startDate: string;
  endDate: string;
  companyInfluencedSalesPerformance?: Array<CompanyInfluenceSalesType>;
  companyPerformance: Array<StatRecordType & { status: ConversionStatusType }>;
  companyConversionPerformance: Array<
    StatRecordType & { status: ConversionStatusType }
  >;
  teamConversionPerformance: TeamStatRecordType[];
};

export type SalesPerformanceResponseType = {
  targetPeriod: PeriodStatsType;
  previousPeriod: PeriodStatsType;
};
