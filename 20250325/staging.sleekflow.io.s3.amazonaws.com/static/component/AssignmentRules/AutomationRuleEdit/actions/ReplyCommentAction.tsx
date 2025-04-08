import React from "react";
import { Checkbox, Image } from "semantic-ui-react";
import produce from "immer";
import { FieldError } from "../../../shared/form/FieldError";
import insertTextAtCursor from "insert-text-at-cursor";
import { AutomationActionType } from "../../../../types/AutomationActionType";
import { AutomationTypeEnum } from "../../../../types/AssignmentRuleType";
import { WaitableActionProps } from "../ActionsForm";
import {
  FacebookReplyCommentActionType,
  FbPostComment,
  InstagramReplyCommentActionType,
  ReplyCommentTextLimit,
} from "../CreateRule/FbIg/PostCommentTypes";
import EmojiButton from "../../../EmojiButton";
import WaitTimeAction, { AddWaitActionButton } from "./WaitTimeAction";
import { InfoTooltipClick } from "../../../shared/popup/InfoTooltipClick";
import InfoIcon from "../../../../assets/images/info_gray.svg";
import styles from "./ReplyCommentAction.module.css";
import { useTranslation } from "react-i18next";

interface ReplyCommentActionProps extends WaitableActionProps {
  setAction: (action: AutomationActionType) => void;
  error: string | undefined;
  canAddWaitAction: boolean;
  index: number;
  action: FacebookReplyCommentActionType | InstagramReplyCommentActionType;
  type: AutomationTypeEnum;
  title: string;
}

const ReplyCommentAction = (props: ReplyCommentActionProps) => {
  const { t } = useTranslation();
  const {
    action,
    type,
    setAction,
    canAddWaitAction,
    waitActionAdd,
    waitActionChange,
    waitActionRemove,
  } = props;
  const textareaId = `automation-replies-text${props.index}`;

  return (
    <div className={`action-field action-send-message ${styles.replyComment}`}>
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
            <InfoTooltipClick
              placement={"right"}
              trigger={<Image src={InfoIcon} size={"mini"} />}
            >
              {t("automation.action.replyComment.hint")}
            </InfoTooltipClick>
          </div>
          <div className="label-section-item">
            {canAddWaitAction && (
              <AddWaitActionButton onAddAction={waitActionAdd} />
            )}
          </div>
        </div>

        <div className={styles.subTitle}>
          {t("automation.action.replyComment.subTitle", { number: 2000 })}
        </div>
        <textarea
          id={textareaId}
          className={"ui input text-content"}
          value={action.fbIgAutoReply.messageContent ?? ""}
          onChange={(ev) => {
            if (ev.target.value.length > ReplyCommentTextLimit) {
              return;
            }
            setAction(
              produce(action, (actionDraft) => {
                actionDraft.fbIgAutoReply.messageContent = ev.target.value;
              })
            );
          }}
          data-gramm_editor="false"
        />
        <div className={"blank text-controls"}>
          <EmojiButton
            handleEmojiInput={(emoji) => {
              let textarea = document.getElementById(
                textareaId
              ) as HTMLTextAreaElement;
              if (textarea) {
                insertTextAtCursor(textarea, emoji);
              }
            }}
          />
        </div>
        {props.error && (
          <FieldError
            text={props.error}
            className={`standalone-error ${styles.errorMessage}`}
          />
        )}

        {type === FbPostComment && (
          <div className={styles.button}>
            <label htmlFor="isLike">
              {t("automation.action.replyComment.likeTheComments")}
            </label>
            <Checkbox
              toggle
              id="isLike"
              checked={action.fbIgAutoReply.likeComment}
              onChange={(e, data) => {
                setAction(
                  produce(action, (actionDraft) => {
                    actionDraft.fbIgAutoReply.likeComment = data.checked;
                  })
                );
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
export default ReplyCommentAction;
