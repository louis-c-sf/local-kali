import { useTranslation } from "react-i18next";
import React, { useCallback } from "react";
import {
  isContactOwnerFilter,
  updateContactOwnerFilter,
} from "../../../ContactMain";
import { QuickSearch } from "../../../../component/Contact/QuickSearch";
import { ContactOwnerFilter } from "../../../../component/Contact/Filter/ContactOwnerFilter";
import { TagsFilter } from "../../../../component/Contact/Filter/TagsFilter";
import { Button, Label } from "semantic-ui-react";
import { HashTagCountedType } from "../../../../types/ConversationType";
import { ConditionNameType } from "../../../../config/ProfileFieldMapping";
import {
  ContactsStateType,
  ContactActionType,
} from "../../hooks/ContactsStateType";
import { sum } from "ramda";
import { ContactsRequestExtensionType } from "../../../../api/Contacts/types";

export function GridControls(props: {
  contactsListState: ContactsStateType;
  contactsListDispatch: (action: ContactActionType) => void;
  onQuickSearch: (search: string) => void;
  applyFilter: (filters: ContactsRequestExtensionType) => void;
  onResetFilters: () => void;
}) {
  const { contactsListDispatch: dispatch, contactsListState: state } = props;
  const { t } = useTranslation();

  const handleQuickSearchChange = useCallback(
    (text: string) => {
      dispatch({ type: "QUICK_FILTER.UPDATE", value: text });
    },
    [dispatch]
  );

  const allFiltersCount = sum([
    state.scopeState.default.filters.length,
    state.scopeState.default.tagFilters.length,
    state.scopeState.default.listIdFilters.length,
  ]);
  const anyFiltersApplied = allFiltersCount > 0;
  const sidebarFiltersCount = allFiltersCount;
  const anySidebarFilterApplied = sidebarFiltersCount > 0;

  const handleTagFiltersChanged = (filters: HashTagCountedType[]) => {
    dispatch({
      type: "UPDATE_QUERY",
      tags: filters,
      tagOperator: state.scopeState.default.tagOperator,
    });
  };

  const toggleDrawer = () => {
    dispatch({
      type: "FILTERS.TOGGLE_DRAWER",
      visible: !state.filterDrawerVisible,
    });
  };

  const setTagAndOperatorFilter = (
    tags: HashTagCountedType[],
    operator: ConditionNameType
  ) => {
    props.applyFilter({
      tags: tags,
      tagOperator: operator,
    });
  };

  return (
    <div className="grid-controls">
      <div className="control-group flexible">
        <QuickSearch
          onChange={handleQuickSearchChange}
          onSearchExecute={props.onQuickSearch}
        />
      </div>
      <div className="control-group collapsible">
        <ContactOwnerFilter
          values={state.scopeState.default.filters
            .filter(isContactOwnerFilter)
            .reduce<string[]>((acc, next) => [...acc, ...next.filterValue], [])}
          onChange={(values) => {
            props.applyFilter({
              filters: updateContactOwnerFilter(
                state.scopeState.default.filters,
                values
              ),
            });
          }}
        />
      </div>
      <div className="control-group collapsible">
        <TagsFilter
          isSupportMultipleCondition={true}
          tagFilters={state.scopeState.default.tagFilters}
          setTagAndOperatorFilter={setTagAndOperatorFilter}
          onTagFiltersChanged={handleTagFiltersChanged}
        />
      </div>
      <div className="control-group button">
        <Button
          className={`pinnable ${anySidebarFilterApplied ? "pinned" : ""}`}
          active={state.filterDrawerVisible}
          onClick={toggleDrawer}
        >
          <i className={"ui icon filters-toggle"} />
          {t("profile.contacts.actions.moreFilters")}
          {anySidebarFilterApplied && <Label>{sidebarFiltersCount}</Label>}
        </Button>
      </div>
      {anyFiltersApplied && (
        <div className="control-group button">
          <Button className={`pinnable`} onClick={props.onResetFilters}>
            {t("profile.contacts.actions.clearFilters")}
          </Button>
        </div>
      )}
    </div>
  );
}
