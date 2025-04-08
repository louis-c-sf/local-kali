import React, { useEffect } from "react";
import { TableView } from "../../layouts/TableView";
import { Table } from "../../components/Table/Table";
import { Filter } from "../../components/Filter/Filter";
import { equals } from "ramda";
import { GroupPagination } from "../../components/GroupPagination/GroupPagination";
import { useObjectsGridContext } from "../../components/ObjectsGrid/ObjectsGridContext";
import { useTranslation } from "react-i18next";
import { useLoadObjectsPage } from "../../components/ObjectsGrid/useLoadObjectsPage";
import {
  defaultOpportunitiesState,
  OpportunitiesFilterFormType,
  useOpportunitiesContext,
} from "./OpportunitiesContext";
import { ObjectNormalizedExpandedType } from "../../API/Objects/contracts";
import { fetchOpportunities } from "../../API/Opportunities/fetchOpportunities";
import { createFilterNormalizer } from "../../API/Objects/filters/normalizeFilter";
import { SearchFilter } from "../../API/Objects/filters/normalizeSearchFilter";
import { OpportunityDetail } from "./OpportunityDetail";

export function OpportunitiesGrid(props: {
  pageSize: number;
  pagesPerGroup: number;
}) {
  let { pageSize, pagesPerGroup } = props;
  const { stages } = useOpportunitiesContext();
  const { state, dispatch, getObjectUrl, getObjectCount } =
    useObjectsGridContext<
      ObjectNormalizedExpandedType<any>,
      OpportunitiesFilterFormType
    >();
  const { t } = useTranslation();

  const normalizeFilters = createFilterNormalizer<OpportunitiesFilterFormType>([
    { filter: "stage", apiName: "StageName" },
    { filter: "search", apiName: SearchFilter },
  ]);

  const loadPage = useLoadObjectsPage({
    pageSize,
    pagesPerGroup,
    normalizeFilters,
    fetchData: fetchOpportunities,
    state,
    dispatch,
  });

  //@eslint-disable react-hooks/exhaustive-deps
  useEffect(() => {
    loadPage.loadPage(1, { filter: state.filter });
  }, []);

  const defaultFilter = defaultOpportunitiesState().filter;

  function submitFilter(filter: OpportunitiesFilterFormType | null) {
    const override = filter ? { filter } : { filter: defaultFilter };
    return loadPage.loadPage(1, override);
  }

  function updateFilter(key: string, value: string) {
    dispatch({ type: "FILTER_UPDATE", values: { [key]: value } });
  }

  function resetFilter() {
    return dispatch({ type: "FILTER_RESET" });
  }

  const isResultsAreFiltered = !!(
    state.filterPrevious && !equals(state.filterPrevious, defaultFilter)
  );

  return (
    <>
      <TableView
        title={t("salesforce.opportunities.pageTitle")}
        loading={loadPage.loading}
        filter={
          <Filter
            onSubmit={submitFilter}
            filter={state.filter}
            updateFilter={updateFilter}
            resetFilter={resetFilter}
            inputs={[
              {
                name: "stage",
                type: "dropdown",
                placeholder: t("salesforce.table.filter.stage.label"),
                options: stages,
              },
            ]}
            loading={loadPage.loading}
            isResultsAreFiltered={isResultsAreFiltered}
          />
        }
        table={
          <Table
            noResultsHead={t("salesforce.table.opportunities.noResults.head")}
            noResultsSubHead={t(
              "salesforce.table.opportunities.noResults.subhead"
            )}
            showAvatar={false}
            sortBy={loadPage.changeSort}
            getObjectUrl={getObjectUrl}
            fields={[
              {
                name: "Name",
                head: t("salesforce.table.column.name.head"),
                type: "name",
                clickForDetails: true,
              },
              {
                name: "StageName",
                head: t("salesforce.table.column.stage.head"),
              },
              {
                name: "Owner",
                head: t("salesforce.table.column.owner.head"),
                type: "owner",
              },
              {
                name: "link",
                head: t("salesforce.table.column.link.head"),
                type: "link",
              },
            ]}
            sortableFields={{ Name: ["Name"] }}
          />
        }
        pagination={
          state.continuousPager.groupResults.length > pageSize && (
            <GroupPagination
              pageSize={pageSize}
              page={state.continuousPager.page}
              groupResultCount={state.continuousPager.groupResults.length}
              prevToken={state.continuousPager.nearestGroupTokens.prev}
              nextToken={state.continuousPager.nearestGroupTokens.next}
              disabled={loadPage.loading}
              pagesPerGroup={pagesPerGroup}
              onPageChange={loadPage.changePage}
              onNextGroup={loadPage.loadNextGroup}
              onPrevGroup={loadPage.loadPrevGroup}
            />
          )
        }
      />
      {state.detailVisible && state.detailData && (
        <OpportunityDetail data={state.detailData} />
      )}
    </>
  );
}
