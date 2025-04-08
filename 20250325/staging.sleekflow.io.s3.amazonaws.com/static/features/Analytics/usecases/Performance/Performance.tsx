import React, { useEffect, useState } from "react";
import styles from "features/Analytics/usecases/Performance/AnalyticsPerformanceContainer.module.css";
import { useTranslation } from "react-i18next";
import {
  DateRangeFilter,
  getPeriodString,
} from "component/shared/input/DateRangeFilter/DateRangeFilter";
import { TotalSalesChart } from "features/Analytics/usecases/Performance/TotalSalesChart/TotalSalesChart";
import { TotalSalesChartDummy } from "features/Analytics/usecases/Performance/TotalSalesChart/TotalSalesChartDummy";
import { TeamSalesChart } from "features/Analytics/usecases/Performance/TeamSalesChart/TeamSalesChart";
import { useTeams } from "container/Settings/useTeams";
import { TeamSalesChartDummy } from "features/Analytics/usecases/Performance/TeamSalesChart/TeamSalesChartDummy";
import { StaffPerformanceTable } from "features/Analytics/usecases/Performance/StaffPerformanceTable/StaffPerformanceTable";
import { StaffPerformanceTableDummy } from "features/Analytics/usecases/Performance/StaffPerformanceTable/StaffPerformanceTableDummy";
import { getTotalSales } from "features/Analytics/usecases/Performance/getTotalSales";
import {
  getConvertedSales,
  getInfluenceSales,
} from "features/Analytics/usecases/Performance/getConvertedSales";
import { CurrencySelector } from "features/Ecommerce/components/CurrencySelector/CurrencySelector";
import { LoggedInLayoutBasic } from "core/Layout/LoggedInLayoutBasic";
import { usePerformanceDashboardAPI } from "features/Analytics/usecases/Performance/usePerformanceDashboardAPI";
import { usePerformanceDashboardFilters } from "features/Analytics/usecases/Performance/usePerformanceDashboardFilters";
import moment from "moment";
import { useFeaturesGuard } from "component/Settings/hooks/useFeaturesGuard";
import { useSupportedRegions } from "core/models/Region/useSupportedRegions";
import { showCurrency } from "features/Stripe/usecases/StripeWidget/PaymentList";

const PAGE_SIZE = 15;
const YESTERDAY = moment().subtract(1, "day");

function Performance() {
  const { t } = useTranslation();
  const featuresGuard = useFeaturesGuard();
  const regions = useSupportedRegions();
  const canChangeCurrencies =
    featuresGuard.canUseStripePayments() &&
    regions.currenciesSupported.length > 1;

  const [booted, setBooted] = useState(false);

  const filters = usePerformanceDashboardFilters({
    dateStartInit: YESTERDAY.clone().subtract(7, "day"),
    dateEndInit: YESTERDAY.clone(),
    fetchAnalyticsForPeriod: async (...args) => {
      return await api.fetchAnalyticsForPeriod(...args);
    },
    fetchFirstPage: async (strategy, query) => {
      return await api.fetchPageAndUpdateUI(strategy, 0, PAGE_SIZE, query);
    },
    updatePage: async (...args) => {
      return await api.updatePage(...args);
    },
  });

  const api = usePerformanceDashboardAPI({
    pageSize: PAGE_SIZE,
    currency: filters.currencySelected,
    endDate: filters.endDate,
    sort: filters.sort,
    teamId: filters.teamId,
    startDate: filters.startDate,
  });

  const { refreshTeams, booted: teamsBooted } = useTeams();

  useEffect(() => {
    if (!teamsBooted) {
      refreshTeams();
    }
  }, [teamsBooted]);

  useEffect(() => {
    if (booted) {
      return;
    }
    api
      .fetchAnalyticsForPeriod(
        filters.startDate,
        filters.endDate,
        filters.currencySelected
      )
      .then(() => {
        setBooted(true);
      });
  }, [
    booted,
    filters.startDate.format("Y-M-D"),
    filters.endDate.format("Y-M-D"),
    filters.currencySelected.countryCode,
  ]);

  const currencyText = showCurrency(filters.currencySelected.currencyCode);

  return (
    <LoggedInLayoutBasic
      pageTitle={`${t("analytics.title")} | SleekFlow`}
      selectedItem={"Analytics"}
    >
      <div className={styles.container}>
        <div className={styles.header}>{t("analytics.performance.header")}</div>
        <div className={styles.filters}>
          {canChangeCurrencies && (
            <CurrencySelector
              value={filters.currencySelected.currencyCode}
              currencies={filters.regions.currenciesSupported}
              onChange={filters.changeCurrency}
              format={"long"}
            />
          )}
          <DateRangeFilter
            startDate={filters.startDate.clone()}
            endDate={filters.endDate.clone()}
            maxDate={YESTERDAY.clone()}
            setDates={filters.changeDates}
            showComparedPeriod
          />
        </div>
        <div className={styles.actions}>{/* todo Add Export after MVP */}</div>
        <div className={styles.totalSales}>
          {booted &&
          api.statsSummaryCurrPeriod &&
          api.statsSummaryPrevPeriod ? (
            <TotalSalesChart
              influenceSales={getInfluenceSales(api.statsSummaryCurrPeriod)}
              influenceSalesPrev={getInfluenceSales(api.statsSummaryPrevPeriod)}
              totalSales={getTotalSales(api.statsSummaryCurrPeriod, "total")}
              totalSalesPrev={getTotalSales(
                api.statsSummaryPrevPeriod,
                "total"
              )}
              convertedSales={getConvertedSales(
                api.statsSummaryCurrPeriod,
                "product"
              )}
              convertedSalesPrev={getConvertedSales(
                api.statsSummaryPrevPeriod,
                "product"
              )}
              period={
                getPeriodString(filters.startDate, filters.endDate, t) ?? ""
              }
            />
          ) : (
            <TotalSalesChartDummy />
          )}
        </div>
        <div className={styles.teamSales}>
          {booted && api.statsSummaryCurrPeriod ? (
            <TeamSalesChart
              data={api.statsSummaryCurrPeriod.teamConversionPerformance}
              currency={currencyText}
            />
          ) : (
            <TeamSalesChartDummy />
          )}
        </div>
        <div className={styles.staffSales}>
          {booted && teamsBooted && api.statsStaff ? (
            <StaffPerformanceTable
              data={api.statsStaff}
              platformGeneratedData={api.statsPlatform}
              sort={filters.sort}
              onSortChange={filters.changeSort}
              onTeamChange={filters.changeTeam}
              hasMore={api.hasMore}
              loadMore={api.fetchNextPage}
              teamId={filters.teamId}
              loading={api.loading}
              pageSize={PAGE_SIZE}
              currency={currencyText}
            />
          ) : (
            <StaffPerformanceTableDummy />
          )}
        </div>
      </div>
    </LoggedInLayoutBasic>
  );
}

export default Performance;
