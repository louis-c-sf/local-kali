import React, { Reducer, useContext, ReactNode } from "react";
import { defaultContinuousPagerState } from "../../reducers/continuousPagerReducer";
import { LeadNormalizedType } from "../../API/Leads/fetchLeads";
import { ChoiceFieldNormalizedType } from "../../API/Objects/fetchObjectFieldVendorChoices";
import { defaultDataGridState } from "../../components/ObjectsGrid/DataGridStateType";
import { StaffType } from "../../../../types/StaffType";
import { createObjectsGridReducer } from "../../components/ObjectsGrid/ObjectsGridContext";
import { ScalarFieldNormalizedType } from "../../API/Objects/fetchObjectFieldTypes";
import {
  ObjectsGridActionType,
  ObjectsGridStateType,
} from "../../components/ObjectsGrid/ObjectsGridContextType";
import { OptionType } from "../../components/Filter/contracts";

export interface LeadFilterFormType {
  search: string;
  status: string | null;
  source: string | null;
  campaign: string | null;
}

export interface LeadStatusOptionType {
  value: string;
  title: string;
}

export interface LeadSourceOptionType {
  value: string;
  title: string;
}

export interface LeadsContextDependenciesType {
  staff: StaffType[];
  statuses: LeadStatusOptionType[];
  sources: LeadSourceOptionType[];
  fieldTypesScalar: ScalarFieldNormalizedType[];
  fieldTypesChoice: ChoiceFieldNormalizedType[];
  campaignChoices: OptionType[];
}

function defaultFilter(): LeadFilterFormType {
  return {
    search: "",
    source: null,
    status: null,
    campaign: null,
  } as const;
}

export function defaultLeadsState() {
  return {
    ...defaultDataGridState<LeadFilterFormType, LeadNormalizedType>(
      defaultFilter()
    ),
    ...defaultContinuousPagerState(),
  };
}

export function createLeadsReducer(pageSize: number, pagesPerGroup: number) {
  return createObjectsGridReducer(
    "DATA_LOADED",
    defaultFilter(),
    pageSize,
    pagesPerGroup
  ) as Reducer<
    ObjectsGridStateType<LeadNormalizedType, LeadFilterFormType>,
    ObjectsGridActionType<LeadNormalizedType, LeadFilterFormType>
  >;
}

const LeadsContext = React.createContext<LeadsContextDependenciesType | null>(
  null
);

export function LeadsContextProvider(props: {
  value: LeadsContextDependenciesType;
  children: ReactNode;
}) {
  return (
    <LeadsContext.Provider value={props.value}>
      {props.children}
    </LeadsContext.Provider>
  );
}

export function useLeadsContext() {
  const context = useContext(LeadsContext);
  if (context === null) {
    throw "Need to init LeadsContext";
  }
  return context;
}
