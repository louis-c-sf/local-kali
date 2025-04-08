import React, { createContext, useContext } from "react";

type GridHeaderContextType = {
  mainRowNode: HTMLElement | null;
};
const GridHeaderContextInternal = createContext<GridHeaderContextType>({
  mainRowNode: null,
});

export function GridHeaderContext(props: {
  value: GridHeaderContextType;
  children: React.ReactNode;
}) {
  return (
    <GridHeaderContextInternal.Provider value={props.value}>
      {props.children}
    </GridHeaderContextInternal.Provider>
  );
}

export function useGridHeaderContext() {
  return useContext(GridHeaderContextInternal);
}
