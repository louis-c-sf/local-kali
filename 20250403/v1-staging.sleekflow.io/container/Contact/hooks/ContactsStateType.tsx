import { CustomProfileField } from "../../../types/ContactType";
import React from "react";
import ProfileSearchType from "../../../types/ProfileSearchType";
import { SortParamType } from "../../Contact";
import { AudienceType } from "../../../types/BroadcastCampaignType";
import { HashTagCountedType } from "../../../types/ConversationType";
import { ConditionNameType } from "../../../config/ProfileFieldMapping";

export type ContactsStateType = {
  booted: boolean;
  activePage: number;
  totalPages: number;
  deleteLoading: boolean;
  deleteConfirmationVisible: boolean;
  profileResult: ProfileSearchType[];
  loading: boolean;
  filterDrawerVisible: boolean;
  newContactFormVisible: boolean;
  errorModal: {
    visible: boolean;
  };
  currency?: string | undefined;
  scopeState: {
    default: DefaultScopeType;
  };
};

type DefaultScopeType = {
  numOfContacts: number;
  numOfContactsUnfiltered: number;
  fields: CustomProfileField[];
  filters: AudienceType[];
  tagFilters: HashTagCountedType[];
  tagOperator: ConditionNameType;
  listIdFilters: string[];
  listOperator: ConditionNameType;
  collaboratorFilters: string[];
  collaboratorOperator: ConditionNameType;
  setTagAndOperatorFilter?: (
    tags: HashTagCountedType[],
    operator: ConditionNameType
  ) => void;
  setListIdAndOperatorFilter?: (
    ids: string[],
    operator: ConditionNameType
  ) => void;
  errorModal: {
    visible: boolean;
  };
  sortParams: SortParamType[];
  setCollaboratorAndOperatorFilter?: (
    ids: string[],
    operator: ConditionNameType
  ) => void;
  quickFilter: { query: string };
};

export type ContactActionType =
  | { type: "BOOTED" }
  | {
      type: "UPDATE_CONTACTS_NUMBER";
      number: number;
      numberUnfiltered?: number;
    }
  | { type: "UPDATE_FIELDS"; fields: CustomProfileField[] }
  | { type: "UPDATE_PROFILES"; profiles: ProfileSearchType[] }
  | { type: "QUICK_FILTER.UPDATE"; value: string }
  | { type: "FILTERS.TOGGLE_DRAWER"; visible: boolean }
  | { type: "SHOW_NEW_CONTACT_FORM" }
  | { type: "HIDE_NEW_CONTACT_FORM" }
  | { type: "PAGE_LOAD_START" }
  | { type: "PAGE_LOAD_STOP" }
  | {
      type: "PAGE_LOAD_END";
      profiles: ProfileSearchType[];
      pagesTotal: number;
      itemsTotal?: number;
      itemsTotalUnfiltered?: number;
      page: number;
      shopifyItemsTotal?: number;
      shopifyItemsTotalUnfiltered?: number;
    }
  | { type: "CONTACT_DELETE_START" }
  | { type: "CONTACT_DELETE_CONFIRMATION"; visible: boolean }
  | { type: "CONTACT_DELETE_END" }
  | {
      type: "UPDATE_QUERY";
      filters?: AudienceType[];
      page?: number;
      sort?: SortParamType[];
      tags?: HashTagCountedType[];
      tagOperator?: ConditionNameType;
      listIds?: string[];
      listOperator?: ConditionNameType;
      collaboratorIds?: string[];
      collaboratorOperator?: ConditionNameType;
    }
  | { type: "RESET_QUERY" }
  | { type: "SHOW_ERROR_MESSAGE_MODAL" }
  | { type: "HIDE_ERROR_MESSAGE_MODAL" }
  | { type: "UPDATE_CURRENCY"; currency: string | undefined };

export const DefaultOperatorValue = "ContainsAny";

export enum ScopeEnum {
  default = "default",
}

export function getDefaultStateValue(): ContactsStateType {
  return {
    booted: false,
    activePage: 1,
    deleteLoading: false,
    deleteConfirmationVisible: false,
    filterDrawerVisible: false,
    loading: true,
    newContactFormVisible: false,
    profileResult: [],
    totalPages: 0,
    errorModal: {
      visible: false,
    },
    currency: undefined,
    scopeState: {
      default: getDefaultScopeState(),
    },
  };
}

export type ListType = Array<ListTypeValue>;

export interface ListTypeValue {
  selectedValue: SelectedValuesType;
  fieldName: string;
  meta?: {
    currency?: string;
  };
}

export interface SelectedValuesType {
  operator: ConditionNameType;
  values: string[];
}

function getDefaultScopeState(): DefaultScopeType {
  return {
    numOfContacts: 0,
    numOfContactsUnfiltered: 0,
    fields: [],
    filters: [],
    sortParams: [],
    tagFilters: [],
    tagOperator: DefaultOperatorValue,
    listIdFilters: [],
    listOperator: DefaultOperatorValue,
    collaboratorFilters: [],
    collaboratorOperator: DefaultOperatorValue,
    quickFilter: { query: "" },
    setTagAndOperatorFilter: () => {},
    setListIdAndOperatorFilter: () => {},
    errorModal: {
      visible: false,
    },
    setCollaboratorAndOperatorFilter: () => {},
  };
}

export const ContactsContext = React.createContext<ContactsStateType>(
  getDefaultStateValue()
);
