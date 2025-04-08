import { PeriodStatsType } from "api/Analytics/fetchSalesPerformance";
import { matchingStatsType } from "features/Analytics/usecases/Performance/matchingStatsType";

export function getConvertedSales(
  stats: PeriodStatsType,
  type: "total" | "product"
) {
  return stats.companyConversionPerformance
    .filter(matchingStatsType(type))
    .reduce((acc, next) => acc + next.totalPrice, 0);
}
export function getInfluenceSales(states: PeriodStatsType) {
  return (
    states.companyInfluencedSalesPerformance?.reduce(
      (acc, next) => acc + next.totalPrice,
      0
    ) ?? 0
  );
}
