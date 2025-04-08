import { PeriodStatsType } from "api/Analytics/fetchSalesPerformance";
import { matchingStatsType } from "features/Analytics/usecases/Performance/matchingStatsType";

export function getTotalSales(
  stats: PeriodStatsType,
  type: "total" | "product"
) {
  return stats.companyPerformance
    .filter(matchingStatsType(type))
    .reduce((acc, next) => acc + next.totalPrice, 0);
}
