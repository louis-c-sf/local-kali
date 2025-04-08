import React, { useState } from "react";
import { ALL } from "../Refund/RefundFilter";
import { Moment } from "moment/moment";
import {
  fetchStaffOrders,
  OrdersApiOptionsType,
} from "../../../api/Stripe/fetchStaffOrders";
import { SortType } from "./OrderGrid";
import { useAppSelector } from "../../../AppRootContext";
import { useAccessRulesGuard } from "../../../component/Settings/hooks/useAccessRulesGuard";
import { StripeOrderType } from "../../../types/Stripe/Settings/StripeOrderType";
import { useTeams } from "../useTeams";
import { matchesStaffId, matchesStaff } from "../../../types/TeamType";
import { StaffType } from "../../../types/StaffType";
import { fetchCompanyOrders } from "../../../api/Stripe/fetchCompanyOrders";
import { fetchTeamOrders } from "../../../api/Stripe/fetchTeamOrders";
import { PLATFORM_GENERATED } from "container/Settings/Order/OrdersFilter";

export type FilterType = {
  user: string;
  status: string;
  dateFrom?: Moment;
  dateTo?: Moment;
  countryCode: string;
};

const PAGE_SIZE = 20;
const statusMap = {
  Paid: "Paid&statuses=Refunded&statuses=RefundFailed&statuses=RefundPending&statuses=PartialRefund",
  RefundAll:
    "Refunded&statuses=RefundFailed&statuses=RefundPending&statuses=PartialRefund",
};

export function useFetchStripePage(initFilter: FilterType) {
  const accessRulesGuard = useAccessRulesGuard();
  const { teams } = useTeams();
  const userId = useAppSelector((s) => s.user.id);
  const [filter, setFilter] = useState<FilterType>(initFilter);
  const [page, setPage] = useState(1);
  const [recordsTotal, setRecordsTotal] = useState(0);
  const [sort, setSort] = useState<SortType | null>(null);
  const [results, setResults] = useState<StripeOrderType[]>([]);
  const [loading, setLoading] = useState(false);

  function getMySubordinateTeams() {
    const mySubordinateTeams = teams.filter((t) =>
      t.teamAdmins.some(matchesStaffId(userId))
    );
    return mySubordinateTeams.reduce<StaffType[]>((acc, next) => {
      const addedUsers = next.members.filter((m) => !acc.some(matchesStaff(m)));
      return [...acc, ...addedUsers];
    }, []);
  }

  function getOrdersFetcher(
    uId: string,
    limit: number,
    offset: number,
    countryCode: string,
    options?: OrdersApiOptionsType
  ) {
    if (uId === ALL) {
      if (accessRulesGuard.isAdmin()) {
        return fetchCompanyOrders(limit, offset, countryCode, options);
      }
      if (getMySubordinateTeams().length > 0) {
        return fetchTeamOrders(limit, offset, countryCode, options);
      }
    }
    if (uId === PLATFORM_GENERATED) {
      return fetchStaffOrders(userId, limit, offset, countryCode, {
        ...options,
        platformGenerated: true,
      });
    }
    return fetchStaffOrders(uId, limit, offset, countryCode, options);
  }

  async function fetchData(
    newFilter: FilterType,
    params?: {
      page?: number;
      sort?: SortType | null;
    }
  ) {
    const filterBeforeRequest = filter;
    setFilter(newFilter);
    let pageNumber = params?.page ?? page;

    if (newFilter.status !== filter.status || newFilter.user !== filter.user) {
      pageNumber = 1;
    }
    const pageBeforeRequest = page;
    setPage(pageNumber);

    const sortBeforeRequest = sort;
    if (params?.sort !== undefined) {
      setSort(params?.sort);
    }
    setLoading(true);

    const options: any = {
      status: statusMap[newFilter.status] || newFilter.status,
      dateFrom: newFilter?.dateFrom,
      dateTo: newFilter?.dateTo,
    };

    try {
      const sortParam = params?.sort ?? sort;
      if (sortParam) {
        options.sort = { ...sortParam };
      }
      const fetcher = getOrdersFetcher(
        newFilter.user,
        PAGE_SIZE,
        (pageNumber - 1) * PAGE_SIZE,
        newFilter.countryCode,
        options
      );
      const result = await fetcher;
      setResults(result.stripePaymentOrderPageRecords);
      setRecordsTotal(result.totalNumberOfRecords);
    } catch (e) {
      setPage(pageBeforeRequest);
      setFilter(filterBeforeRequest);
      setSort(sortBeforeRequest);
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return {
    fetchData,
    data: results,
    loading,
    page,
    totalPages: Math.ceil(recordsTotal / PAGE_SIZE),
    filter,
    sort,
    getMySubordinateTeams,
  };
}
