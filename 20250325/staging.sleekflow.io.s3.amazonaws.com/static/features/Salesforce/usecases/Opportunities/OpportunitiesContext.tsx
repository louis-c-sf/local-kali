import React, { Reducer, useContext, ReactNode } from "react";
import {
  ContinuousPagerStateType,
  defaultContinuousPagerState,
} from "../../reducers/continuousPagerReducer";
import { ChoiceFieldNormalizedType } from "../../API/Objects/fetchObjectFieldVendorChoices";
import {
  DataGridStateType,
  defaultDataGridState,
} from "../../components/ObjectsGrid/DataGridStateType";
import { StaffType } from "../../../../types/StaffType";
import { createObjectsGridReducer } from "../../components/ObjectsGrid/ObjectsGridContext";
import { ObjectNormalizedType } from "../../API/Objects/contracts";
import { ScalarFieldNormalizedType } from "../../API/Objects/fetchObjectFieldTypes";
import {
  ObjectsGridActionType,
  ObjectsGridStateType,
} from "../../components/ObjectsGrid/ObjectsGridContextType";

export type OpportunitiesFilterFormType = {
  search: string;
  stage: string | null;
};

export type OpportunityStageOptionType = {
  value: string;
  title: string;
};
export type OpportunitiesContextDependenciesType = {
  staff: StaffType[];
  stages: OpportunityStageOptionType[];
  fieldTypesScalar: ScalarFieldNormalizedType[];
  fieldTypesChoice: ChoiceFieldNormalizedType[];
};

function defaultFilter(): OpportunitiesFilterFormType {
  return {
    search: "",
    stage: null,
  } as const;
}

export function defaultOpportunitiesState() {
  return {
    ...defaultDataGridState<OpportunitiesFilterFormType, ObjectNormalizedType>(
      defaultFilter()
    ),
    ...defaultContinuousPagerState(),
  };
}

export function createOpportunitiesReducer(
  pageSize: number,
  pagesPerGroup: number
) {
  return createObjectsGridReducer(
    "DATA_LOADED",
    defaultFilter(),
    pageSize,
    pagesPerGroup
  ) as Reducer<
    ObjectsGridStateType<ObjectNormalizedType, OpportunitiesFilterFormType>,
    ObjectsGridActionType<ObjectNormalizedType, OpportunitiesFilterFormType>
  >;
}

const OpportunitiesContext =
  React.createContext<OpportunitiesContextDependenciesType | null>(null);

export function OpportunitiesContextProvider(props: {
  value: OpportunitiesContextDependenciesType;
  children: ReactNode;
}) {
  return (
    <OpportunitiesContext.Provider value={props.value}>
      {props.children}
    </OpportunitiesContext.Provider>
  );
}

export function useOpportunitiesContext() {
  const context = useContext(OpportunitiesContext);
  if (context === null) {
    throw "Need to init OpportunitiesContext";
  }
  return context;
}
