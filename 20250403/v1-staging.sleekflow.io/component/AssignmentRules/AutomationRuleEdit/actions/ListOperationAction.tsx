import produce from "immer";
import React, { useContext } from "react";
import { FieldError } from "../../../shared/form/FieldError";
import { Dropdown } from "semantic-ui-react";
import WaitTimeAction, {
  AddWaitActionButton,
  castNumber,
} from "./WaitTimeAction";
import { UserProfileGroupType } from "../../../../container/Contact/Imported/UserProfileGroupType";
import { WaitableActionProps } from "../ActionsForm";
import {
  AddToListAutomationActionType,
  AutomationActionType,
  AutomationActionTypeEnum,
  isAddToListAction,
  isRemoveFromListAction,
  RemoveFromListAutomationActionType,
} from "../../../../types/AutomationActionType";
import { useTranslation } from "react-i18next";
import { DummyField } from "../input/DummyField";
import styles from "./AutomationAction.module.css";
import { ActionFormContext } from "../ActionsForm/ActionFormContext";

interface ListOperationActionProps extends WaitableActionProps {
  operationType: AutomationActionTypeEnum;
  action: AddToListAutomationActionType | RemoveFromListAutomationActionType;
  setAction: (action: AutomationActionType) => void;
  error: string | undefined;
  canAddWaitAction: boolean;
  lists: UserProfileGroupType[];
}

export function ListOperationAction(props: ListOperationActionProps) {
  const {
    action,
    setAction,
    waitActionAdd,
    waitActionChange,
    waitActionRemove,
    canAddWaitAction,
    lists,
  } = props;
  let value: number[] = [];
  let label: string = "";
  const { t } = useTranslation();
  const { readonly } = useContext(ActionFormContext);
  switch (action.automatedTriggerType) {
    case "AddToList":
      value = action.actionAddedToGroupIds;
      label = t("automation.action.addToList.field.list.label");
      break;
    case "RemoveFromList":
      value = action.actionRemoveFromGroupIds;
      label = t("automation.action.removeFromList.field.list.label");
      break;
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
          <DummyField>{label}</DummyField>
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
            options={lists.map((list, k) => {
              return {
                value: list.id,
                text: list.importName,
                key: k,
              };
            })}
            value={value}
            onChange={(_, { value }) => {
              setAction(
                produce(action, (draft) => {
                  if (isAddToListAction(draft)) {
                    draft.actionAddedToGroupIds = (value as string[]).map(
                      castNumber
                    ) as number[];
                  } else if (isRemoveFromListAction(draft)) {
                    draft.actionRemoveFromGroupIds = (value as string[]).map(
                      castNumber
                    ) as number[];
                  }
                })
              );
            }}
          />
        </div>
        {canAddWaitAction && (
          <div className={styles.buttons}>
            <AddWaitActionButton onAddAction={waitActionAdd} />
          </div>
        )}
        <div className={styles.errors}>
          {props.error && <FieldError text={props.error} />}
        </div>
      </div>
    </div>
  );
}
