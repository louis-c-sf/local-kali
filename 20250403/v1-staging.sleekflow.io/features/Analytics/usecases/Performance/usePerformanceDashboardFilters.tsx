import moment, { Moment } from "moment/moment";
import { CurrencyType } from "core/models/Ecommerce/Catalog/CurrencyType";
import { SortParamType } from "api/Analytics/fetchStaffPerformance";
import { useState } from "react";
import { useSupportedRegions } from "core/models/Region/useSupportedRegions";

export interface UpdatePageInterface {
  (query?: {
    sort?: SortParamType | null;
    teamId?: number | null;
  }): Promise<void>;
}

export interface FetchPeriodInterface {
  (
    dateStart: moment.Moment,
    dateEnd: moment.Moment,
    currency: CurrencyType
  ): Promise<void>;
}

export interface FetchPageInterface {
  (
    strategy: "append" | "update" | "reset",
    query?: { sort?: SortParamType | null; teamId?: number | null }
  ): Promise<void>;
}

export function usePerformanceDashboardFilters(props: {
  dateStartInit: Moment;
  dateEndInit: Moment;
  updatePage: UpdatePageInterface;
  fetchAnalyticsForPeriod: FetchPeriodInterface;
  fetchFirstPage: FetchPageInterface;
}) {
  const regions = useSupportedRegions({ forceBoot: true });
  const [currencySelected, setCurrencySelected] = useState<CurrencyType>(
    regions.currenciesSupported[0]
  );

  const [startDate, setStartDate] = useState<Moment>(
    props.dateStartInit.clone()
  );

  const [endDate, setEndDate] = useState<Moment>(props.dateEndInit.clone());
  const [sort, setSort] = useState<SortParamType | null>(null);
  const [teamId, setTeamId] = useState<number | null>(null);

  function changeDates(dateStart: Moment, dateEnd: Moment) {
    setStartDate(dateStart);
    setEndDate(dateEnd);
    props.fetchAnalyticsForPeriod(dateStart, dateEnd, currencySelected);
  }

  function changeCurrency(currencyCode: string) {
    const currency = regions.currenciesSupported.find(
      (c) => c.currencyCode === currencyCode
    );
    if (currency) {
      setCurrencySelected(currency);
      props.fetchAnalyticsForPeriod(startDate, endDate, currency);
    }
  }

  const changeSort = (sort: SortParamType | null) => {
    setSort(sort);
    props.updatePage({ sort });
  };

  const changeTeam = (teamId: number | null) => {
    setTeamId(teamId);
    switchFilter({ teamId });
  };

  async function switchFilter(query?: {
    sort?: SortParamType | null;
    teamId?: number | null;
  }) {
    return await props.fetchFirstPage("reset", query);
  }

  return {
    currencySelected,
    startDate,
    endDate,
    sort,
    teamId,
    changeSort,
    changeTeam,
    changeDates,
    changeCurrency,
    regions,
  };
}
