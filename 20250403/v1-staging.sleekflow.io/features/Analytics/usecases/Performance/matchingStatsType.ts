import { ConversionStatusType } from "api/Analytics/fetchSalesPerformance";

export function matchingStatsType(type: "total" | "product") {
  const typesMap = {
    total: ["paid", "Converted", "ConvertedBySleekFlow", "NoStatus"],
    product: ["ConvertedBySleekFlow"],
  };
  return (rec: { status: ConversionStatusType }) =>
    typesMap[type].includes(rec.status);
}
