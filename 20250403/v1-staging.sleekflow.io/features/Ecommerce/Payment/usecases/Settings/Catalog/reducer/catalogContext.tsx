import React, { useReducer, createContext } from "react";
import {
  initialCatalogStatus,
  CatalogStatusType,
  CatalogActionType,
  catalogReducer,
} from "./catalogReducer";

export interface CatalogContextType<Id extends number | string> {
  state: CatalogStatusType<Id>;
  dispatch: (action: CatalogActionType) => any;
}

export const CatalogContext = createContext<
  CatalogContextType<number | string>
>({
  state: initialCatalogStatus(),
  dispatch: () => {},
});

export const CatalogContextNum = CatalogContext as React.Context<
  CatalogContextType<number>
>;
export const CatalogContextStr = CatalogContext as React.Context<
  CatalogContextType<string>
>;

type Mutable<T> = { -readonly [K in keyof T]: T[K] };

export const CatalogProvider = <Id extends number | string>(props: {
  children: React.ReactNode;
}) => {
  const [state, dispatch] = useReducer(
    catalogReducer,
    initialCatalogStatus<Id>()
  );
  return (
    <CatalogContext.Provider
      value={{ state: state as Mutable<CatalogStatusType<Id>>, dispatch }}
    >
      {props.children}
    </CatalogContext.Provider>
  );
};
