import React, { useContext } from "react";
import { Button, Dropdown, Input } from "semantic-ui-react";
import { FieldError } from "../../../shared/form/FieldError";
import {
  WaitActionType,
  WaitTimeUnitType,
} from "../../../../types/AutomationActionType";
import { useTranslation } from "react-i18next";
import { InfoTooltip } from "../../../shared/popup/InfoTooltip";
import styles from "./WaitTimeAction.module.css";
import { DummyField } from "../input/DummyField";
import { ActionFormContext } from "../ActionsForm/ActionFormContext";

export function castNumber(x: string): number {
  const casted = Number(x);
  return isNaN(casted) || casted < 0 ? 0 : casted;
}

export default function WaitTimeAction(props: {
  action: WaitActionType;
  onChange: (action: WaitActionType) => void;
  onRemove: () => void;
  error: string | undefined;
}) {
  const { t } = useTranslation();
  const { readonly } = useContext(ActionFormContext);

  const unitOptions = [
    {
      text: t("automation.action.wait.field.time.option.days"),
      value: "DAY",
      key: 0,
    },
    {
      text: t("automation.action.wait.field.time.option.hours"),
      value: "HOUR",
      key: 1,
    },
    {
      text: t("automation.action.wait.field.time.option.minutes"),
      value: "MINUTE",
      key: 2,
    },
    {
      text: t("automation.action.wait.field.time.option.seconds"),
      value: "SECOND",
      key: 3,
    },
  ];

  return (
    <div className={`${styles.wait} ${readonly ? styles.readonly : ""}`}>
      <div className={styles.inputs}>
        <div className={styles.cell}>
          <DummyField>
            {t("automation.action.wait.field.time.label")}
          </DummyField>
        </div>
        <div className={styles.cell}>
          <Input
            type={"text"}
            value={props.action.amount ?? ""}
            disabled={readonly}
            onChange={(_, data) => {
              props.onChange({
                units: props.action.units ?? "DAY",
                amount: castNumber(data.value),
              });
            }}
          />
        </div>
        <div className={styles.cell}>
          <div className="ui input">
            <Dropdown
              selection
              fluid
              disabled={readonly}
              onChange={(_, data) => {
                props.onChange({
                  units: data.value as WaitTimeUnitType,
                  amount: props.action.amount,
                });
              }}
              options={unitOptions}
              value={props.action.units ?? "DAY"}
            />
          </div>
        </div>
        {!readonly && (
          <div className={styles.action}>
            <Button
              size={"small"}
              onClick={props.onRemove}
              content={t("automation.action.wait.button.remove")}
              className={styles.remove}
            />
          </div>
        )}
        {props.error && (
          <div className={styles.errors}>
            <div className={styles.errorsWrap}>
              <FieldError text={props.error} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function AddWaitActionButton(props: {
  onAddAction: (action: WaitActionType) => void;
}) {
  const { t } = useTranslation();
  return (
    <InfoTooltip
      placement={"left"}
      children={t("automation.tooltip.form.addWait")}
      trigger={
        <Button
          size={"small"}
          onClick={() => props.onAddAction({ amount: 1, units: "DAY" })}
          content={t("automation.action.wait.button.add")}
        />
      }
    />
  );
}
