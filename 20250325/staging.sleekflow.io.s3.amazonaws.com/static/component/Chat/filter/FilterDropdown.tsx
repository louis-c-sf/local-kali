import React, { useCallback, useEffect, useState } from "react";
import { Ref } from "semantic-ui-react";
import { useAppDispatch, useAppSelector } from "../../../AppRootContext";
import { ChannelType } from "../Messenger/types";
import { aliasChannelName } from "../../Channel/selectors";
import useCompanyChannels from "../hooks/useCompanyChannels";
import {
  ChannelDropdownOption,
  useTransformChannelsToDropdown,
} from "../localizable/useTransformChannelsToDropdown";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { equals, pick } from "ramda";
import { SearchableDialogMultipleMenu } from "../../shared/popup/SearchableDialog/SearchableDialogMultipleMenu";
import { getQueryMatcher } from "../../../container/Settings/filters/getQueryMatcher";
import ChannelMenu from "./ChannelMenu";
import { LabelMenuMemo } from "./LabelMenu";
import TopMenu from "./TopMenu";
import FilterFunnelIcon from "../../../assets/tsx/icons/FilterFunnelIcon";
import { useCompanyHashTags } from "../../Settings/hooks/useCompanyHashTags";
import { DefaultOrderBy } from "types/state/InboxStateType";
import { useHashtagsFilter } from "component/Chat/hooks/useHashtagsFilter";

enum FILTER_BLOCK_MAPPING {
  channel = "channel",
  label = "label",
}

const matchesChannelOption =
  (name: string, instanceId?: string) => (channel: ChannelDropdownOption) => {
    const nameMatch = aliasChannelName(channel.value as ChannelType) === name;
    return nameMatch && instanceId === channel.instanceId;
  };

