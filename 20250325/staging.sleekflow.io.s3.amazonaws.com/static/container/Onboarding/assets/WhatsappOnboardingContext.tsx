import React, { createContext, ReactNode } from "react";
import { State } from "xstate";
import {
  WhatsappOnboardingEvent,
  WhatsappOnboardingContextType,
} from "../../../component/CreateWhatsappFlow/whatsappOnboardingMachine";

type MachineStateType = State<
  WhatsappOnboardingContextType,
  WhatsappOnboardingEvent
>;
type WhatsappOnboardingReactContextType = {
  machineState: MachineStateType;
  machineSend: (e: WhatsappOnboardingEvent) => MachineStateType;
};

export const WhatsappOnboardingContext = createContext<
  WhatsappOnboardingReactContextType
>({
  machineState: {} as MachineStateType,
  machineSend: () => ({} as MachineStateType),
});

export function WhatsappOnboardingContextProvider(props: {
  machineState: MachineStateType;
  machineSend: (e: WhatsappOnboardingEvent) => MachineStateType;
  children: ReactNode;
}) {
  let { machineState, machineSend } = props;
  return (
    <WhatsappOnboardingContext.Provider
      value={{
        machineSend,
        machineState,
      }}
    >
      {props.children}
    </WhatsappOnboardingContext.Provider>
  );
}
