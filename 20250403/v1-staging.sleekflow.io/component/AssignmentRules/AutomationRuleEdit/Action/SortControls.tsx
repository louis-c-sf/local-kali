import { swapOrderables } from "../../helpers/swapOrderables";
import React, { useContext } from "react";
import styles from "./SortControls.module.css";
import { ActionFormContext } from "../ActionsForm/ActionFormContext";

export function SortControls(props: {
  index: number;
  raised?: boolean;
  waitEnabled?: boolean;
}) {
  const { index, raised = false, waitEnabled = false } = props;
  const { updateActions, handleSort, actions } = useContext(ActionFormContext);

  function canMoveUp(index: number) {
    return index > 0;
  }

  function canMoveDown(index: number, items: any[]) {
    return index < items.length - 1;
  }

  function moveUp(index: number) {
    return () => {
      if (canMoveUp(index)) {
        const indexTo = index - 1;
        updateActions((actions) => swapOrderables(actions, index, indexTo));
        const componentId = actions[index]?.componentId;
        if (componentId) {
          handleSort(componentId);
        }
      }
    };
  }

  function moveDown(index: number) {
    return () => {
      if (canMoveDown(index, actions)) {
        const indexTo = index + 1;
        updateActions((actions) => swapOrderables(actions, index, indexTo));
        const componentId = actions[index]?.componentId;
        if (componentId) {
          handleSort(componentId);
        }
      }
    };
  }

  if (actions.length < 2) {
    return null;
  }

  return (
    <div
      className={`
        ${styles.controls}
        ${raised ? styles.raised : ""}
        ${waitEnabled ? styles.waitEnabled : ""}`}
    >
      <div
        className={`${styles.sort} ${styles.up}
         ${canMoveUp(index) ? "" : styles.disabled}`}
        onClick={moveUp(index)}
      />
      <div
        className={`
          ${styles.sort} ${styles.down} 
          ${canMoveDown(index, actions) ? "" : styles.disabled}`}
        onClick={moveDown(index)}
      />
    </div>
  );
}
