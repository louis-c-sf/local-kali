import React, { useEffect, useState } from "react";
import { useLoadObjectsPage } from "../../components/ObjectsGrid/useLoadObjectsPage";
import { useObjectsGridContext } from "../../components/ObjectsGrid/ObjectsGridContext";
import { CampaignNormalizedType } from "./models/CampaignNormalizedType";
import { CampaignsFilterFormType } from "./models/CampaignsFilterFormType";
import { useTranslation } from "react-i18next";
import { createFilterNormalizer } from "../../API/Objects/filters/normalizeFilter";
import { SearchFilter } from "../../API/Objects/filters/normalizeSearchFilter";
import { fetchCampaigns } from "../../API/Campaigns/fetchCampaigns";
import { TableView } from "../../layouts/TableView";
import { Filter } from "../../components/Filter/Filter";
import { useCampaignDependenciesContext } from "./models/CampaignsDependencenciesProvider";
import { equals } from "ramda";
import { Table } from "../../components/Table/Table";
import { GroupPagination } from "../../components/GroupPagination/GroupPagination";
import { CampaignDetail } from "./CampaignDetail";
import { defaultCampaignsState } from "./models/CampaignsGridProvider";
import { FetchObjectsInterface } from "../../components/ObjectsGrid/ObjectsGridContextType";
import {
  fetchLeadsCount,
  ObjectCountType,
} from "../../API/Campaigns/fetchLeadsCount";
import { FieldReader } from "../../API/Objects/FieldReader/FieldReader";
import { updateOrAppendShallow } from "../../../../utility/array";
import { ObjectNormalizedExpandedType } from "features/Salesforce/API/Objects/contracts";

export function CampaignsGrid(props: {
  pageSize: number;
  pagesPerGroup: number;
}) {
  const { t } = useTranslation();
  const dependencies = useCampaignDependenciesContext();
  const [countersCache, setCountersCache] = useState<ObjectCountType[]>([]);
  const grid = useObjectsGridContext<
    CampaignNormalizedType,
    CampaignsFilterFormType
  >();

  const normalizeFilters = createFilterNormalizer<CampaignsFilterFormType>([
    { filter: "stage", apiName: "Status" },
    { filter: "search", apiName: SearchFilter },
  ]);

  const matchesCounter = (input: { id: string }) => (data: ObjectCountType) => {
    return data.id === input.id;
  };
  const fetchPageWithCounters: FetchObjectsInterface<
    ObjectNormalizedExpandedType<any>
  > = async (filters, sorts, limit, offsetToken) => {
    const itemResults = await fetchCampaigns(
      filters,
      sorts,
      limit,
      offsetToken
    );
    try {
      const fieldReader = new FieldReader(
        dependencies.fieldTypesScalar,
        dependencies.fieldTypesChoice
      );
      const counts = await fetchLeadsCount(
        itemResults.records.map((rec) =>
          fieldReader.getValue(rec, "SalesforceIntegratorId")
        )
      );

      setCountersCache((cache) => {
        return counts.reduce<ObjectCountType[]>((acc, next) => {
          const campaignMatch = itemResults.records.find(
            (rec) =>
              fieldReader.getValue(rec, "SalesforceIntegratorId") === next.id
          );
          if (!campaignMatch) {
            return acc;
          }
          const updatedCounter: ObjectCountType = {
            id: campaignMatch.id,
            count: next.count,
          };
          return updateOrAppendShallow(
            matchesCounter(updatedCounter),
            {
              ...updatedCounter,
            },
            acc
          );
        }, cache);
      });
    } catch (e) {
      console.error(e);
    }

    return itemResults;
  };

  const loadPage = useLoadObjectsPage({
    pageSize: props.pageSize,
    pagesPerGroup: props.pagesPerGroup,
    normalizeFilters,
    fetchData: fetchPageWithCounters,
    state: grid.state,
    dispatch: grid.dispatch,
  });

  const defaultFilter = defaultCampaignsState().filter;

  function submitFilter(filter: CampaignsFilterFormType | null) {
    const override = filter ? { filter } : { filter: { ...defaultFilter } };
    loadPage.loadPage(1, override);
  }

  function updateFilter(key: string, value: string) {
    grid.dispatch({ type: "FILTER_UPDATE", values: { [key]: value } });
  }

  function resetFilter() {
    grid.dispatch({ type: "FILTER_RESET" });
  }

  const isResultsAreFiltered = !!(
    grid.state.filterPrevious &&
    !equals(grid.state.filterPrevious, defaultFilter)
  );

  //@eslint-disable react-hooks/exhaustive-deps
  useEffect(() => {
    loadPage.loadPage(1, { filter: grid.state.filter });
  }, []);

  return (
    <>
      <TableView
        filter={
          <Filter
            filter={grid.state.filter}
            onSubmit={submitFilter}
            loading={loadPage.loading}
            updateFilter={updateFilter}
            resetFilter={resetFilter}
            isResultsAreFiltered={isResultsAreFiltered}
            inputs={[
              {
                name: "stage",
                options: dependencies.stages,
                placeholder: t("salesforce.table.filter.proposalStage.label"),
                type: "dropdown",
              },
            ]}
          />
        }
        loading={loadPage.loading}
        title={t("salesforce.campaigns.pageTitle")}
        table={
          <Table
            noResultsHead={t("salesforce.table.campaigns.noResults.head")}
            noResultsSubHead={t(
              "salesforce.table.opportunities.noResults.subhead"
            )}
            showAvatar={false}
            sortBy={loadPage.changeSort}
            getObjectUrl={grid.getObjectUrl}
            fields={[
              {
                name: "Name",
                head: t("salesforce.table.column.campaignName.head"),
                clickForDetails: true,
              },
              {
                name: "Type",
                head: t("salesforce.table.column.type.head"),
              },
              {
                name: "Status",
                head: t("salesforce.table.column.proposalStage.head"),
              },
              {
                name: "TotalLeads",
                head: t("salesforce.table.column.totalLeads.head"),
                resolveValue: (item) =>
                  countersCache.find(matchesCounter(item))?.count ?? 0,
              },
              {
                name: "StartDate",
                head: t("salesforce.table.column.startDate.head"),
                type: "date",
              },
              {
                name: "EndDate",
                head: t("salesforce.table.column.endDate.head"),
                type: "date",
              },
              {
                name: "Owner",
                head: t("salesforce.table.column.owner.head"),
                type: "owner",
              },
            ]}
            sortableFields={{ Name: ["Name"] }}
          />
        }
        pagination={
          grid.state.continuousPager.groupResults.length > props.pageSize && (
            <GroupPagination
              pageSize={props.pageSize}
              page={grid.state.continuousPager.page}
              groupResultCount={grid.state.continuousPager.groupResults.length}
              prevToken={grid.state.continuousPager.nearestGroupTokens.prev}
              nextToken={grid.state.continuousPager.nearestGroupTokens.next}
              disabled={loadPage.loading}
              pagesPerGroup={props.pagesPerGroup}
              onPageChange={loadPage.changePage}
              onNextGroup={loadPage.loadNextGroup}
              onPrevGroup={loadPage.loadPrevGroup}
            />
          )
        }
      />
      {grid.state.detailVisible && grid.state.detailData && (
        <CampaignDetail
          data={grid.state.detailData}
          leadsCount={
            countersCache.find(matchesCounter(grid.state.detailData))?.count ??
            0
          }
        />
      )}
    </>
  );
}
