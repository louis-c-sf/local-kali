import React, { Reducer, useCallback, useEffect, useReducer } from "react";
import { Dimmer, Loader } from "semantic-ui-react";
import { PostLogin } from "../component/Header";

import { deleteMethod } from "../api/apiRequest";
import { DELETE_USERPROFILE } from "../api/apiPath";
import NewContact from "../component/Contact/NewContact/NewContact";
import ContactMain, { isListFilter } from "./ContactMain";
import { AudienceType } from "../types/BroadcastCampaignType";
import { useHistory, useLocation } from "react-router";
import Helmet from "react-helmet";
import ProfileSearchType from "../types/ProfileSearchType";
import { SelectAllContext } from "../xstate/selectAllIItemsMachine";
import { useFlashMessageChannel } from "../component/BannerMessage/flashBannerMessage";
import ContactSidebarBeta from "../component/Contact/ContactSidebarBeta";
import { contactReducer } from "./Contact/hooks/contactReducer";
import {
  ContactActionType,
  ContactsStateType,
  getDefaultStateValue,
  ContactsContext,
  DefaultOperatorValue,
  ListType,
} from "./Contact/hooks/ContactsStateType";
import { HashTagCountedType } from "../types/ConversationType";
import Cookies from "js-cookie";
import { isFreemiumPlan } from "../types/PlanSelectionType";
import {
  isNotCollaboratorColumn,
  isNotLabelsColumn,
  isNotListsColumn,
} from "./Contact/hooks/useCustomProfileFields";
import { useTeams } from "./Settings/useTeams";
import { useTranslation } from "react-i18next";
import { useFetchContactsPage } from "../api/Contacts/useFetchContactsPage";
import { equals, innerJoin, pick, uniq } from "ramda";
import produce from "immer";
import useImportedLists from "./Contact/Imported/useImportedLists";
import useFetchCompany from "../api/Company/useFetchCompany";
import { useSelectAllBehavior } from "../xstate/hooks/useSelectAllBehavior";
import { useAppDispatch, useAppSelector } from "../AppRootContext";
import moment from "moment";
import { useContactsSearchFilter } from "../api/Contacts/useContactsSearchFilter";
import { ConditionNameType } from "../config/ProfileFieldMapping";
import { useNormalizeFetchContactsFilters } from "../component/Contact/shared/FilterGroup/useNormalizeFetchContactsFilters";
import { useFetchContactsContextPage } from "../component/Contact/shared/FilterGroup/useFetchContactsContextPage";

export type NormalizedSearchResponseType = {
  items: ProfileSearchType[];
  totalFiltered: number;
  totalUnfiltered: number;
  pageIds: string[];
  targetIdsCount: number;
  selectedIds?: string[];
};

type SortedByDirectionType = "ASC" | "DESC" | undefined;
export type SortParamType = { field: string; direction: SortedByDirectionType };

export const sortFieldNameMap = {
  displayName: "displayname",
  updatedAt: "updatedat",
  createdAt: "createdat",
  LastContact: "lastContact",
  LastContactFromCustomers: "lastContactFromCustomers",
} as const;

export const sortFieldDirectionMap = {
  ASC: "asc",
  DESC: "desc",
} as const;

export const FILTERS_STORAGE_KEY = "contacts.filterList";

/** @deprecated remove all these constants 👇🏻 as time passes and the browsers would clean up */
export const FILTERS_LISTS_STORAGE_KEY = "contacts.filterListIds";
export const FILTERS_LISTS_OPERATOR_STORAGE_KEY =
  "contacts.filterListIdsOperator";
export const FILTERS_TAGS_STORAGE_KEY = "contacts.filterTags";
export const FILTERS_TAGS_OPERATOR_STORAGE_KEY = "contacts.filterTagsOperator";
export const FILTERS_COLLABORATOR_STORAGE_KEY = "contacts.filterCollaborators";
const FILTERS_COLLABORATOR_OPERATOR_STORAGE_KEY =
  "contacts.filterCollaboratorsOperator";
export const FILTERS_LAST_CONTACT_FILTER_DATETIME =
  "contact.lastFilterDateTime";
const CLEAR_CACHE_TIMERANGE = 30;

export function notQuickCondition(cond: AudienceType) {
  const SKIP_FIELDS = [
    "lastname",
    "firstname",
    "email",
    "phone",
    "displayname",
  ];
  return !SKIP_FIELDS.includes(cond.fieldName.toLowerCase());
}

