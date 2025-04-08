import React from "react";
import produce from "immer";
import { useTranslation } from "react-i18next";
import { WaitableActionProps } from "../../ActionsForm";
import { AutomationActionType } from "../../../../../types/AutomationActionType";
import {
  FacebookInitiateDmActionType,
  InstagramInitiateDmActionType,
  MessageFormatEnum,
  MessageFormatType,
} from "../../CreateRule/FbIg/PostCommentTypes";
import { Dropdown, DropdownProps } from "semantic-ui-react";
import WaitTimeAction, { AddWaitActionButton } from "../WaitTimeAction";
import { FieldError } from "../../../../shared/form/FieldError";
import TextMessage from "./TextMessage";
import styles from "./SendDirectMessage.module.css";
import MediaMessage from "./MediaMessage";

interface SendDirectMessageProps extends WaitableActionProps {
  setAction: (action: AutomationActionType) => void;
  error: string | undefined;
  canAddWaitAction: boolean;
  index: number;
  action: FacebookInitiateDmActionType | InstagramInitiateDmActionType;
  title: string;
  assignmentId: string | undefined;
}

const SendDirectMessage = (props: SendDirectMessageProps) => {
  const { t } = useTranslation();
  const {
    action,
    setAction,
    canAddWaitAction,
    waitActionAdd,
    waitActionChange,
    waitActionRemove,
    index,
    assignmentId,
  } = props;
  const messageTypeOptions = [
    {
      text: t("automation.action.initiateDm.options.text"),
      value: MessageFormatEnum.Text,
      key: 0,
    },
    {
      text: t("automation.action.initiateDm.options.media"),
      value: MessageFormatEnum.Attachment,
      key: 1,
    },
  ];

  return (
    <div className={`action-field ${styles.sendDirectMessage}`}>
      {action.actionWaitDenormalized && (
        <WaitTimeAction
          action={action.actionWaitDenormalized}
          onChange={(action) => {
            waitActionChange(action);
          }}
          onRemove={waitActionRemove}
          error={props.waitError}
        />
      )}
      <div className="control-text">
        <div className={styles.labelSection}>
          <div className={styles.title}>
            <label>{props.title}</label>
            <Dropdown
              lazyLoad
              upward={false}
              floating
              value={action.fbIgAutoReply.messageFormat}
              options={messageTypeOptions}
              onChange={(e: React.SyntheticEvent, data: DropdownProps) => {
                e.preventDefault();
                e.stopPropagation();
                const { value } = data;
                setAction(
                  produce(action, (actionDraft) => {
                    actionDraft.fbIgAutoReply.messageFormat =
                      value as MessageFormatType;
                    if (value === MessageFormatEnum.Attachment) {
                      delete actionDraft.fbIgAutoReply.messageContent;
                    }
                  })
                );
              }}
            />
          </div>
          <div className="label-section-item">
            {canAddWaitAction && (
              <AddWaitActionButton onAddAction={waitActionAdd} />
            )}
          </div>
        </div>
        {action.fbIgAutoReply.messageFormat === MessageFormatEnum.Text ? (
          <TextMessage index={index} action={action} setAction={setAction} />
        ) : (
          <MediaMessage
            action={action}
            setAction={setAction}
            assignmentId={assignmentId}
          />
        )}
        {props.error && (
          <FieldError
            text={props.error}
            className={`standalone-error ${styles.errorMessage}`}
          />
        )}
      </div>
    </div>
  );
};
export default SendDirectMessage;
