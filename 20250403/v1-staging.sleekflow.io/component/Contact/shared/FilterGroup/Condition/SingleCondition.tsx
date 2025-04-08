import React, { ReactNode } from "react";
import { ConditionNameMapType } from "../../../locaizable/useConditionNameLocale";
import { ConditionNameType } from "../../../../../config/ProfileFieldMapping";
import { RadioInput } from "../../../../shared/input/RadioInput";
import styles from "./SingleCondition.module.css";

const SingleCondition = (props: {
  conditionOperator?: string;
  updateConditionOperator: (operator: ConditionNameType) => void;
  children: ReactNode;
  choices: ConditionNameMapType[string];
}) => {
  const { children, choices, conditionOperator, updateConditionOperator } =
    props;

  const conditionOperators = Object.entries(choices);

  return (
    <div className={styles.condition}>
      {conditionOperators.map(([key, sentence], idx) => {
        const operatorChoice = key as ConditionNameType;
        return (
          <div key={idx} className={styles.option}>
            <RadioInput
              label={sentence}
              onClick={() => updateConditionOperator(operatorChoice)}
              checked={
                conditionOperator ? conditionOperator === operatorChoice : false
              }
            />
            {conditionOperator && (
              <div className={styles.controls}>
                <div className={styles.input}>
                  {conditionOperator === operatorChoice && children}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
export default SingleCondition;
