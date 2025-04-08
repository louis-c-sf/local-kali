import {
  ContactActionType,
  ContactsStateType,
  DefaultOperatorValue,
} from "./ContactsStateType";
import produce from "immer";

export const contactReducer = produce(
  (draft: ContactsStateType, action: ContactActionType) => {
    switch (action.type) {
      case "BOOTED":
        draft.booted = true;
        break;

      case "UPDATE_CONTACTS_NUMBER":
        draft.scopeState.default.numOfContacts = action.number;
        if (action.numberUnfiltered !== undefined) {
          draft.scopeState.default.numOfContactsUnfiltered =
            action.numberUnfiltered!;
        }
        break;

      case "UPDATE_FIELDS":
        draft.scopeState.default.fields = action.fields;
        break;

      case "UPDATE_PROFILES":
        draft.profileResult = action.profiles;
        break;

      case "SHOW_NEW_CONTACT_FORM":
        draft.newContactFormVisible = true;
        break;

      case "HIDE_NEW_CONTACT_FORM":
        draft.newContactFormVisible = false;
        break;

      case "PAGE_LOAD_START":
        draft.loading = true;
        break;

      case "PAGE_LOAD_STOP":
        draft.loading = false;
        break;

      case "PAGE_LOAD_END":
        draft.loading = false;
        draft.profileResult = action.profiles;
        draft.activePage = action.page;
        draft.totalPages = action.pagesTotal;
        if (action.itemsTotal !== undefined) {
          draft.scopeState.default.numOfContacts = action.itemsTotal;
        }
        if (action.itemsTotalUnfiltered !== undefined) {
          draft.scopeState.default.numOfContactsUnfiltered =
            action.itemsTotalUnfiltered;
        }
        break;

      case "CONTACT_DELETE_CONFIRMATION":
        draft.deleteConfirmationVisible = action.visible;
        break;

      case "CONTACT_DELETE_START":
        draft.deleteLoading = true;
        break;

      case "CONTACT_DELETE_END":
        draft.deleteLoading = false;
        break;

      case "QUICK_FILTER.UPDATE":
        draft.scopeState.default.quickFilter.query = action.value;
        break;

      case "UPDATE_QUERY":
        if (action.page) {
          draft.activePage = action.page;
        }
        if (action.filters) {
          draft.scopeState.default.filters = action.filters;
        }
        if (action.sort) {
          draft.scopeState.default.sortParams = action.sort;
        }
        if (action.tags) {
          draft.scopeState.default.tagFilters = action.tags;
        }
        if (action.tagOperator) {
          draft.scopeState.default.tagOperator = action.tagOperator;
        }
        if (action.listIds) {
          draft.scopeState.default.listIdFilters = action.listIds;
        }
        if (action.listOperator) {
          draft.scopeState.default.listOperator = action.listOperator;
        }
        if (action.collaboratorIds) {
          draft.scopeState.default.collaboratorFilters = action.collaboratorIds;
        }
        if (action.collaboratorOperator) {
          draft.scopeState.default.collaboratorOperator =
            action.collaboratorOperator;
        }
        break;

      case "RESET_QUERY":
        draft.activePage = 1;
        draft.scopeState.default.filters = [];
        draft.scopeState.default.tagFilters = [];
        draft.scopeState.default.tagOperator = DefaultOperatorValue;
        draft.scopeState.default.listIdFilters = [];
        draft.scopeState.default.listOperator = DefaultOperatorValue;
        draft.scopeState.default.collaboratorFilters = [];
        draft.scopeState.default.collaboratorOperator = DefaultOperatorValue;
        break;

      case "FILTERS.TOGGLE_DRAWER":
        draft.filterDrawerVisible = action.visible;
        break;
      case "SHOW_ERROR_MESSAGE_MODAL":
        draft.errorModal.visible = true;
        break;
      case "HIDE_ERROR_MESSAGE_MODAL":
        draft.errorModal.visible = false;
        break;
      case "UPDATE_CURRENCY":
        draft.currency = action.currency;
        break;
    }
  }
);
