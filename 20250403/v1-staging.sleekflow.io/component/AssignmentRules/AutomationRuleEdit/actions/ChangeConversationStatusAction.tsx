import React, { useContext } from "react";
import { Dropdown } from "semantic-ui-react";
import { FieldError } from "../../../shared/form/FieldError";
import WaitTimeAction, { AddWaitActionButton } from "./WaitTimeAction";
import { WaitableActionProps } from "../ActionsForm";
import {
  AutomationActionType,
  ChangeConversationStatusAutomationActionType,
  SnoozeTimeType,
} from "../../../../types/AutomationActionType";
import { ConversationStatusType } from "../../../../types/LoginType";
import produce from "immer";
import { useTranslation } from "react-i18next";
import { DummyField } from "../input/DummyField";
import styles from "./AutomationAction.module.css";
import { ActionFormContext } from "../ActionsForm/ActionFormContext";

interface ChangeConversationStatusActionProps extends WaitableActionProps {
  action: ChangeConversationStatusAutomationActionType;
  setAction: (action: AutomationActionType) => void;
  error: string | undefined;
  canAddWaitAction: boolean;
}

function ChangeConversationStatusAction(
  props: ChangeConversationStatusActionProps
) {
  const { action, setAction, canAddWaitAction } = props;
  const { waitActionRemove, waitActionAdd, waitActionChange } = props;
  const { t } = useTranslation();
  const { readonly } = useContext(ActionFormContext);

  const STATUS_CHOICES: Array<[ConversationStatusType, string]> = [
    ["open", t("automation.action.changeConversationStatus.status.open")],
    ["pending", t("automation.action.changeConversationStatus.status.snooze")],
    ["closed", t("automation.action.changeConversationStatus.status.closed")],
  ];
  const SNOOZE_CHOICES: Array<[SnoozeTimeType, string]> = [
    [
      "OneHour",
      t("automation.action.changeConversationStatus.snooze.choice.hour"),
    ],
    [
      "ThreeHour",
      t("automation.action.changeConversationStatus.snooze.choice.3hours"),
    ],
    [
      "OneDay",
      t("automation.action.changeConversationStatus.snooze.choice.day"),
    ],
    [
      "OneMonth",
      t("automation.action.changeConversationStatus.snooze.choice.month"),
    ],
    [
      "OneWeek",
      t("automation.action.changeConversationStatus.snooze.choice.week"),
    ],
  ];

  return (
    <div
      className={`${styles.action} ${styles.shortFields} ${
        readonly ? styles.readonly : ""
      }`}
    >
      {action.actionWaitDenormalized && (
        <WaitTimeAction
          action={action.actionWaitDenormalized}
          onChange={waitActionChange}
          onRemove={waitActionRemove}
          error={props.waitError}
        />
      )}
      <div className={styles.controls}>
        <div className={styles.head}>
          <DummyField>
            {t("automation.action.changeConversationStatus.field.status.label")}
          </DummyField>
        </div>
        <div className={styles.inputPrimary}>
          <div className="ui input fluid">
            <Dropdown
              selection
              fluid
              disabled={readonly}
              options={STATUS_CHOICES.map(([value, text], key) => ({
                value,
                text,
                key,
              }))}
              value={action.changeConversationStatus.status}
              onChange={(_, data) => {
                setAction(
                  produce(action, (draft) => {
                    draft.changeConversationStatus.status =
                      data.value as ConversationStatusType;
                  })
                );
              }}
            />
          </div>
        </div>
        <div className={styles.inputSecondary}>
          {action.changeConversationStatus.status === "pending" && (
            <div className="ui input fluid">
              <Dropdown
                selection
                fluid
                disabled={readonly}
                options={SNOOZE_CHOICES.map(([value, text], key) => ({
                  value,
                  text,
                  key,
                }))}
                value={action.snoozeOptions ?? SNOOZE_CHOICES[0][0]}
                onChange={(_, data) => {
                  setAction(
                    produce(action, (draft) => {
                      draft.snoozeOptions = data.value as SnoozeTimeType;
                    })
                  );
                }}
              />
            </div>
          )}
        </div>
        <div className={styles.buttons}>
          {canAddWaitAction && (
            <AddWaitActionButton onAddAction={waitActionAdd} />
          )}
        </div>
        <div className={styles.errors}>
          {props.error && <FieldError text={props.error} />}
        </div>
      </div>
    </div>
  );
}

export default ChangeConversationStatusAction;