export default function Contact() {
  const { refreshTeams } = useTeams();
  const LIMIT = 30;
  const { t } = useTranslation();
  const history = useHistory();
  const location = useLocation();

  const [state, dispatch] = useReducer<
    Reducer<ContactsStateType, ContactActionType>
  >(contactReducer, {
    ...getDefaultStateValue(),
  });
  const loginDispatch = useAppDispatch();
  const { staffList, profile, currentPlan } = useAppSelector(
    pick(["staffList", "profile", "currentPlan"]),
    equals
  );

  const { state: selectAllMachineState, send: selectAllSend } =
    useSelectAllBehavior({
      selectAllCallback: async () => {
        const { totalResult, userProfileIds } = await selectAll(
          getAllAppliedFilters()
        );
        return {
          total: totalResult,
          targetIds: userProfileIds,
        };
      },
    });

  const flash = useFlashMessageChannel();
  const { company, refreshCompany } = useFetchCompany();

  const scopeState = state.scopeState.default;
  const { buildFilters } = useContactsSearchFilter(
    scopeState.filters,
    scopeState.tagFilters,
    scopeState.quickFilter.query,
    scopeState.listIdFilters,
    scopeState.collaboratorFilters,
    []
  );

  const { selectAll, fetchContactsPage } = useFetchContactsPage(
    buildFilters,
    scopeState.quickFilter.query
  );

  const { lists, loading: listsLoading, listAdded } = useImportedLists();

  const removeLocalStorage = () => {
    localStorage.removeItem(FILTERS_STORAGE_KEY);

    //deprecated keys:
    localStorage.removeItem(FILTERS_TAGS_STORAGE_KEY);
    localStorage.removeItem(FILTERS_LISTS_STORAGE_KEY);
    localStorage.removeItem(FILTERS_LAST_CONTACT_FILTER_DATETIME);
    localStorage.removeItem(FILTERS_TAGS_OPERATOR_STORAGE_KEY);
    localStorage.removeItem(FILTERS_LISTS_OPERATOR_STORAGE_KEY);
    localStorage.removeItem(FILTERS_COLLABORATOR_STORAGE_KEY);
    localStorage.removeItem(FILTERS_COLLABORATOR_OPERATOR_STORAGE_KEY);
  };

  const isLoadPageBlocked =
    listsLoading || !Boolean(company?.customUserProfileFields);
  const fieldsAvailable = scopeState.fields.filter(
    (f) => isNotLabelsColumn(f) && isNotListsColumn(f)
  );

  const normalizeFetchContactsFilters = useNormalizeFetchContactsFilters({
    fieldsAvailable,
  });

  useEffect(() => {
    if (!state.booted) {
      return;
    }
    localStorage.setItem(
      FILTERS_LAST_CONTACT_FILTER_DATETIME,
      new Date().getTime().toString()
    );
    localStorage.setItem(
      FILTERS_STORAGE_KEY,
      JSON.stringify(state.scopeState.default)
    );
  }, [state.booted, JSON.stringify(state.scopeState)]);

  const getAllAppliedFilters = useCallback(
    (page?: number) => ({
      page: page ?? state.activePage,
      listIds: scopeState.listIdFilters,
      listOperator: scopeState.listOperator,
      tags: scopeState.tagFilters,
      tagOperator: scopeState.tagOperator,
      sort: scopeState.sortParams,
      filters: scopeState.filters,
      collaboratorOperator: scopeState.collaboratorOperator,
    }),
    [
      state.activePage,
      scopeState.listIdFilters,
      scopeState.listOperator,
      scopeState.tagFilters,
      scopeState.tagOperator,
      scopeState.sortParams,
      scopeState.filters,
      scopeState.collaboratorOperator,
    ]
  );

  useEffect(() => {
    const lastFilteredDateTime = localStorage.getItem(
      FILTERS_LAST_CONTACT_FILTER_DATETIME
    );
    if (
      lastFilteredDateTime &&
      moment(Number(lastFilteredDateTime)).isValid()
    ) {
      if (
        moment().isSameOrAfter(
          moment(Number(lastFilteredDateTime)).add(
            CLEAR_CACHE_TIMERANGE,
            "minutes"
          )
        )
      ) {
        removeLocalStorage();
      }
    }
    // update the company once in case we came from a first login after registration
    refreshCompany();
  }, []);

  useEffect(() => {
    if (isLoadPageBlocked || state.booted) {
      return;
    }
    const params = new URLSearchParams(location.search.slice(1));
    const sortedFieldParam = params.get("sortedField");
    const sortedByParam = params.get("sortedBy");
    let filters = scopeState.filters;
    let tags = scopeState.tagFilters;
    let sortParams = scopeState.sortParams;
    let listIds: string[] = [];
    let collaboratorIds: string[] = scopeState.collaboratorFilters;
    let tagOperator: ConditionNameType = scopeState.tagOperator;
    let listOperator: ConditionNameType = scopeState.listOperator;
    let collaboratorOperator: ConditionNameType =
      scopeState.collaboratorOperator;
    let filtersStored: ContactsStateType["scopeState"]["default"];

    if (localStorage.getItem(FILTERS_STORAGE_KEY)) {
      try {
        filtersStored = JSON.parse(
          localStorage.getItem(FILTERS_STORAGE_KEY) ?? "{}"
        );
        let scopeStateStored = filtersStored;
        if (
          scopeStateStored?.filters &&
          scopeStateStored?.tagFilters &&
          scopeStateStored?.listIdFilters &&
          scopeStateStored?.collaboratorFilters &&
          scopeStateStored?.tagOperator &&
          scopeStateStored?.listOperator &&
          scopeStateStored?.collaboratorOperator
        ) {
          filters = scopeStateStored.filters;
          tags = scopeStateStored.tagFilters;
          tagOperator = scopeStateStored.tagOperator;
          listIds = scopeStateStored.listIdFilters;
          listOperator = scopeStateStored.listOperator;
          collaboratorIds = scopeStateStored.collaboratorFilters;
          collaboratorOperator = scopeStateStored.collaboratorOperator;
        }
        if (scopeStateStored) {
          //the filter is in legacy format, remove it once
          removeLocalStorage();
        }
      } catch (e) {
        console.error("Init from localStorage", e);
        removeLocalStorage();
      }
    }
    dispatch({
      type: "UPDATE_QUERY",
      filters,
      tags,
      page: 1,
      listIds,
      tagOperator,
      listOperator,
      collaboratorIds,
      collaboratorOperator,
    });

    if (sortedFieldParam && sortedByParam) {
      sortParams = [
        {
          field: sortedFieldParam,
          direction: sortedByParam as SortedByDirectionType,
        },
      ];
    }
    loadPage({
      filters,
      tags,
      sort: sortParams,
      page: 1,
      includeCounts: true,
    })
      .then(() => {
        dispatch({ type: "BOOTED" });
      })
      .catch(console.error);

    refreshTeams();
  }, [isLoadPageBlocked, state.booted]);

  useEffect(() => {
    if (
      isFreemiumPlan(currentPlan) &&
      Cookies.get("isDisplayedContactGuide") === undefined
    ) {
      loginDispatch({
        type: "SHOW_CONTACT_GUIDE",
      });
    }
  }, [Cookies.get("isDisplayedContactGuide") === undefined, currentPlan.id]);

  useEffect(() => {
    if (listsLoading || lists.length === 0) {
      return;
    }
    const initListIds = scopeState.filters
      .filter(isListFilter)
      ?.map((f) => f.filterValue[0]);
    const actualListsInitIds = innerJoin(
      (id, list) => id === String(list.id),
      initListIds,
      lists
    );
    if (actualListsInitIds.length === 0) {
      return;
    }
    setFilterValuesList(
      produce(scopeState.filters, (draftState) => {
        draftState.filter(isListFilter).forEach((f) => {
          f.filterValue = actualListsInitIds;
        });
      })
    );
  }, [listsLoading]);

  useEffect(() => {
    if (isLoadPageBlocked || !state.booted) {
      return;
    }
    loadPage({ page: 1, includeCounts: true });
  }, [isLoadPageBlocked, state.booted]);

  const loadPage = useFetchContactsContextPage({
    pageSize: LIMIT,
    dispatch,
    state,
    fetchContactsPage,
    selectAllMachineState,
    selectAllSend,
  });

  const handleContactCreate = useCallback(
    async (isVisible: boolean | undefined) => {
      setTimeout(() => {
        if (!isVisible) {
          dispatch({ type: "HIDE_NEW_CONTACT_FORM" });
        }
      }, 1500);
      await loadPage({ includeCounts: true });
    },
    [loadPage, dispatch]
  );

  const selectAllIds = useCallback(async () => {
    if (selectAllMachineState.matches("selectedAll")) {
      const result = await selectAll(getAllAppliedFilters());
      return result.userProfileIds;
    } else {
      return (selectAllMachineState!.context! as SelectAllContext).targetIds;
    }
  }, [
    selectAll,
    selectAllMachineState.matches("selectedAll"),
    selectAllMachineState.context.targetIds.join(),
  ]);

  const refreshPage = useCallback(async () => {
    await loadPage({
      filters: scopeState.filters,
      page: 1,
      includeCounts: true,
    });
    const selectedIds = await selectAllIds();
    flash(t("flash.profile.bulkEdit.saved", { count: selectedIds.length }));
  }, [JSON.stringify(scopeState.filters), selectAllIds]);

  const handlePageChange = useCallback(
    async (page: number) => {
      // todo check out dispatch({type: "UPDATE_QUERY", page: page})
      await loadPage(getAllAppliedFilters(page));
    },
    [loadPage]
  );

  const deleteProfile = useCallback(async () => {
    dispatch({ type: "CONTACT_DELETE_START" });
    try {
      const selectedProfiles = await selectAllIds();
      await deleteMethod(DELETE_USERPROFILE, {
        param: { UserProfileIds: selectedProfiles },
      });
      await loadPage({ includeCounts: true });
      flash(
        t("flash.settings.contact.deleted", { count: selectedProfiles.length })
      );
    } catch (e) {
      console.error("deleteProfile", e);
    } finally {
      dispatch({ type: "CONTACT_DELETE_END" });
    }
  }, [dispatch, selectAllIds]);

  const handleSort = useCallback(
    async (param: SortParamType) => {
      const sortParamsMerged = [param];
      const query = new URLSearchParams(location.search.slice(1));
      if (
        query.has("sortedField") ||
        query.has("sortedBy") ||
        !(query.has("sortedField") && query.has("sortedBy"))
      ) {
        query.set("sortedField", param.field);
        query.set("sortedBy", param.direction || "ASC");
      }
      history.replace({
        pathname: location.pathname,
        search: query.toString(),
      });
      dispatch({
        type: "UPDATE_QUERY",
        sort: sortParamsMerged,
      });

      await loadPage({ sort: [param] });
    },
    [loadPage, location.search, location.pathname]
  );

  const setFilterValuesList = useCallback(
    (filters: AudienceType[]) => {
      const newFilters = filters ?? [];
      dispatch({
        type: "UPDATE_QUERY",
        filters: newFilters,
        page: 1,
      });

      loadPage({
        filters: newFilters,
        page: 1,
        includeCounts: true,
      });
    },
    [loadPage]
  );

  const executeQuickSearch = useCallback(
    async (search: string) => {
      return await loadPage({
        quickSearch: search,
        page: 1,
        includeCounts: true,
      });
    },
    [loadPage]
  );

  const handleQuickSearchChange = useCallback(
    (text: string) => {
      dispatch({ type: "QUICK_FILTER.UPDATE", value: text });
    },
    [dispatch]
  );

  const setTagFilters = useCallback(
    (tags: HashTagCountedType[]) => {
      dispatch({
        type: "UPDATE_QUERY",
        tags,
      });
      loadPage({ tags, page: 1, includeCounts: true });
    },
    [loadPage]
  );

  const setListFilters = useCallback(
    (ids: string[]) => {
      dispatch({
        type: "UPDATE_QUERY",
        listIds: ids,
      });
      loadPage({ listIds: ids, page: 1, includeCounts: true });
    },
    [loadPage]
  );

  const setTagAndOperatorFilter = useCallback(
    (tags: HashTagCountedType[], operator: ConditionNameType) => {
      dispatch({
        type: "UPDATE_QUERY",
        tags,
        tagOperator: operator,
      });
      loadPage({
        tags,
        tagOperator: operator,
        page: 1,
        includeCounts: true,
      });
    },
    [loadPage]
  );

  const setListIdAndOperatorFilter = useCallback(
    (ids: string[], operator: ConditionNameType) => {
      dispatch({
        type: "UPDATE_QUERY",
        listIds: ids,
        listOperator: operator,
      });

      loadPage({
        listIds: ids,
        listOperator: operator,
        page: 1,
        includeCounts: true,
      });
    },
    [loadPage]
  );

  const setCollaboratorAndOperatorFilter = useCallback(
    (ids: string[], operator: ConditionNameType) => {
      dispatch({
        type: "UPDATE_QUERY",
        collaboratorIds: ids,
        collaboratorOperator: operator,
      });
      loadPage({
        collaboratorIds: ids,
        collaboratorOperator: operator,
        page: 1,
      });
    },
    [loadPage]
  );

  const pageTitle = t("nav.menu.contacts");

  const resetFilters = useCallback(() => {
    dispatch({ type: "RESET_QUERY" });
    removeLocalStorage();
    loadPage({
      listIds: [],
      listOperator: DefaultOperatorValue,
      tags: [],
      tagOperator: DefaultOperatorValue,
      sort: scopeState.sortParams,
      collaboratorIds: [],
      collaboratorOperator: DefaultOperatorValue,
      page: 1,
      filters: [],
      includeCounts: true,
    });
  }, [JSON.stringify(scopeState.sortParams), loadPage]);

  const handleNewContact = useCallback(() => {
    dispatch({ type: "SHOW_NEW_CONTACT_FORM" });
  }, [dispatch]);

  const setVisible = useCallback(
    (visible: boolean) => {
      dispatch({
        type: visible ? "SHOW_NEW_CONTACT_FORM" : "HIDE_NEW_CONTACT_FORM",
      });
    },
    [dispatch]
  );

  const setProfileResult = useCallback(
    (profiles: ProfileSearchType[]) => {
      dispatch({ type: "UPDATE_PROFILES", profiles });
    },
    [dispatch]
  );

  const applyFilter = (selectedFilters: ListType) => {
    const param = normalizeFetchContactsFilters(selectedFilters);

    loadPage({ ...param, includeCounts: true });
    dispatch({ type: "UPDATE_QUERY", ...param });
    dispatch({ type: "FILTERS.TOGGLE_DRAWER", visible: false });
  };

  const hideFormCallback = useCallback(() => setVisible(false), [setVisible]);

  return (
    <div className={`post-login`}>
      <Helmet title={t("nav.common.title", { page: pageTitle })} />
      <PostLogin selectedItem={"Contacts"}>
        <ContactsContext.Provider
          value={{
            ...state,
            scopeState: {
              ...state.scopeState,
              default: {
                ...scopeState,
                setTagAndOperatorFilter,
                setListIdAndOperatorFilter,
                setCollaboratorAndOperatorFilter,
              },
            },
          }}
        >
          <div className={`contacts main`}>
            <ContactSidebarBeta
              visible={state.filterDrawerVisible}
              fields={fieldsAvailable}
              initFieldFilters={scopeState.filters}
              initTagFilters={scopeState.tagFilters}
              initTagOperator={scopeState.tagOperator}
              initListIdFilters={scopeState.listIdFilters}
              initListIdOperator={scopeState.listOperator}
              initCollaboratorFilters={scopeState.collaboratorFilters}
              initCollaboratorOperator={scopeState.collaboratorOperator}
              numOfContacts={scopeState.numOfContacts}
              numOfContactsTotal={scopeState.numOfContactsUnfiltered}
              onHide={() => {
                dispatch({ type: "FILTERS.TOGGLE_DRAWER", visible: false });
              }}
              onApply={applyFilter}
            />
            <Dimmer.Dimmable
              dimmed
              className={`contact-list-wrap main-primary-column ${
                state.loading ? "blocked" : ""
              }`}
            >
              <ContactMain
                dispatch={dispatch}
                state={state}
                handleNewContact={handleNewContact}
                onQuickSearchChange={handleQuickSearchChange}
                onQuickSearch={executeQuickSearch}
                handleSort={handleSort}
                deleteProfile={deleteProfile}
                handlePageChange={handlePageChange}
                selectAllMachineState={selectAllMachineState}
                setProfileResult={setProfileResult}
                selectAllSend={selectAllSend}
                selectAllIds={selectAllIds}
                setFilters={setFilterValuesList}
                setListFilters={setListFilters}
                setTagFilters={setTagFilters}
                lists={lists}
                listsLoading={listsLoading}
                onListAdded={listAdded}
                resetFilters={resetFilters}
                refreshPage={refreshPage}
              />
              {(state.loading || state.deleteLoading) && (
                <Dimmer active inverted>
                  <Loader inverted></Loader>
                </Dimmer>
              )}
              {
                <NewContact
                  contactCreate={handleContactCreate}
                  visible={state.newContactFormVisible}
                  hideForm={hideFormCallback}
                  staffList={staffList}
                  profile={profile}
                />
              }
            </Dimmer.Dimmable>
          </div>
        </ContactsContext.Provider>
      </PostLogin>
    </div>
  );
}
