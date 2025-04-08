import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useContext,
} from "react";
import {
  Button,
  Dimmer,
  Loader,
  Pagination,
  PaginationProps,
} from "semantic-ui-react";
import EditColumnsModal from "../component/Contact/EditColumnsModal";
import ContactsTable from "../component/Contact/ContactsTable";
import { CustomProfileField } from "../types/ContactType";
import ProfileSearchType from "../types/ProfileSearchType";
import { NavLink } from "react-router-dom";
import {
  isNotCollaboratorColumn,
  isNotLabelsColumn,
  isNotListsColumn,
  useCustomProfileFields,
} from "./Contact/hooks/useCustomProfileFields";
import { AddToListPopupGridAction } from "../component/Contact/Lists/AddToListPopupGridAction";
import {
  SelectAllMachineEvent,
  SelectAllMachineStateType,
} from "../xstate/selectAllIItemsMachine";
import BulkEdit from "../component/Contact/BulkEdit";
import {
  ContactActionType,
  ContactsContext,
  ContactsStateType,
} from "./Contact/hooks/ContactsStateType";
import { SortParamType } from "./Contact";
import { useTranslation } from "react-i18next";
import { InfoTooltip } from "../component/shared/popup/InfoTooltip";
import { fetchStaffList } from "../api/User/fetchStaffList";
import useRouteConfig from "../config/useRouteConfig";
import { GridSelection } from "../component/shared/grid/GridSelection";
import GridHeader from "../component/shared/grid/GridHeader";
import { useAccessRulesGuard } from "../component/Settings/hooks/useAccessRulesGuard";
import { AudienceType } from "../types/BroadcastCampaignType";
import { allPass, anyPass, pick, reject, sum } from "ramda";
import { HashTagCountedType } from "../types/ConversationType";
import { NamedType } from "../types/FilterConfigType";
import { UserProfileGroupType } from "./Contact/Imported/UserProfileGroupType";
import { GridControls } from "../component/Contact/ContactsTable/GridControls";
import { EmptyContactContent } from "../component/Contact/ContactsTable/EmptyContactContent";
import { useAppDispatch, useAppSelector } from "../AppRootContext";
import ErrorMessageModal from "../component/Contact/NewContact/ErrorMessageModal";
import { useFetchMessageSent } from "api/Contacts/useFetchMessageSent";

export default ContactMain;

export const isListFilter = (flt: NamedType) => flt.fieldName === "importfrom";
export const isContactOwnerFilter = (flt: NamedType) =>
  flt.fieldName.toLowerCase() === "contactowner";
export const visibleInGridHeader: (flt: NamedType) => boolean = anyPass([
  isContactOwnerFilter,
  isListFilter,
]);

export function updateContactOwnerFilter(
  filters: AudienceType[],
  values: string[]
) {
  let filterUpdated: AudienceType[];
  if (values.length === 0) {
    filterUpdated = reject(isContactOwnerFilter, filters);
  } else if (filters.some(isContactOwnerFilter)) {
    filterUpdated = filters.reduce<AudienceType[]>((acc, next) => {
      if (!isContactOwnerFilter(next)) {
        return [...acc, next];
      }
      return [...acc, { ...next, filterValue: values }];
    }, []);
  } else {
    filterUpdated = [
      ...filters,
      {
        filterValue: values,
        fieldName: "ContactOwner",
        nextOperator: "And",
        filterCondition: "Contains",
        fieldType: "options",
      },
    ];
  }
  return filterUpdated;
}

