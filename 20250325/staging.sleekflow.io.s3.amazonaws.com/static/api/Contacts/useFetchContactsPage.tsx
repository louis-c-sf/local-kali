import {
  NormalizedSearchResponseType,
  sortFieldDirectionMap,
  sortFieldNameMap,
  SortParamType,
} from "../../container/Contact";
import {
  CountContactsResultType,
  SearchContactResultType,
  SelectAllContactResultType,
} from "../../types/ProfileSearchType";
import { useCallback } from "react";
import { fetchSelectAll } from "./fetchSelectAll";
import { fetchCountContacts } from "./fetchCountContacts";
import { fetchSearchContacts } from "./fetchSearchContacts";
import { fetchAllContacts } from "./fetchAllContacts";
import {
  ContactsPageFetcher,
  FiltersTupleType,
  ContactsRequestExtensionType,
  FilterBuilderType,
} from "./types";

export function useFetchContactsPage(
  buildFilters: FilterBuilderType,
  quickSearch?: string
) {
  const fetchContactsPage: ContactsPageFetcher = useCallback(
    async (
      page: number,
      sort: SortParamType[],
      pageSize: number,
      extend: ContactsRequestExtensionType,
      allSelected: boolean
    ): Promise<NormalizedSearchResponseType> => {
      let query: Parameters<typeof fetchAllContacts>[0] = {
        limit: String(pageSize),
        offset: String(pageSize * (page - 1)),
      };
      const [onlySortParam] = sort;
      if (onlySortParam?.direction) {
        query.sortby =
          sortFieldNameMap[onlySortParam.field] ?? onlySortParam.field;
        query.order =
          sortFieldDirectionMap[onlySortParam.direction] ??
          onlySortParam.direction;
      }
      const [adjustableFilters, constantFilters] = buildFilters(extend);
      const allFilters =
        quickSearch?.trim() !== ""
          ? [...adjustableFilters, ...constantFilters]
          : [...constantFilters, ...adjustableFilters];

      let searchPromise: Promise<SearchContactResultType>;
      if (allFilters.length > 0) {
        searchPromise = fetchSearchContacts(query, allFilters);
      } else {
        searchPromise = fetchAllContacts(query);
      }

      let searchResult: SearchContactResultType;
      let totalResultUnfiltered: SelectAllContactResultType | undefined;
      let totalResultFiltered: SelectAllContactResultType | undefined;

      try {
        [searchResult, [totalResultFiltered, totalResultUnfiltered]] =
          await Promise.all([
            searchPromise,
            buildContactsCountPromise(extend, allSelected),
          ]);
        const userProfileIds = searchResult.userProfiles.map((up) => up.id);

        return {
          items: searchResult.userProfiles,
          totalFiltered: totalResultFiltered?.totalResult ?? 0,
          totalUnfiltered: totalResultUnfiltered?.totalResult ?? 0,
          pageIds: userProfileIds,
          targetIdsCount: totalResultFiltered?.totalResult ?? 0,
          selectedIds: allSelected
            ? totalResultFiltered?.userProfileIds
            : undefined,
        };
      } catch (error) {
        console.error(`Contact: fetch user profile error ${error}`);
        return {
          items: [],
          totalFiltered: 0,
          totalUnfiltered: 0,
          pageIds: [],
          targetIdsCount: 0,
          selectedIds: undefined,
        };
      }
    },
    [buildFilters]
  );

  const buildContactsCountPromise = useCallback(
    (
      extend: ContactsRequestExtensionType = {},
      allSelected: boolean
    ): Promise<[SelectAllContactResultType, SelectAllContactResultType]> => {
      return getCountContactsPromise(buildFilters, extend, allSelected);
    },
    [buildFilters]
  );

  const selectAll = useCallback(
    async (
      extend: ContactsRequestExtensionType = {}
    ): Promise<SelectAllContactResultType> => {
      const [adjustableFilters, constantFilters] = buildFilters(extend);
      const allFilters = [...adjustableFilters, ...constantFilters];
      return fetchSelectAll(allFilters);
    },
    [buildFilters]
  );

  return {
    fetchContactsPage,
    selectAll,
  };
}

export function getCountContactsPromise(
  buildFilters: (extend: ContactsRequestExtensionType) => FiltersTupleType,
  extend: ContactsRequestExtensionType,
  allSelected: boolean
): Promise<[SelectAllContactResultType, SelectAllContactResultType]> {
  const [adjustableFilters, constantFilters] = buildFilters(extend);
  const allFilters = [...constantFilters, ...adjustableFilters];

  function transformToSelectAllResult(r: CountContactsResultType) {
    return {
      totalResult: r.totalResult,
      allProfilesSelectedCount: 0,
      userProfileIds: [],
    };
  }

  const countUnfilteredPromise = fetchCountContacts(constantFilters).then(
    transformToSelectAllResult
  );

  if (!allSelected) {
    const countFilteredPromise = fetchCountContacts(allFilters).then(
      transformToSelectAllResult
    );
    if (adjustableFilters.length > 0) {
      return Promise.all([countFilteredPromise, countUnfilteredPromise]);
    } else {
      return countUnfilteredPromise.then((result) => [result, result]);
    }
  } else {
    const selectFilteredPromise = fetchSelectAll(allFilters);
    if (adjustableFilters.length > 0) {
      return Promise.all([selectFilteredPromise, countUnfilteredPromise]);
    } else {
      return selectFilteredPromise.then((result) => [result, result]);
    }
  }
}
