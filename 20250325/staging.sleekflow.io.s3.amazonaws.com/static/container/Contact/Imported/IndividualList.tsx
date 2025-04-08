import Helmet from "react-helmet";
import React, {
  FormEvent,
  useCallback,
  useEffect,
  useReducer,
  Reducer,
} from "react";
import { PostLogin } from "../../../component/Header";
import {
  Button,
  Dimmer,
  Input,
  Loader,
  Modal,
  Pagination,
} from "semantic-ui-react";
import GridHeader from "../../../component/shared/grid/GridHeader";
import {
  defaultListState,
  IndividualListAction,
  individualListReducer,
  IndividualListState,
} from "./IndividualList/individualListReducer";
import ContactsTable from "../../../component/Contact/ContactsTable";
import {
  isNotLabelsColumn,
  isNotListsColumn,
  useCustomProfileFields,
  isNotCollaboratorColumn,
} from "../hooks/useCustomProfileFields";
import {
  deleteMethod,
  downloadFileViaPost,
  get,
  post,
  postWithExceptions,
} from "../../../api/apiRequest";
import {
  DELETE_USER_PROFILE_GROUP,
  GET_USER_PROFILE,
  POST_UPDATE_USER_PROFILE_GROUP,
  POST_UPDATE_USER_PROFILE_REMOVE_FROM_GROUP,
  POST_USER_PROFILE_EXPORT_SPREADSHEET,
} from "../../../api/apiPath";
import { useHistory, useParams } from "react-router";
import "../../../style/css/import_contacts.css";
import { UserProfileGroupType } from "./UserProfileGroupType";
import { SelectAllContext } from "../../../xstate/selectAllIItemsMachine";
import { useSelectAllBehavior } from "../../../xstate/hooks/useSelectAllBehavior";
import BulkEdit from "../../../component/Contact/BulkEdit";
import { SortParamType } from "../../Contact";
import { AddToListPopupGridAction } from "../../../component/Contact/Lists/AddToListPopupGridAction";
import useImportedLists from "./useImportedLists";
import { Trans, useTranslation } from "react-i18next";
import useRouteConfig from "../../../config/useRouteConfig";
import { GridSelection } from "../../../component/shared/grid/GridSelection";
import { ExportButton, MAXIMUM_EXPORT_LIMIT } from "./ContactListsTable";
import { useAccessRulesGuard } from "../../../component/Settings/hooks/useAccessRulesGuard";
import { useFetchContactsPage } from "../../../api/Contacts/useFetchContactsPage";
import { GridControls } from "./IndividualList/GridControls";
import { EmptyListContent } from "./IndividualList/EmptyListContent";
import { useAppSelector } from "../../../AppRootContext";
import { pick, uniq, sum } from "ramda";
import { BackNavLink } from "../../../component/shared/nav/BackNavLink";
import { useContactsSearchFilter } from "../../../api/Contacts/useContactsSearchFilter";
import ModalConfirm from "../../../component/shared/ModalConfirm";
import { LIST_FIELD_NAME } from "../../../config/ProfileFieldMapping";
import {
  ContactsStateType,
  ContactActionType,
  getDefaultStateValue,
  ListType,
  ContactsContext,
} from "../hooks/ContactsStateType";
import { contactReducer } from "../hooks/contactReducer";
import ContactSidebarBeta from "../../../component/Contact/ContactSidebarBeta";
import { useNormalizeFetchContactsFilters } from "../../../component/Contact/shared/FilterGroup/useNormalizeFetchContactsFilters";
import { useFetchContactsContextPage } from "../../../component/Contact/shared/FilterGroup/useFetchContactsContextPage";
import { ContactsRequestExtensionType } from "../../../api/Contacts/types";

type ReducerType = React.Reducer<IndividualListState, IndividualListAction>;

export const LIMIT = 30;

