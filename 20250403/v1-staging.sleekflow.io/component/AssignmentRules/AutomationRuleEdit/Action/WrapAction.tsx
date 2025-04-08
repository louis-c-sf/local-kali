import React, { ReactNode, useContext } from "react";
import {
  AutomationActionType,
  WaitActionType,
  WaitableDenormalized,
  AutomationActionWaitableType,
} from "../../../../types/AutomationActionType";
import produce from "immer";
import { remove } from "ramda";
import { WaitableActionProps } from "../ActionsForm";
import { SortControls } from "./SortControls";
import styles from "./ActionsForm.module.css";
import { ActionFormContext } from "../ActionsForm/ActionFormContext";
import { CrossRoundedIcon } from "../../../../assets/tsx/icons/CrossRoundedIcon";

type CommonActionPropsType = {
  setAction: (action: AutomationActionType) => void;
  getActionError: () => string | undefined;
  error: string | undefined;
  canAddWaitAction: boolean;
  canSendInteractiveMessage: boolean;
};

export function WrapAction(props: {
  children: (
    waitProps: WaitableActionProps,
    actionProps: CommonActionPropsType
  ) => ReactNode;
  index: number;
  action: AutomationActionType & AutomationActionWaitableType;
  raised?: boolean;
  deletable?: boolean;
}) {
  const { action, index, deletable = true, raised = false } = props;

  const {
    updateActions,
    getActionError,
    getWaitError,
    canAddWaitAction,
    canSendInteractiveMessage,
    readonly,
  } = useContext(ActionFormContext);

  function actionSetter(index: number) {
    return (updatedAction: AutomationActionType) => {
      updateActions(
        produce((draft) => {
          draft[index] = updatedAction;
        })
      );
    };
  }

  function setWaitActionAt(index: number) {
    return (action: WaitActionType) => {
      updateActions(
        produce((draft) => {
          const actionDraft = draft[index] as WaitableDenormalized;
          actionDraft.actionWaitDenormalized = action;
        })
      );
    };
  }

  function removeWaitActionAt(index: number) {
    return () => {
      const actions = produce((draft: AutomationActionType[]) => {
        (draft[index] as AutomationActionWaitableType).actionWaitDenormalized =
          null;
      });
      updateActions(actions);
    };
  }

  function deleteAction(index: number) {
    return () => {
      updateActions((actions) =>
        remove(index, 1, actions).map((action, idx) => ({
          ...action,
          order: idx + 1,
        }))
      );
    };
  }

  const waitEnabled = Boolean(action?.actionWaitDenormalized);
  const waitProps = {
    waitError: getWaitError(index),
    waitActionAdd: setWaitActionAt(index),
    waitActionChange: setWaitActionAt(index),
    waitActionRemove: removeWaitActionAt(index),
  };
  const actionProps = {
    setAction: actionSetter(index),
    error: getActionError(index),
    getActionError: () => getActionError(index),
    canAddWaitAction: canAddWaitAction(action),
    canSendInteractiveMessage: canSendInteractiveMessage(action),
  };

  function getClassName(readonly: boolean) {
    const baseStyles = [styles.action];
    if (readonly) {
      baseStyles.push(styles.readonly);
    }
    return baseStyles;
  }

  return (
    <div
      className={getClassName(readonly).join(" ")}
      data-action-id={action.componentId}
    >
      {!readonly && (
        <SortControls index={index} raised={raised} waitEnabled={waitEnabled} />
      )}
      {props.children(waitProps, actionProps)}
      {!readonly && deletable && (
        <div className={styles.close} onClick={deleteAction(index)}>
          <CrossRoundedIcon />
        </div>
      )}
    </div>
  );
}
