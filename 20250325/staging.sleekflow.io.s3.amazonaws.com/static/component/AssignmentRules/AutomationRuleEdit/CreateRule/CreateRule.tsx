import React, { useReducer } from "react";
import styles from "./CreateRule.module.css";
import { RuleTemplateType } from "../templates";
import CloseIcon from "../../../../assets/tsx/icons/CloseIcon";
import { ChooseStrategy } from "./ChooseStrategy";
import {
  createRuleReducer,
  createRuleDefaultState,
  CreateRuleContext,
} from "./createRuleReducer";
import { CustomizeRuleStrategy } from "./CustomizeRuleStrategy";
import { ApplyTemplateStrategy } from "./ApplyTemplateStrategy";

export function CreateRule(props: {
  onTemplateChosen: (t: RuleTemplateType) => void;
  onCancel: () => void;
  templates: RuleTemplateType[];
}) {
  const { onCancel, onTemplateChosen, templates } = props;
  const [state, dispatch] = useReducer(
    createRuleReducer,
    createRuleDefaultState()
  );

  const showChooseStrategy = state.strategy === null;
  const showCustomizeRule = state.strategy === "customize";
  const showChooseTemplate = state.strategy === "template";

  return (
    <CreateRuleContext.Provider value={state}>
      <div className={styles.component}>
        <div className={styles.close}>
          <CloseIcon onClick={onCancel} />
        </div>
        {showChooseStrategy && <ChooseStrategy dispatch={dispatch} />}
        {showCustomizeRule && (
          <CustomizeRuleStrategy
            dispatch={dispatch}
            onTemplateChosen={onTemplateChosen}
          />
        )}
        {showChooseTemplate && (
          <ApplyTemplateStrategy
            dispatch={dispatch}
            onTemplateChosen={onTemplateChosen}
            templates={templates}
          />
        )}
      </div>
    </CreateRuleContext.Provider>
  );
}