function IndividualList() {
  const { id } = useParams();
  const [state, dispatch] = useReducer<ReducerType>(
    individualListReducer,
    defaultListState()
  );
  const history = useHistory();
  const { routeTo } = useRouteConfig();
  const { company, staffList } = useAppSelector(pick(["company", "staffList"]));

  const { isBooted: fieldsBooted, fields: customFields } =
    useCustomProfileFields({ excludeLabels: false });

  const [listContactsState, listContactsDispatch] = useReducer<
    Reducer<ContactsStateType, ContactActionType>
  >(contactReducer, {
    ...getDefaultStateValue(),
  });

  useEffect(() => {
    if (!fieldsBooted) {
      return;
    }
    listContactsDispatch({ type: "BOOTED" });
  }, [fieldsBooted, listContactsDispatch]);

  const { t } = useTranslation();

  const {
    listNameValue,
    listNameChanged,
    deleteButtonLoading,
    exportButtonLoading,
    listFormLoading,
    listFormSaveLoading,
  } = state;

  const { state: selectAllMachineState, send: selectAllSend } =
    useSelectAllBehavior({
      selectAllCallback: async () => {
        const result = await selectAll();
        return {
          total: result.totalResult,
          targetIds: result.userProfileIds,
        };
      },
    });

  const defaultState = listContactsState.scopeState.default;
  const fieldsAvailable = customFields.filter(
    (f) =>
      isNotLabelsColumn(f) &&
      isNotListsColumn(f) &&
      f.fieldName !== LIST_FIELD_NAME
  );
  const normalizeFetchContactsFilters = useNormalizeFetchContactsFilters({
    fieldsAvailable,
  });

  const applyFilter = (selectedFilters: ListType) => {
    const param = normalizeFetchContactsFilters(selectedFilters);

    listContactsDispatch({
      type: "UPDATE_QUERY",
      ...param,
    });
    listContactsDispatch({ type: "FILTERS.TOGGLE_DRAWER", visible: false });

    fetchPage({ ...param, includeCounts: true, page: 1 });
  };

  const { buildFilters } = useContactsSearchFilter(
    defaultState.filters,
    defaultState.tagFilters,
    defaultState.quickFilter.query,
    [],
    defaultState.collaboratorFilters,
    [
      {
        filterCondition: "Contains",
        nextOperator: "And",
        fieldName: "importfrom",
        fieldType: "importfrom",
        filterValue: [id as string],
      },
    ]
  );
  const { selectAll, fetchContactsPage } = useFetchContactsPage(buildFilters);

  const { lists, listAdded, refresh } = useImportedLists();

  const accessRuleGuard = useAccessRulesGuard();
  const checkedItems = selectAllMachineState.context.targetIds;

  async function exportSelected() {
    if (checkedItems.length === 0) {
      return;
    }
    dispatch({ type: "EXPORT_STARTED" });
    try {
      await downloadFileViaPost(
        POST_USER_PROFILE_EXPORT_SPREADSHEET,
        {
          UserProfileIds: checkedItems,
        },
        "export.csv",
        "text/csv"
      );
      dispatch({ type: "EXPORT_COMPLETED" });
    } catch (e) {
      dispatch({
        type: "EXPORT_ERROR",
        error: e,
      });
    }
  }

  async function removeContactsFromList() {
    if (checkedItems.length === 0) {
      return;
    }
    dispatch({ type: "REMOVE_CONTACTS_STARTED" });
    try {
      await postWithExceptions(
        POST_UPDATE_USER_PROFILE_REMOVE_FROM_GROUP.replace(
          "{id}",
          id as string
        ),
        { param: { UserProfileIds: checkedItems } }
      );
      dispatch({ type: "REMOVE_CONTACTS_COMPLETED" });
      await fetchPage({ includeCounts: true });
    } catch (error) {
      dispatch({
        type: "REMOVE_CONTACTS_ERROR",
        error,
      });
    }
  }

  const fetchPage = useFetchContactsContextPage({
    fetchContactsPage,
    pageSize: LIMIT,
    dispatch: listContactsDispatch,
    state: listContactsState,
    selectAllMachineState,
    selectAllSend,
  });

  async function deleteList() {
    dispatch({ type: "DELETE_LIST_STARTED" });
    try {
      await deleteMethod(DELETE_USER_PROFILE_GROUP, {
        param: {
          ListIds: [id],
        },
      });
      dispatch({ type: "DELETE_LIST_COMPLETED" });
      history.replace({
        pathname: routeTo("/contacts/lists"),
        state: {
          flashMessage: {
            text: t("flash.lists.deleted", { name: state.listNamePersisted }),
            timeout: 2000,
          },
        },
      });
    } catch (error) {
      dispatch({
        type: "DELETE_LIST_ERROR",
        error,
      });
    }
  }

  function setListName(value: string) {
    dispatch({
      type: "SET_LIST_NAME",
      name: value,
    });
  }

  useEffect(() => {
    fetchListData().then(() => {
      fetchPage({ includeCounts: true });
    });
  }, [id]);

  const fetchListData = useCallback(async () => {
    dispatch({ type: "LIST_LOAD_STARTED" });
    try {
      const result: UserProfileGroupType = await get(
        GET_USER_PROFILE.replace("{id}", id as string),
        { param: {} }
      );
      if (result) {
        const totalResult = result.totalContactCount;
        dispatch({
          type: "LIST_LOAD_COMPLETED",
          name: result.importName,
          totalCount: totalResult,
        });
        return {
          totalCount: totalResult,
        };
      } else {
        dispatch({
          type: "UPDATE_SHOW_ERROR_MODAL",
          show: true,
        });
      }
    } catch (error) {
      console.error("error: ", error);
      dispatch({
        type: "LIST_LOAD_ERROR",
        error,
      });

      return {
        totalCount: 0,
      };
    }
  }, [id]);

  async function submitListData() {
    dispatch({ type: "LIST_PERSIST_STARTED" });
    try {
      const result: UserProfileGroupType = await post(
        POST_UPDATE_USER_PROFILE_GROUP.replace("{id}", id as string),
        {
          param: { GroupListName: listNameValue },
        }
      );
      refresh();
      dispatch({
        type: "LIST_PERSIST_COMPLETED",
        name: result.importName,
      });
    } catch (error) {
      console.error(error);
      dispatch({ type: "LIST_PERSIST_ERROR" });
    }
  }

  async function handleSort(param: SortParamType) {
    listContactsDispatch({
      type: "UPDATE_QUERY",
      sort: [param],
    });
  }

  useEffect(() => {
    if (id === undefined) {
      history.replace(routeTo("/contacts/lists"));
    }
  }, [id === undefined]);

  let formCanBeSubmitted =
    listNameChanged &&
    listNameValue.trim() !== "" &&
    !(listFormLoading || listFormSaveLoading);

  const selectAllIds = async () => {
    if (selectAllMachineState.matches("selectedAll")) {
      const result = await selectAll();
      return result.userProfileIds;
    } else {
      return (selectAllMachineState!.context! as SelectAllContext).targetIds;
    }
  };

  function goToCampaign() {
    history.push({
      pathname: routeTo(`/campaigns/create`),
      state: {
        contacts: id,
      },
    });
  }

  const pageTitle = t("nav.menu.lists");

  const loading = listContactsState.loading;

  const defaultAnyFilterApplied =
    sum([
      listContactsState.scopeState.default.filters.length,
      listContactsState.scopeState.default.tagFilters.length,
    ]) > 0;

  const handleQuickSearch = (search: string) => {
    listContactsDispatch({
      type: "QUICK_FILTER.UPDATE",
      value: search,
    });
    fetchPage({ quickSearch: search, page: 1, includeCounts: true });
  };

  const handleNotFoundClick = () => {
    history.push(routeTo("/contacts/lists"));
  };

  return (
    <>
      <div className="post-login">
        <Helmet title={t("nav.common.title", { page: pageTitle })} />
        <PostLogin selectedItem={"Contacts"}>
          <div className="main imported-contacts">
            <Dimmer active={loading} inverted>
              <Loader active={true} />
            </Dimmer>
            <div className="navigation">
              <BackNavLink to={routeTo("/contacts/lists")}>
                {t("nav.back", { to: t("nav.menu.lists") })}
              </BackNavLink>
            </div>
            <div className="main-primary-column">
              <ContactsContext.Provider value={listContactsState}>
                <GridHeader
                  actionsPosition={"top"}
                  deleteConfirmationRequested={state.deleteContactsRequested}
                  requestDeleteConfirmation={(show) => {
                    dispatch({
                      type: "REMOVE_CONTACTS_CONFIRMATION",
                      visible: show,
                    });
                  }}
                  title={
                    <div className="individual-list-form ui form">
                      <div className="form-title-counted">
                        <h1>{t("profile.lists.individual.title")}</h1>
                        <div className="stats">
                          {t("profile.contacts.sidebar.header.counter", {
                            count: defaultAnyFilterApplied
                              ? defaultState.numOfContacts
                              : defaultState.numOfContactsUnfiltered,
                          })}
                        </div>
                      </div>
                      <div className="field">
                        <Input
                          type="text"
                          placeholder={t("form.list.field.name.placeholder")}
                          value={listNameValue}
                          disabled={listFormLoading || listFormSaveLoading}
                          onInput={(event: FormEvent<HTMLInputElement>) =>
                            setListName(event.currentTarget.value)
                          }
                        />
                      </div>
                    </div>
                  }
                  deleteLoading={deleteButtonLoading}
                  onDeleteClick={removeContactsFromList}
                  selectedItemsCount={
                    selectAllMachineState.context.targetIdsCount
                  }
                  deleteLabel={t("profile.list.grid.header.deleteLabel")}
                  deleteTooltip={t("profile.tooltip.list.action.delete")}
                  batchButtons={
                    <>
                      <AddToListPopupGridAction
                        selectedContactsCount={
                          selectAllMachineState.context.targetIdsCount
                        }
                        importedLists={lists
                          .filter((list) => list.id !== Number(id))
                          .map(({ id, importName }) => ({
                            id,
                            listName: importName,
                          }))}
                        selectAllIds={selectAllIds}
                        appendNewList={listAdded}
                      />
                      <BulkEdit
                        selectedCount={
                          selectAllMachineState.context.targetIdsCount
                        }
                        setProfiles={(data) => [
                          listContactsDispatch({
                            type: "UPDATE_PROFILES",
                            profiles: data,
                          }),
                        ]}
                        customFields={customFields.filter(
                          (f) => isNotLabelsColumn(f) || isNotListsColumn(f)
                        )}
                        profiles={listContactsState.profileResult ?? []}
                        staffList={staffList ?? []}
                        companyCountry={company?.companyCountry ?? ""}
                        companyTags={company?.companyHashtags ?? []}
                        selectAllIds={selectAllIds}
                      />
                      <ExportButton
                        isAllowedToExportByLimit={
                          checkedItems.length <= MAXIMUM_EXPORT_LIMIT
                        }
                        isAllowedToExportByAccess={accessRuleGuard.canExportContacts()}
                        onClick={
                          exportButtonLoading ? undefined : exportSelected
                        }
                        loading={exportButtonLoading}
                      />
                    </>
                  }
                  afterMainRow={
                    <GridControls
                      contactsListDispatch={listContactsDispatch}
                      contactsListState={listContactsState}
                      onQuickSearch={handleQuickSearch}
                      onResetFilters={() => {
                        listContactsDispatch({ type: "RESET_QUERY" });
                        fetchPage({
                          includeCounts: true,
                          filters: [],
                          listIds: [],
                          collaboratorIds: [],
                          isShopifyTab: false,
                          tags: [],
                          page: 1,
                        });
                      }}
                      applyFilter={(filters: ContactsRequestExtensionType) => {
                        listContactsDispatch({
                          type: "UPDATE_QUERY",
                          ...filters,
                        });
                        listContactsDispatch({
                          type: "FILTERS.TOGGLE_DRAWER",
                          visible: false,
                        });

                        fetchPage({ ...filters, page: 1, includeCounts: true });
                      }}
                    />
                  }
                >
                  <>
                    <Button
                      onClick={() => dispatch({ type: "DELETE_LIST_ATTEMPT" })}
                      loading={exportButtonLoading}
                      className={"button-small"}
                    >
                      {t("profile.lists.button.delete")}
                    </Button>
                    <Button
                      primary
                      className={"button-small"}
                      onClick={goToCampaign}
                    >
                      {t("broadcast.grid.button.create")}
                    </Button>
                    <Button
                      primary
                      disabled={!formCanBeSubmitted}
                      loading={listFormSaveLoading}
                      className={"button-small"}
                      onClick={
                        !(listFormLoading || listFormSaveLoading)
                          ? () => submitListData()
                          : undefined
                      }
                    >
                      {t("form.button.save")}
                    </Button>
                  </>
                </GridHeader>
                <ContactSidebarBeta
                  visible={listContactsState.filterDrawerVisible}
                  fields={fieldsAvailable}
                  excludeStaticFields={[LIST_FIELD_NAME]}
                  initFieldFilters={defaultState.filters}
                  initTagFilters={defaultState.tagFilters}
                  initTagOperator={defaultState.tagOperator}
                  initListIdFilters={defaultState.listIdFilters}
                  initListIdOperator={defaultState.listOperator}
                  initCollaboratorFilters={defaultState.collaboratorFilters}
                  initCollaboratorOperator={defaultState.collaboratorOperator}
                  numOfContacts={defaultState.numOfContacts}
                  numOfContactsTotal={defaultState.numOfContactsUnfiltered}
                  onHide={() => {
                    listContactsDispatch({
                      type: "FILTERS.TOGGLE_DRAWER",
                      visible: false,
                    });
                  }}
                  onApply={applyFilter}
                />
                <section className="contact-list hide-scrollable-table">
                  <div className="stick-wrap">
                    {!listContactsState.loading && (
                      <ContactsTable
                        loading={listContactsState.loading}
                        customFields={customFields}
                        profileResult={listContactsState.profileResult}
                        selectAllState={selectAllMachineState}
                        selectAllUpdate={selectAllSend}
                        sortBy={handleSort}
                        sort={listContactsState.scopeState.default.sortParams}
                        emptyContent={<EmptyListContent />}
                        contextActions={
                          <GridSelection
                            selectedItemsCount={
                              selectAllMachineState.context.targetIdsCount
                            }
                            itemsSingular={t(
                              "profile.contacts.pluralize.single"
                            )}
                            itemsPlural={t(
                              "profile.contacts.pluralize.multiple"
                            )}
                            deletePrompt={t(
                              "profile.list.grid.header.deletePrompt"
                            )}
                            deleteConfirmationRequested={
                              state.deleteContactsRequested
                            }
                          />
                        }
                      />
                    )}
                  </div>
                </section>
                {listContactsState.totalPages > 1 && (
                  <footer className="footer">
                    <Pagination
                      defaultActivePage={listContactsState.activePage}
                      activePage={listContactsState.activePage}
                      onPageChange={(_, data) => {
                        listContactsDispatch({
                          type: "UPDATE_QUERY",
                          page: data.activePage as number,
                        });
                        fetchPage({
                          page: data.activePage as number,
                          includeCounts: true,
                        });
                      }}
                      totalPages={listContactsState.totalPages}
                    />
                  </footer>
                )}
              </ContactsContext.Provider>
            </div>
          </div>
        </PostLogin>
      </div>
      <ConfirmDelete
        dispatch={dispatch}
        show={state.showDeleteListConfirmation}
        loading={state.deleteListLoading}
        onConfirm={async () => {
          deleteList();
        }}
      />
      <ModalConfirm
        opened={state.showErrorModal}
        onConfirm={handleNotFoundClick}
        title={t("warning")}
        confirmText={t("form.button.close")}
      >
        {t("profile.warning.notFound")}
      </ModalConfirm>
    </>
  );
}

