import React, { useContext } from "react";
import { FieldError } from "../../../shared/form/FieldError";
import { Dropdown, DropdownItemProps, Icon, Label } from "semantic-ui-react";
import WaitTimeAction, { AddWaitActionButton } from "./WaitTimeAction";
import { WaitableActionProps } from "../ActionsForm";
import {
  AddCollaboratorActionType,
  AutomationActionType,
} from "../../../../types/AutomationActionType";
import { useTranslation } from "react-i18next";
import { staffDisplayName } from "../../../Chat/utils/staffDisplayName";
import { getStaffId } from "../../../../types/TeamType";
import { StaffAvatar } from "../../../shared/Avatar/StaffAvatar";
import { useAppSelector } from "../../../../AppRootContext";
import { DummyField } from "../input/DummyField";
import styles from "./AutomationAction.module.css";
import { ActionFormContext } from "../ActionsForm/ActionFormContext";

interface AddCollaboratorsActionProps extends WaitableActionProps {
  action: AddCollaboratorActionType;
  setAction: (action: AutomationActionType) => void;
  error: string | undefined;
  canAddWaitAction: boolean;
}

export function AddCollaboratorAction(props: AddCollaboratorsActionProps) {
  const {
    action,
    setAction,
    waitActionAdd,
    waitActionChange,
    waitActionRemove,
    canAddWaitAction,
  } = props;
  const staffList = useAppSelector((s) => s.staffList);
  const { t } = useTranslation();
  const { readonly } = useContext(ActionFormContext);

  const staffOptions = staffList.map<DropdownItemProps>((staff) => ({
    value: getStaffId(staff),
    text: staffDisplayName(staff),
    content: (
      <div className={"staff"}>
        <span className={"pic"}>
          <StaffAvatar staff={staff} size={"21px"} />
        </span>
        <span className="name">{staffDisplayName(staff)}</span>
      </div>
    ),
    key: getStaffId(staff),
  }));

  function setCollaborators(value: string[]) {
    setAction({
      ...action,
      addAdditionalAssigneeIds: value,
    });
  }

  return (
    <div className={`${styles.action} ${readonly ? styles.readonly : ""}`}>
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
            {t("automation.action.addCollaborator.field.list.label")}
          </DummyField>
        </div>
        <div className={styles.body}>
          <Dropdown
            search
            multiple
            selection
            fluid
            disabled={readonly}
            icon={"search"}
            className={"icon-left"}
            noResultsMessage={t("form.field.dropdown.noResults")}
            options={staffOptions}
            value={action.addAdditionalAssigneeIds}
            renderLabel={(item) => (
              <Label>
                {item.content}
                <Icon
                  name={"close"}
                  onClick={() => {
                    setCollaborators(
                      action.addAdditionalAssigneeIds.filter(
                        (id) => id !== item.value
                      )
                    );
                  }}
                />
              </Label>
            )}
            onChange={(_, { value }) => {
              setCollaborators(value as string[]);
            }}
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
