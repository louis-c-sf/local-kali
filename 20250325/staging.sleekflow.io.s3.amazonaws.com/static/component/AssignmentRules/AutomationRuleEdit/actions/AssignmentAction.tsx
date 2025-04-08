import AssignmentDropDown from "../../AssignmentDropDown";
import React, { useContext } from "react";
import { FieldError } from "../../../shared/form/FieldError";
import WaitTimeAction, { AddWaitActionButton } from "./WaitTimeAction";
import { WaitableActionProps } from "../ActionsForm";
import {
  AssignmentAutomationActionType,
  AutomationActionType,
} from "../../../../types/AutomationActionType";
import { useTranslation } from "react-i18next";
import { useCompanyStaff } from "../../../../api/User/useCompanyStaff";
import { mergeDeepRight } from "ramda";
import { DummyField } from "../input/DummyField";
import styles from "./AutomationAction.module.css";
import { ActionFormContext } from "../ActionsForm/ActionFormContext";

interface AssignmentActionProps extends WaitableActionProps {
  action: AssignmentAutomationActionType;
  setAction: (action: AutomationActionType) => void;
  error: string | undefined;
  canAddWaitAction: boolean;
}

export function AssignmentAction(props: AssignmentActionProps) {
  const {
    action,
    setAction,
    waitActionAdd,
    waitActionChange,
    waitActionRemove,
    canAddWaitAction,
  } = props;
  const { readonly } = useContext(ActionFormContext);

  const { t } = useTranslation();
  const { booted } = useCompanyStaff();
  // const teams = useAppSelector(s => s.settings.teamsSettings.teams, equals);

  const teamId = action.teamId;
  const initStaff = action.staffId;
  const initAssignmentType = action.assignmentType.toLowerCase();
  return (
    <div
      className={`${styles.action} ${styles.assignment} ${
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
            {t("automation.action.assignment.field.to.label")}
          </DummyField>
        </div>
        <div className={styles.body}>
          <AssignmentDropDown
            updateAssignmentValue={(type, staff, team) => {
              setAction(
                mergeDeepRight(action, {
                  assignmentType: type,
                  staffId: staff,
                  teamId: team,
                })
              );
            }}
            initAssignmentType={initAssignmentType ?? ""}
            initStaff={initStaff}
            initTeam={teamId ?? undefined}
            disabled={!booted || readonly}
          />
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
