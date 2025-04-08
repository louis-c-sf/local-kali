import React from "react";
import { NewNumberInfoType } from "../types";
import { ConnectionFee } from "./ConnectionFee";
import { ConnectNewNumber } from "./ConnectNewNumber";

export const ConnectContainer = (props: {
  selectedNewNumber: NewNumberInfoType | undefined;
  setSelectedNewNumber: (
    selectedNewNumber: NewNumberInfoType | undefined
  ) => void;
  onSubmit: () => void;
  showConnectionFee: boolean;
}) => {
  return props.showConnectionFee ? (
    <ConnectionFee />
  ) : (
    <ConnectNewNumber
      selectedNewNumber={props.selectedNewNumber}
      setSelectedNewNumber={props.setSelectedNewNumber}
      onSubmit={() => props.onSubmit()}
    />
  );
};
