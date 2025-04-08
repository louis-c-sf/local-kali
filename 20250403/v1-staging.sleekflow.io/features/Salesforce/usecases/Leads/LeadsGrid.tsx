import React, { useEffect, useState } from "react";
import { TableView } from "../../layouts/TableView";
import { Table } from "../../components/Table/Table";
import { Filter } from "../../components/Filter/Filter";
import {
  CampaignField,
  fetchLeads,
  LeadNormalizedType,
} from "../../API/Leads/fetchLeads";
import {
  defaultLeadsState,
  LeadFilterFormType,
  useLeadsContext,
} from "./LeadsContext";
import { equals } from "ramda";
import { GroupPagination } from "../../components/GroupPagination/GroupPagination";
import { useObjectsGridContext } from "../../components/ObjectsGrid/ObjectsGridContext";
import { useTranslation } from "react-i18next";
import { useLoadObjectsPage } from "../../components/ObjectsGrid/useLoadObjectsPage";
import { createFilterNormalizer } from "../../API/Objects/filters/normalizeFilter";
import { SearchFilter } from "../../API/Objects/filters/normalizeSearchFilter";
import { LeadDetail } from "./LeadDetail";
import { FilterGroupType } from "../../API/Objects/contracts";
import { Dropdown, DropdownOnSearchChangeData } from "semantic-ui-react";
import { useCampaignChoices } from "../../API/Campaigns/useCampaignChoices";
import { OptionType } from "../../components/Filter/contracts";
import { debounce } from "lodash";

export function LeadsGrid(props: { pageSize: number; pagesPerGroup: number }) {
  let { pageSize, pagesPerGroup } = props;
  const context = useLeadsContext();
  const { state, dispatch, getObjectUrl, getObjectCount, fieldReader } =
    useObjectsGridContext<LeadNormalizedType, LeadFilterFormType>();
  const { t } = useTranslation();
  const campaignApi = useCampaignChoices();

  const [campaignOptionsCache, setCampaignOptionsCache] = useState<
    OptionType[]
  >(context.campaignChoices);
  const [campaignsLoading, setCampaignsLoading] = useState(false);

  const normalizeFiltersDefault = createFilterNormalizer<LeadFilterFormType>([
    { filter: "status", apiName: "Status" },
    { filter: "source", apiName: "LeadSource" },
    { filter: "search", apiName: SearchFilter },
  ]);

  const normalizeFilters: (filter: LeadFilterFormType) => FilterGroupType[] = (
    filter
  ) => {
    const baseFilter = normalizeFiltersDefault(filter);
    if (filter.campaign) {
      baseFilter.push({
        filters: [
          {
            field_name: CampaignField,
            value: filter.campaign,
            operator: "=",
          },
        ],
      });
    }
    return baseFilter;
  };

  const loadPage = useLoadObjectsPage({
    pageSize,
    pagesPerGroup,
    normalizeFilters: normalizeFilters,
    fetchData: fetchLeads,
    dispatch,
    state,
  });

  useEffect(() => {
    loadPage.loadPage(1, { filter: state.filter });
  }, []);

  const defaultFilter = defaultLeadsState().filter;

  function submitFilter(filter: LeadFilterFormType | null) {
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
    state.filterPrevious && !equals(state.filter, defaultFilter)
  );

  async function performSearch(searchQuery: string) {
    setCampaignsLoading(true);
    const results = await campaignApi.search(searchQuery);
    setCampaignsLoading(false);

    setCampaignOptionsCache((options) => {
      return (results ?? []).reduce<OptionType[]>((acc, next) => {
        if (!acc.some((option) => option.value === next.value)) {
          return [...acc, next];
        }
        return acc;
      }, options);
    });
    return campaignOptionsCache;
  }

  const suggestCampaignOptions = debounce(
    async (event: any, data: DropdownOnSearchChangeData) => {
      const searchQuery = data.searchQuery as string;
      return await performSearch(searchQuery);
    },
    800,
    { leading: true }
  );

  return (
    <>
      <TableView
        title={t("salesforce.leads.pageTitle")}
        loading={loadPage.loading}
        filter={
          <Filter
            onSubmit={submitFilter}
            filter={state.filter}
            updateFilter={updateFilter}
            resetFilter={resetFilter}
            inputs={[
              {
                name: "status",
                type: "dropdown",
                placeholder: t("salesforce.table.filter.status.label"),
                options: context.statuses,
              },
              {
                name: "source",
                type: "dropdown",
                placeholder: t("salesforce.table.filter.source.label"),
                options: context.sources,
              },
              {
                name: "campaign",
                type: "dropdown",
                placeholder: t("salesforce.table.filter.campaign.label"),
                options: context.campaignChoices,
                render: (value, key, disabled, onChange) => {
                  return (
                    <Dropdown
                      key={key}
                      fluid
                      selection
                      search
                      loading={campaignsLoading}
                      selectOnBlur={false}
                      disabled={disabled}
                      onChange={onChange}
                      options={campaignOptionsCache.map((opt) => ({
                        text: opt.title,
                        value: opt.value,
                      }))}
                      onSearchChange={suggestCampaignOptions}
                      value={value}
                      placeholder={t("salesforce.table.filter.campaign.label")}
                    />
                  );
                },
              },
            ]}
            loading={loadPage.loading}
            isResultsAreFiltered={isResultsAreFiltered}
          />
        }
        table={
          <Table
            noResultsHead={t("salesforce.table.leads.noResults.head")}
            noResultsSubHead={t("salesforce.table.leads.noResults.subhead")}
            sortBy={loadPage.changeSort}
            getObjectUrl={getObjectUrl}
            showAvatar={true}
            fields={[
              {
                name: "Name",
                head: t("salesforce.table.column.name.head"),
                type: "name",
                clickForDetails: true,
              },
              {
                name: "Phone",
                head: t("salesforce.table.column.phone.head"),
                type: "phone",
              },
              {
                name: "Email",
                head: t("salesforce.table.column.email.head"),
              },
              {
                name: "Status",
                head: t("salesforce.table.column.status.head"),
              },
              {
                name: "LeadSource",
                head: t("salesforce.table.column.source.head"),
              },
              {
                name: "Owner",
                head: t("salesforce.table.column.owner.head"),
                type: "owner",
              },
              // {
              //   name: "campaign",
              //   head: t("salesforce.table.column.campaign.head"),
              //   resolveValue: (item) => (
              //     <CampaignLinkList
              //       reader={fieldReader}
              //       data={item}
              //       campaignChoices={context.campaignChoices}
              //       compact={true}
              //     />
              //   ),
              // },
            ]}
            sortableFields={{ Name: ["FirstName", "LastName"] }}
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
        <LeadDetail data={state.detailData} />
      )}
    </>
  );
}
