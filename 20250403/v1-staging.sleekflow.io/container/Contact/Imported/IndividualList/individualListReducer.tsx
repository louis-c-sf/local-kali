import produce from "immer";
import { DefaultOperatorValue } from "../../hooks/ContactsStateType";

export type IndividualListAction =
  | { type: "SET_LIST_NAME"; name: string }
  | { type: "PAGE_LOADED_ERROR"; error: string }
  | { type: "EXPORT_STARTED" }
  | { type: "EXPORT_COMPLETED" }
  | { type: "EXPORT_ERROR"; error: string }
  | { type: "DELETE_LIST_ATTEMPT" }
  | { type: "DELETE_LIST_CANCEL" }
  | { type: "DELETE_LIST_STARTED" }
  | { type: "DELETE_LIST_COMPLETED" }
  | { type: "DELETE_LIST_ERROR"; error: string }
  | { type: "REMOVE_CONTACTS_CONFIRMATION"; visible: boolean }
  | { type: "REMOVE_CONTACTS_STARTED" }
  | { type: "REMOVE_CONTACTS_COMPLETED" }
  | { type: "REMOVE_CONTACTS_ERROR"; error: string }
  | { type: "LIST_LOAD_STARTED" }
  | { type: "LIST_LOAD_COMPLETED"; name: string; totalCount: number }
  | { type: "LIST_LOAD_ERROR"; error: string }
  | { type: "LIST_PERSIST_STARTED" }
  | { type: "LIST_PERSIST_COMPLETED"; name: string }
  | { type: "LIST_PERSIST_ERROR" }
  | { type: "UPDATE_SHOW_ERROR_MODAL"; show: boolean };

export interface IndividualListState {
  showDeleteListConfirmation: boolean;
  listNamePersisted: string;
  listNameValue: string;
  listNameChanged: boolean;
  deleteListLoading: boolean;
  itemsLoading: boolean;
  deleteContactsRequested: boolean;
  deleteButtonLoading: boolean;
  exportButtonLoading: boolean;
  listFormLoading: boolean;
  listFormSaveLoading: boolean;
  showErrorModal: boolean;
}

export const individualListReducer = produce(
  (draft: IndividualListState, action: IndividualListAction) => {
    switch (action.type) {
      case "SET_LIST_NAME":
        draft.listNameValue = action.name;
        draft.listNameChanged = draft.listNameValue !== draft.listNamePersisted;
        break;

      case "EXPORT_STARTED":
        draft.exportButtonLoading = true;
        break;

      case "EXPORT_ERROR":
        console.error(action.type, action.error);
        draft.exportButtonLoading = false;
        break;

      case "EXPORT_COMPLETED":
        draft.exportButtonLoading = false;
        break;

      case "DELETE_LIST_ATTEMPT":
        draft.showDeleteListConfirmation = true;
        break;

      case "DELETE_LIST_CANCEL":
        draft.showDeleteListConfirmation = false;
        break;

      case "DELETE_LIST_STARTED":
        draft.deleteListLoading = true;
        break;

      case "DELETE_LIST_COMPLETED":
        draft.itemsLoading = false;
        break;

      case "DELETE_LIST_ERROR":
        console.error(action.type, action.error);
        draft.itemsLoading = false;
        break;

      case "REMOVE_CONTACTS_CONFIRMATION":
        draft.deleteContactsRequested = action.visible;
        break;

      case "REMOVE_CONTACTS_STARTED":
        draft.deleteButtonLoading = true;
        break;

      case "REMOVE_CONTACTS_COMPLETED":
        draft.deleteButtonLoading = false;
        break;

      case "REMOVE_CONTACTS_ERROR":
        console.error(action.type, action.error);
        draft.deleteButtonLoading = false;
        break;

      case "LIST_LOAD_STARTED":
        draft.listFormLoading = true;
        break;

      case "LIST_LOAD_COMPLETED":
        draft.listNameChanged = false;
        draft.listNamePersisted = action.name;
        draft.listNameValue = action.name;
        draft.listFormLoading = false;
        break;

      case "LIST_LOAD_ERROR":
        console.error(action.type, action.error);
        draft.listFormLoading = false;
        break;

      case "LIST_PERSIST_STARTED":
        draft.listFormSaveLoading = true;
        break;

      case "LIST_PERSIST_COMPLETED":
        draft.listNamePersisted = action.name;
        draft.listNameChanged = false;
        draft.listFormSaveLoading = false;
        break;

      case "LIST_PERSIST_ERROR":
        draft.listFormSaveLoading = false;
        break;

      case "UPDATE_SHOW_ERROR_MODAL":
        draft.showErrorModal = action.show;
        break;
    }
  }
);

export function defaultListState(): IndividualListState {
  return {
    showDeleteListConfirmation: false,
    listNameChanged: false,
    listNameValue: "",
    listNamePersisted: "",
    deleteButtonLoading: false,
    deleteContactsRequested: false,
    exportButtonLoading: false,
    deleteListLoading: false,
    listFormLoading: true,
    listFormSaveLoading: false,
    itemsLoading: true,
    showErrorModal: false,
  };
}
