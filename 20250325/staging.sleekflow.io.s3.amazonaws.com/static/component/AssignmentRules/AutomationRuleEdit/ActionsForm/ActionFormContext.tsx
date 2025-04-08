import React from "react";
import { AutomationActionType } from "../../../../types/AutomationActionType";
import { F } from "ramda";

export type ActionFormContextType = {
  handleSort: (id: string) => void;
  updateActions: (
    handler: (actions: AutomationActionType[]) => AutomationActionType[]
  ) => void;
  getWaitError: (index: number) => string | undefined;
  getActionError: (index: number) => string | undefined;
  canAddWaitAction: (type: AutomationActionType) => boolean;
  canSendInteractiveMessage: (type: AutomationActionType) => boolean;
  actions: AutomationActionType[];
  readonly: boolean;
};

export const ActionFormContext = React.createContext<ActionFormContextType>({
  actions: [],
  handleSort: () => null,
  updateActions: () => [],
  getActionError: () => undefined,
  getWaitError: () => undefined,
  canAddWaitAction: F,
  canSendInteractiveMessage: F,
  readonly: false,
});