function ConfirmDelete(props: {
  show: boolean;
  loading: boolean;
  onConfirm: Function;
  dispatch: React.Dispatch<IndividualListAction>;
}) {
  const { show, dispatch, loading, onConfirm } = props;
  const { t } = useTranslation();

  function onClose() {
    dispatch({ type: "DELETE_LIST_CANCEL" });
  }

  return (
    <Modal
      open={show}
      closeOnDimmerClick={false}
      dimmer={"inverted"}
      className={"modal-confirm"}
      size={"small"}
      onClose={onClose}
    >
      <Modal.Header>{t("profile.list.confirmDelete.header")}</Modal.Header>
      <Modal.Content>
        <Trans i18nKey={"profile.list.confirmDelete.text"}>
          <p>
            Delete this list? This action can't be undone. The contacts in this
            list won't be deleted.
          </p>
        </Trans>
      </Modal.Content>
      <Modal.Actions>
        <Button
          primary
          onClick={!loading ? () => onConfirm() : undefined}
          loading={loading}
        >
          {t("form.button.delete")}
        </Button>
        <Button onClick={!loading ? onClose : undefined} disabled={loading}>
          {t("form.button.cancel")}
        </Button>
      </Modal.Actions>
    </Modal>
  );
}

export default IndividualList;
