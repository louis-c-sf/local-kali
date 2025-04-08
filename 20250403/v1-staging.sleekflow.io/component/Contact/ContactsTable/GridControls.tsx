import {
  ContactActionType,
  ContactsStateType,
} from "../../../container/Contact/hooks/ContactsStateType";
import { AudienceType } from "../../../types/BroadcastCampaignType";
import { HashTagCountedType } from "../../../types/ConversationType";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useHideOnResizeBehavior } from "../../../lib/effects/useHideOnResizeBehavior";
import { QuickSearch } from "../QuickSearch";
import { ContactOwnerFilter } from "../Filter/ContactOwnerFilter";
import ListsFilter from "../Filter/ListsFilter";
import { TagsFilter } from "../Filter/TagsFilter";
import { Button, Label } from "semantic-ui-react";
import {
  isContactOwnerFilter,
  updateContactOwnerFilter,
} from "../../../container/ContactMain";
import { ConditionNameType } from "../../../config/ProfileFieldMapping";
import { useGridHeaderContext } from "component/shared/grid/GridHeaderContext";

export function GridControls(props: {
  onQuickSearchChange: (text: string) => void;
  onQuickSearch: (text: string) => void;
  state: ContactsStateType;
  dispatch: (action: ContactActionType) => void;
  setFilters: (filters: AudienceType[]) => void;
  setTagFilters: (tags: HashTagCountedType[]) => void;
  setListFilters: (listIds: string[]) => void;
  anyFilterApplied: boolean;
  resetFilters: () => void;
  setTagAndOperatorFilter: (
    tags: HashTagCountedType[],
    operator: ConditionNameType
  ) => void;
}) {
  const {
    onQuickSearch,
    onQuickSearchChange,
    state,
    dispatch,
    anyFilterApplied,
  } = props;
  const stateScoped = state.scopeState.default;
  let sidebarFiltersCount = [
    stateScoped.filters,
    stateScoped.tagFilters,
    stateScoped.listIdFilters,
    stateScoped.collaboratorFilters,
  ].filter((f) => f.length > 0).length;
  const anySidebarFilterApplied = sidebarFiltersCount > 0;
  const [controlsWrapNode, setControlsWrapNode] = useState<HTMLElement | null>(
    null
  );
  const { t } = useTranslation();
  const { mainRowNode } = useGridHeaderContext();

  useHideOnResizeBehavior({
    withCounter: false,
    wrapElement: controlsWrapNode,
    fitToElement: mainRowNode,
    selectCollapsibleSiblings: (wrap) =>
      Array.from(
        wrap.querySelectorAll<HTMLElement>(".control-group.collapsible")
      ).sort((a, b) => {
        const [priorityA, priorityB] = [
          parseInt(a.dataset?.priority!) || 0,
          parseInt(b.dataset?.priority!) || 0,
        ];
        return priorityB - priorityA;
      }),
  });

  const contactFilterValue = stateScoped.filters
    .filter(isContactOwnerFilter)
    .reduce<string[]>((acc, next) => [...acc, ...next.filterValue], []);

  return (
    <div className="grid-controls" ref={setControlsWrapNode}>
      <div className="control-group flexible">
        <QuickSearch
          onChange={onQuickSearchChange}
          onSearchExecute={onQuickSearch}
        />
      </div>
      <div
        className="control-group collapsible"
        data-priority={contactFilterValue.length > 0 ? "1" : ""}
      >
        <ContactOwnerFilter
          values={contactFilterValue}
          onChange={(values) => {
            props.setFilters(
              updateContactOwnerFilter(stateScoped.filters, values)
            );
          }}
        />
      </div>
      <div
        className="control-group collapsible"
        data-priority={stateScoped.tagFilters.length > 0 ? "1" : "0"}
      >
        <TagsFilter
          isSupportMultipleCondition={true}
          tagFilters={stateScoped.tagFilters}
          onTagFiltersChanged={props.setTagFilters}
          setTagAndOperatorFilter={props.setTagAndOperatorFilter}
        />
      </div>
      <div
        className="control-group collapsible"
        data-priority={stateScoped.listIdFilters.length > 0 ? "1" : "0"}
      >
        <ListsFilter
          isSupportMultipleCondition={true}
          initListIds={stateScoped.listIdFilters}
          onListFilterChange={props.setListFilters}
        />
      </div>
      <div className="control-group button">
        <Button
          className={`pinnable ${anySidebarFilterApplied ? "pinned" : ""}`}
          active={state.filterDrawerVisible}
          onClick={() => {
            dispatch({
              type: "FILTERS.TOGGLE_DRAWER",
              visible: !state.filterDrawerVisible,
            });
          }}
        >
          <i className={"ui icon filters-toggle"} />
          {t("profile.contacts.actions.moreFilters")}
          {anySidebarFilterApplied && <Label>{sidebarFiltersCount}</Label>}
        </Button>
      </div>
      {anyFilterApplied && (
        <div className="control-group button">
          <Button className={`pinnable`} onClick={props.resetFilters}>
            {t("profile.contacts.actions.clearFilters")}
          </Button>
        </div>
      )}
    </div>
  );
}