function FilterDropdown() {
  const { t } = useTranslation();
  const loginDispatch = useAppDispatch();
  const { selectedStatus, company, selectedChannel, selectedInstanceId } =
    useAppSelector(
      pick([
        "selectedAssignee",
        "selectedStatus",
        "company",
        "selectedChannel",
        "selectedInstanceId",
      ]),
      equals
    );
  const [filter, summary] = useAppSelector(
    (s) => [s.inbox.filter, s.inbox.summary],
    equals
  );
  const defaultInboxOrder = useAppSelector(
    (s) => s.company?.defaultInboxOrder,
    equals
  );
  const { orderBy: selectedOrderBy } = filter;
  const { companyTags } = useCompanyHashTags();
  const tagsFilter = useHashtagsFilter({
    availableItems: companyTags,
    allItems: companyTags,
    limit: 100,
    collatorLang: navigator.language,
  });

  const { transformChannelsToDropdown } = useTransformChannelsToDropdown();
  const channelChoices = transformChannelsToDropdown(
    useCompanyChannels(),
    true
  );
  const history = useHistory();
  const [opened, setOpened] = useState(false);
  const [triggerElement, setTriggerElement] = useState<HTMLElement | null>(
    null
  );
  const [channelItemsFiltered, setChannelItemsFiltered] =
    useState<ChannelDropdownOption[]>();

  const [queryInitialized, setQueryInitialized] = useState(false);
  const [querySelectedInstanceId, setQuerySelectedInstanceId] =
    useState<string>();
  const [querySelectedChannel, setQuerySelectedChannel] = useState<string>();

  useEffect(() => {
    // init from the first URL params set
    const params = new URLSearchParams(window.location.search.substring(1));
    setQuerySelectedChannel(params.get("selectedChannel") ?? undefined);
    setQuerySelectedInstanceId(params.get("selectedInstanceId") ?? undefined);
    setQueryInitialized(true);
  }, []);

  useEffect(() => {
    // init filter after company loaded
    if (!queryInitialized) {
      return;
    }
    if (!querySelectedChannel || channelChoices.length === 0) {
      return;
    }
    const defaultSelectedChannel = channelChoices.find(
      matchesChannelOption(querySelectedChannel, querySelectedInstanceId)
    );

    if (defaultSelectedChannel) {
      loginDispatch({
        type: "INBOX.FILTER.CHANNEL_INIT",
        channel: aliasChannelName(defaultSelectedChannel.value as ChannelType),
        channelInstanceId: defaultSelectedChannel.instanceId,
      });
    }
  }, [
    channelChoices.length === 0,
    queryInitialized,
    querySelectedChannel,
    querySelectedInstanceId,
  ]);

  const serializeFiltersToUrlQuery = useCallback(() => {
    const params = new URLSearchParams(window.location.search.substring(1));
    if (!company) {
      if (params.get("selectedStatus") || params.get("redirect")) {
        return;
      }
    }
    params.set("selectedStatus", selectedStatus);
    params.set("selectedChannel", selectedChannel || "all");
    params.set(
      "selectedOrderBy",
      selectedOrderBy || defaultInboxOrder || DefaultOrderBy
    );
    if (selectedChannel && selectedInstanceId) {
      params.set("selectedInstanceId", selectedInstanceId);
    } else {
      params.delete("selectedInstanceId");
    }
    return params.toString();
  }, [
    Boolean(company),
    selectedChannel,
    selectedInstanceId,
    selectedStatus,
    selectedOrderBy,
    defaultInboxOrder,
  ]);

  useEffect(() => {
    if (!queryInitialized) {
      return;
    }
    // update query string on every filter change
    const searchUpdated = serializeFiltersToUrlQuery();
    if (searchUpdated) {
      try {
        history.replace({
          pathname: window.location.pathname,
          search: searchUpdated,
        });
      } catch (e) {
        console.error(
          `searchUpdated error: ${e}, pathname: ${window.location.pathname}, search: ${searchUpdated}`
        );
        history.push({
          pathname: window.location.pathname,
          search: searchUpdated,
        });
      }
    }
  }, [queryInitialized, serializeFiltersToUrlQuery]);

  const isAnyFilterApplied =
    filter.tagIds.length > 0 ||
    filter.unreadStatus ||
    selectedChannel !== "all";

  function refreshSummary() {
    loginDispatch({ type: "INBOX.API.LOAD_SUMMARY" });
  }

  function resetAllFilters() {
    loginDispatch({ type: "INBOX.RESET_FILTER" });
  }

  const optionChannelMatcher = getQueryMatcher(
    (option: ChannelDropdownOption) => {
      return option.text;
    }
  );

  const handleFilter = (query: string, name: string) => {
    if (name === FILTER_BLOCK_MAPPING.channel) {
      setChannelItemsFiltered(
        channelChoices.filter(optionChannelMatcher(query))
      );
    } else {
      tagsFilter.search(query);
    }
  };

  function onClose() {
    setChannelItemsFiltered(undefined);
    tagsFilter.resetSearch();
    setOpened(false);
  }

  return (
    <>
      <Ref innerRef={setTriggerElement}>
        <div className={"chat-filter-dropdown"}>
          <div
            onClick={(event) => {
              event.stopPropagation();
              if (!opened) {
                refreshSummary();
              }
              setOpened((o) => !o);
            }}
            className={`chat-filter-trigger ${
              isAnyFilterApplied ? "applied" : ""
            }`}
          >
            <FilterFunnelIcon active={Boolean(isAnyFilterApplied)} />
          </div>
        </div>
      </Ref>

      <SearchableDialogMultipleMenu
        open={opened}
        className={"chat-filter-popup"}
        small={false}
        onSearch={(query, name) => {
          handleFilter(query, name);
        }}
        onSearchClear={(name) => {
          name === FILTER_BLOCK_MAPPING.channel
            ? setChannelItemsFiltered(undefined)
            : tagsFilter.resetSearch();
        }}
        close={onClose}
        triggerRef={triggerElement}
        mountElement={triggerElement?.parentElement ?? undefined}
        popperPlacement={"bottom-start"}
        offset={[0, 14]}
        showSearchIcon={false}
        isAnyFilterApplied={isAnyFilterApplied}
        resetAllFilters={resetAllFilters}
        topChildren={
          <TopMenu
            filter={filter}
            summary={summary}
            loginDispatch={loginDispatch}
          />
        }
        bottomChildren={[
          {
            name: FILTER_BLOCK_MAPPING.channel,
            header: t("chat.filter.section.channels"),
            element: (
              <ChannelMenu
                itemsFiltered={channelItemsFiltered}
                matchesChannelOption={matchesChannelOption}
              />
            ),
            placeholder: t("chat.filter.channel.placeholder"),
          },
          {
            name: FILTER_BLOCK_MAPPING.label,
            header: t("chat.filter.section.labels"),
            element: (
              <LabelMenuMemo
                itemsFiltered={
                  tagsFilter.searchActive ? tagsFilter.itemsFiltered : undefined
                }
                filter={filter}
                summary={summary.filters.hashtagSummaries}
                loginDispatch={loginDispatch}
              />
            ),
            placeholder: t("chat.filter.labels.placeholder"),
          },
        ]}
      />
    </>
  );
}

export const FilterDropdownMemo = React.memo(FilterDropdown);