function ContactMain(props: {
  handleNewContact: Function;
  handlePageChange: (page: number) => void;
  handleSort: (param: SortParamType) => void;
  deleteProfile: () => void;
  selectAllMachineState: SelectAllMachineStateType;
  selectAllSend: (e: SelectAllMachineEvent) => SelectAllMachineStateType;
  selectAllIds: () => Promise<string[]>;
  setProfileResult: (result: ProfileSearchType[]) => void;
  setFilters: (filters: AudienceType[]) => void;
  setTagFilters: (tags: HashTagCountedType[]) => void;
  setListFilters: (listIds: string[]) => void;
  resetFilters: () => void;
  state: ContactsStateType;
  dispatch: (action: ContactActionType) => void;
  onQuickSearchChange: (text: string) => void;
  onQuickSearch: (text: string) => void;
  lists: UserProfileGroupType[];
  listsLoading: boolean;
  onListAdded: (list: UserProfileGroupType) => void;
  refreshPage: () => void;
}) {
  const { deleteProfile, selectAllMachineState, selectAllSend } = props;
  const { setProfileResult, handlePageChange, state, dispatch } = props;
  const { selectAllIds, onQuickSearch, onQuickSearchChange } = props;
  const { lists, onListAdded, refreshPage } = props;
  const [openEditColumnModal, setOpenEditColumnModal] = useState(false);
  const { staffList, company, usage } = useAppSelector(
    pick(["company", "staffList", "usage"])
  );
  const { maximumContacts, totalContacts } = usage;
  const loginDispatch = useAppDispatch();
  const { routeTo } = useRouteConfig();
  const selectedProfilesCount = selectAllMachineState.context.targetIdsCount;
  const { booted: isFetchMessageSentLoaded } = useFetchMessageSent();
  const { scopeState } = useContext(ContactsContext);

  const setTagAndOperatorFilter =
    scopeState.default.setTagAndOperatorFilter ?? (() => {});
  const accessRulesGuard = useAccessRulesGuard();
  const setFields = (fields: CustomProfileField[]) =>
    dispatch({
      type: "UPDATE_FIELDS",
      fields,
    });

  const { t } = useTranslation();
  const { fields: customFields, isBooted: fieldsBooted } =
    useCustomProfileFields({
      excludeLabels: false,
      includeNonVisibleFields: true,
    });

  useEffect(() => {
    if (!fieldsBooted) {
      return;
    }
    setFields(customFields);
  }, [fieldsBooted]);

  useEffect(() => {
    if (staffList.length === 0) {
      fetchStaffList(loginDispatch);
    }
  }, [JSON.stringify(staffList)]);

  const handleNewContact = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      if (totalContacts > maximumContacts) {
        dispatch({ type: "SHOW_ERROR_MESSAGE_MODAL" });
      } else {
        props.handleNewContact(e);
      }
    },
    [totalContacts, maximumContacts]
  );

  const setEditColumnModalOpened = useCallback(
    () => setOpenEditColumnModal(true),
    []
  );

  const emptyContent = useMemo(
    () => (
      <EmptyContactContent openEditColumnModal={setEditColumnModalOpened} />
    ),
    [setEditColumnModalOpened]
  );

  const contextActions = useMemo(
    () => (
      <GridSelection
        selectedItemsCount={selectedProfilesCount}
        itemsSingular={t("profile.contacts.pluralize.single")}
        itemsPlural={t("profile.contacts.pluralize.multiple")}
        deleteConfirmationRequested={state.deleteConfirmationVisible}
      />
    ),
    [selectedProfilesCount, state.deleteConfirmationVisible]
  );

  if (!state.booted) {
    return (
      <Dimmer active inverted>
        <Loader inverted></Loader>
      </Dimmer>
    );
  }

  const defaultAnyFilterApplied =
    sum([
      scopeState.default.filters.length,
      scopeState.default.tagFilters.length,
      scopeState.default.listIdFilters.length,
    ]) > 0;
  const defaultFiltersAffected =
    scopeState.default.numOfContacts <
    scopeState.default.numOfContactsUnfiltered;

  const closeModal = () => {
    dispatch({
      type: "HIDE_ERROR_MESSAGE_MODAL",
    });
  };

  return (
    <>
      <GridHeader
        deleteLoading={state.deleteLoading}
        onDeleteClick={deleteProfile}
        selectedItemsCount={selectedProfilesCount}
        deleteConfirmationRequested={state.deleteConfirmationVisible}
        requestDeleteConfirmation={(show) => {
          dispatch({ type: "CONTACT_DELETE_CONFIRMATION", visible: show });
        }}
        deleteTooltip={t("profile.tooltip.action.delete")}
        loft={
          <div className={"loft-title"}>
            <span className="text">
              {defaultFiltersAffected || defaultAnyFilterApplied
                ? t("profile.contacts.grid.header.all.filtered")
                : t("profile.contacts.grid.header.all.default")}
            </span>
            <div className="counter">{scopeState.default.numOfContacts}</div>
          </div>
        }
        title={
          <GridControls
            onQuickSearchChange={onQuickSearchChange}
            onQuickSearch={onQuickSearch}
            state={state}
            setFilters={props.setFilters}
            setListFilters={props.setListFilters}
            setTagFilters={props.setTagFilters}
            anyFilterApplied={defaultAnyFilterApplied}
            dispatch={dispatch}
            resetFilters={props.resetFilters}
            setTagAndOperatorFilter={setTagAndOperatorFilter}
          />
        }
        batchButtons={
          <>
            <AddToListPopupGridAction
              selectedContactsCount={selectedProfilesCount}
              importedLists={lists.map(({ id, importName }) => ({
                id,
                listName: importName,
              }))}
              selectAllIds={selectAllIds}
              appendNewList={onListAdded}
            />

            <BulkEdit
              selectedCount={selectedProfilesCount}
              setProfiles={setProfileResult}
              profiles={state.profileResult}
              customFields={customFields.filter(
                allPass([
                  isNotCollaboratorColumn,
                  isNotListsColumn,
                  isNotLabelsColumn,
                ])
              )}
              staffList={staffList}
              companyCountry={company?.companyCountry ?? ""}
              companyTags={company?.companyHashtags ?? []}
              selectAllIds={selectAllIds}
              refreshPage={refreshPage}
            />
          </>
        }
        deleteEnabled={accessRulesGuard.canDeleteUser()}
      >
        <EditColumnsModal
          setOpened={setOpenEditColumnModal}
          opened={openEditColumnModal}
          setFields={setFields}
          initFields={customFields}
        />
        <InfoTooltip
          placement={"bottom"}
          children={t("profile.tooltip.action.import")}
          trigger={
            <NavLink to={routeTo("/contacts/import")} className={"ui button"}>
              {t("profile.contacts.button.import")}
            </NavLink>
          }
        />
        <InfoTooltip
          placement={"bottom"}
          children={t("profile.tooltip.action.create")}
          trigger={
            <Button
              primary
              disabled={!isFetchMessageSentLoaded}
              onClick={handleNewContact}
            >
              {t("form.button.createContact")}
            </Button>
          }
        />
      </GridHeader>

      <div
        className={`contact-list hide-scrollable-table ${
          (state.newContactFormVisible && "blur") || ""
        }`}
      >
        <div className="stick-wrap">
          <ContactsTable
            loading={state.loading}
            profileResult={state.profileResult}
            customFields={state.scopeState.default.fields}
            selectAllState={selectAllMachineState}
            selectAllUpdate={selectAllSend}
            sort={state.scopeState.default.sortParams}
            sortBy={props.handleSort}
            emptyContent={emptyContent}
            contextActions={contextActions}
          />
        </div>
      </div>
      {state.totalPages > 1 && (
        <footer className="footer">
          <Pagination
            disabled={state.loading}
            activePage={state.activePage}
            onPageChange={(e, data: PaginationProps) =>
              handlePageChange(Number(data.activePage))
            }
            siblingRange={5}
            totalPages={state.totalPages}
          />
        </footer>
      )}
      {
        <ErrorMessageModal
          show={state.errorModal.visible}
          closeModal={closeModal}
        />
      }
    </>
  );
}
