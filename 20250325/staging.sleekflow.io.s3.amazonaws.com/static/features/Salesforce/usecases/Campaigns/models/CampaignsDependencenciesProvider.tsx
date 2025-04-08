import React, { ReactNode, useContext } from "react";
import { ScalarFieldNormalizedType } from "../../../API/Objects/fetchObjectFieldTypes";
import { ChoiceFieldNormalizedType } from "../../../API/Objects/fetchObjectFieldVendorChoices";
import { StaffType } from "../../../../../types/StaffType";
import { OptionType } from "../../../components/Filter/contracts";
import { ObjectNormalizedType } from "../../../API/Objects/contracts";

export interface CampaignsScreenDependenciesType {
  fieldTypesScalar: ScalarFieldNormalizedType[];
  fieldTypesChoice: ChoiceFieldNormalizedType[];
  staff: StaffType[];
  stages: OptionType[];
  detailData: ObjectNormalizedType | null;
}

const CampaignsDependencenciesContext =
  React.createContext<CampaignsScreenDependenciesType | null>(null);

export function CampaignsDependencenciesProvider(props: {
  value: CampaignsScreenDependenciesType;
  children: ReactNode;
}) {
  return (
    <CampaignsDependencenciesContext.Provider value={props.value}>
      {props.children}
    </CampaignsDependencenciesContext.Provider>
  );
}

export function useCampaignDependenciesContext() {
  const context = useContext(CampaignsDependencenciesContext);
  if (context === null) {
    throw "Need to initialize CampaignsDependencenciesContext";
  }
  return context;
}
