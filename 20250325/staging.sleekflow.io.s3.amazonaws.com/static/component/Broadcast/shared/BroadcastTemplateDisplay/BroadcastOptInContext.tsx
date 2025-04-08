import React, { ReactNode, useContext } from "react";

const BroadcastOptInContext =
  React.createContext<BroadcastOptInContextType | null>(null);

export function useBroadcastOptInContext() {
  const context = useContext(BroadcastOptInContext);
  if (context === null) {
    throw "Add BroadcastOptInContext above this component";
  }
  return context;
}

export function BroadcastOptInContextProvider(
  props: BroadcastOptInContextType & { children: ReactNode }
) {
  const { children, ...values } = props;
  return (
    <BroadcastOptInContext.Provider value={values}>
      {props.children}
    </BroadcastOptInContext.Provider>
  );
}

export type GetIsVarValidInterface = (
  variableName: string,
  variables: Record<string, string>,
  varsTouched: {},
  selectedChannelIndex: number,
  errors?: object
) => boolean;

export type BroadcastOptInContextType = {
  getIsVarValid: GetIsVarValidInterface;
};
