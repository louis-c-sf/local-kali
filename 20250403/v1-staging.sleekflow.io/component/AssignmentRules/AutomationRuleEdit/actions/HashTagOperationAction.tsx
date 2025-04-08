import produce from "immer";
import React, { useContext } from "react";
import { FieldError } from "../../../shared/form/FieldError";
import { Dropdown } from "semantic-ui-react";
import WaitTimeAction, { AddWaitActionButton } from "./WaitTimeAction";
import { WaitableActionProps } from "../ActionsForm";
import {
  ActionHashTag,
  AddHashtagsAutomationActionType,
  AutomationActionType,
  AutomationActionTypeEnum,
  RemoveHashtagsAutomationActionType,
} from "../../../../types/AutomationActionType";
import { objOf, prop } from "ramda";
import { HashTagType } from "../../../../types/ConversationType";
import { ChatLabel } from "../../../Chat/ChatLabel";
import { useTranslation } from "react-i18next";
import { DummyField } from "../input/DummyField";
import styles from "./AutomationAction.module.css";
import { ActionFormContext } from "../ActionsForm/ActionFormContext";

interface HashTagOperationActionProps extends WaitableActionProps {
  operationType: AutomationActionTypeEnum;
  action: AddHashtagsAutomationActionType | RemoveHashtagsAutomationActionType;
  setAction: (action: AutomationActionType) => void;
  error: string | undefined;
  canAddWaitAction: boolean;
  hashtags: HashTagType[];
}

export function HashTagOperationAction(props: HashTagOperationActionProps) {
  const {
    action,
    setAction,
    waitActionAdd,
    waitActionChange,
    waitActionRemove,
    canAddWaitAction,
    hashtags,
  } = props;
  const { t } = useTranslation();
  const { readonly } = useContext(ActionFormContext);

  let value: ActionHashTag[] = [];
  let label: string = "";

  switch (action.automatedTriggerType) {
    case "AddTags":
      value = action.actionAddConversationHashtags;
      label = t("automation.action.addLabels.field.label.label");
      break;
    case "RemoveTags":
      value = action.actionAddConversationHashtags;
      label = t("automation.action.removeLabels.field.label.label");
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
            fluid
            scrolling
            multiple
            search
            disabled={readonly}
            icon={"search"}
            className={"icon-left hashtag-dropdown"}
            value={value.map(prop("hashtag"))}
            noResultsMessage={t("form.field.dropdown.noResults")}
            options={hashtags.map((tag, k) => {
              return {
                value: tag.hashtag,
                text: tag.hashtag,
                key: k,
                content: <ChatLabel tag={tag} collapsible={false} />,
              };
            })}
            onChange={(event, { value }) => {
              setAction(
                produce(action, (draft) => {
                  draft.actionAddConversationHashtags = (value as string[]).map(
                    objOf("hashtag")
                  );
                })
              );
            }}
            renderLabel={(item) => {
              const tag = hashtags.find((t) => t.hashtag === item.value);
              if (!tag) {
                return null;
              }
              return (
                <ChatLabel
                  tag={tag}
                  collapsible={false}
                  onDismiss={() => {
                    const updatedValue = value.filter(
                      (v) => v.hashtag !== tag.hashtag
                    );

                    setAction(
                      produce(action, (draft) => {
                        draft.actionAddConversationHashtags = updatedValue;
                      })
                    );
                  }}
                />
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
