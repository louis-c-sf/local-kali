import React, { createContext, useContext } from "react";

type DisableControlsContextType = {
  disabled: boolean;
};

const DisableControlsContext = createContext<DisableControlsContextType | null>(
  null
);

export function useDisableControls() {
  const values = useContext(DisableControlsContext);
  if (values === null) {
    throw "Wrap the consuming component into DisableControls";
  }
  return values;
}

export function DisableControls(
  props: DisableControlsContextType & { children: React.ReactNode }
) {
  return (
    <DisableControlsContext.Provider value={props}>
      {props.children}
    </DisableControlsContext.Provider>
  );
}
