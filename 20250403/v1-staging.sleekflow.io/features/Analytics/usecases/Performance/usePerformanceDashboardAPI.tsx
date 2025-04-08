import {
  SortParamType,
  fetchStaffPerformance,
  StaffPerformanceRecordType,
} from "api/Analytics/fetchStaffPerformance";
import moment from "moment";
import { CurrencyType } from "core/models/Ecommerce/Catalog/CurrencyType";
import { useState } from "react";
import { Moment } from "moment/moment";
import {
  fetchSalesPerformance,
  PeriodStatsType,
} from "api/Analytics/fetchSalesPerformance";

type PageQueryType = {
  sort?: SortParamType | null;
  teamId?: number | null;
};

export function usePerformanceDashboardAPI(props: {
  teamId: number | null;
  sort: SortParamType | null;
  currency: CurrencyType;
  startDate: Moment;
  endDate: Moment;
  pageSize: number;
}): {
  updatePage: (query?: PageQueryType) => Promise<void>;
  fetchNextPage: () => Promise<void>;
  statsSummaryPrevPeriod: PeriodStatsType | undefined;
  hasMore: boolean;
  statsStaff: StaffPerformanceRecordType[];
  loading: boolean;
  statsSummaryCurrPeriod: PeriodStatsType | undefined;
  statsPlatform: StaffPerformanceRecordType | undefined;
  fetchAnalyticsForPeriod: (
    dateStart: moment.Moment,
    dateEnd: moment.Moment,
    currency?: CurrencyType
  ) => Promise<void>;
  fetchPageAndUpdateUI: (
    strategy: "append" | "update" | "reset",
    offset: number,
    limit: number,
    query?: PageQueryType
  ) => Promise<void>;
} {
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [statsSummaryCurrPeriod, setStatsSummaryCurrPeriod] =
    useState<PeriodStatsType>();
  const [statsSummaryPrevPeriod, setStatsSummaryPrevPeriod] =
    useState<PeriodStatsType>();
  const [statsPlatform, setStatsPlatform] =
    useState<StaffPerformanceRecordType>();
  const [statsStaff, setStatsStaff] = useState<StaffPerformanceRecordType[]>(
    []
  );

  async function fetchAllAnalytics(
    startDate: Moment,
    endDate: Moment,
    currency?: CurrencyType
  ) {
    const countryCode = currency?.countryCode ?? "HK";

    return await Promise.all([
      fetchSalesPerformance(startDate, endDate, countryCode),
      fetchStaffPerformance(
        startDate,
        endDate,
        props.pageSize,
        0,
        countryCode,
        {
          teamId: props.teamId ?? undefined,
          sort: props.sort ?? undefined,
          withSystemStats: true,
        }
      ),
    ]);
  }

  async function fetchNextPage() {
    return await fetchPageAndUpdateUI(
      "append",
      statsStaff.length,
      props.pageSize
    );
  }

  async function fetchAnalyticsForPeriod(
    dateStart: moment.Moment,
    dateEnd: moment.Moment,
    currency?: CurrencyType
  ) {
    setLoading(true);
    const [salesResult, staffResult] = await fetchAllAnalytics(
      dateStart,
      dateEnd,
      currency
    );
    try {
      setStatsSummaryCurrPeriod(salesResult.targetPeriod);
      setStatsSummaryPrevPeriod(salesResult.previousPeriod);
      const [platformData, ...mainData] = staffResult.data;
      setStatsPlatform(platformData);
      setStatsStaff(mainData);
      setHasMore(staffResult.count > props.pageSize);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchPageAndUpdateUI(
    strategy: "append" | "update" | "reset",
    offset: number,
    limit: number,
    query?: { sort?: SortParamType | null; teamId?: number | null }
  ) {
    setLoading(true);
    const sortActual = query?.sort === undefined ? props.sort : query.sort;
    const teamIdActual =
      query?.teamId === undefined ? props.teamId : query.teamId;

    try {
      const results = await fetchStaffPerformance(
        props.startDate,
        props.endDate,
        limit,
        offset,
        props.currency.countryCode,
        {
          sort: sortActual ?? undefined,
          teamId: teamIdActual ?? undefined,
          withSystemStats: true,
        }
      );
      if (strategy === "append") {
        const dataUpdated = [...statsStaff, ...results.data];
        setStatsStaff(dataUpdated);
        setHasMore(results.count > dataUpdated.length);
      } else if (strategy === "reset" || strategy === "update") {
        const [platformRow, ...mainData] = results.data;
        setStatsPlatform(platformRow);
        setStatsStaff(mainData);
        setHasMore(results.count > results.data.length);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function updatePage(query?: PageQueryType): Promise<void> {
    return await fetchPageAndUpdateUI("update", 0, statsStaff.length, query);
  }

  return {
    updatePage,
    fetchAnalyticsForPeriod,
    fetchPageAndUpdateUI,
    statsSummaryCurrPeriod,
    statsSummaryPrevPeriod,
    statsStaff,
    statsPlatform,
    hasMore,
    fetchNextPage,
    loading,
  };
}
