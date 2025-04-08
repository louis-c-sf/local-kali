import produce from "immer";
import React, { useContext } from "react";
import { VariablesSelection } from "../../../Broadcast/VariablesSelection";
import { FieldError } from "../../../shared/form/FieldError";
import EmojiButton from "../../../EmojiButton";
import insertTextAtCursor from "insert-text-at-cursor";
import WaitTimeAction, { AddWaitActionButton } from "./WaitTimeAction";
import { WaitableActionProps } from "../ActionsForm";
import {
  AddConversationNoteAutomationActionType,
  AutomationActionType,
  isSendMessageAction,
  SendMessageAutomationActionType,
} from "../../../../types/AutomationActionType";
import { TargetChannelDropdown } from "../input/TargetChannelDropdown";
import { useTranslation } from "react-i18next";
import { InfoTooltip } from "../../../shared/popup/InfoTooltip";
import { useFeaturesGuard } from "../../../Settings/hooks/useFeaturesGuard";
import SendWhatsApp360DialogMessage from "./SendWhatsApp360DialogMessage/SendWhatsApp360DialogMessage";
import actionStyles from "./AutomationAction.module.css";
import styles from "./SendMessageAction.module.css";
import { ActionFormContext } from "../ActionsForm/ActionFormContext";
import { ChannelLabel } from "../../../Broadcast/ConfirmSend/ChannelLabel";
import { equals } from "ramda";

export interface SendMessageActionProps extends WaitableActionProps {
  action:
    | SendMessageAutomationActionType
    | AddConversationNoteAutomationActionType;
  setAction: (action: AutomationActionType) => void;
  getActionError: () => string | undefined;
  error: string | undefined;
  canAddWaitAction: boolean;
  canSendInteractiveMessage: boolean;
  title: string;
}

export function SendMessageAction(props: SendMessageActionProps) {
  const {
    action,
    setAction,
    canAddWaitAction,
    waitActionAdd,
    waitActionChange,
    waitActionRemove,
  } = props;
  const { t } = useTranslation();
  const { readonly } = useContext(ActionFormContext);
  const textareaId = `automation-sendmessage-text${props.action.componentId}`;
  const sendMessageAction = isSendMessageAction(action) ? action : undefined;
  const featureGuard = useFeaturesGuard();
  if (
    sendMessageAction &&
    featureGuard.isAbleToShow360DialogChannel(
      sendMessageAction.targetedChannelWithIds
    )
  ) {
    return (
      <SendWhatsApp360DialogMessage
        {...props}
        action={action as SendMessageAutomationActionType}
      />
    );
  }

  const [channel] = sendMessageAction?.targetedChannelWithIds ?? [];

  return (
    <div
      className={`
      action-field action-send-message ${styles.root} ${actionStyles.action}
       ${readonly ? actionStyles.readonly : ""}
       ${readonly ? styles.readonly : ""}
      `}
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
        <div className={styles.labelSection}>
          <div className={styles.item}>
            <label>{props.title}</label>
          </div>
          {readonly && channel && (
            <div className={styles.channelsList}>
              <ChannelLabel channel={channel} />
            </div>
          )}
          {!readonly && (
            <div className={styles.item}>
              {canAddWaitAction && (
                <AddWaitActionButton onAddAction={waitActionAdd} />
              )}
            </div>
          )}
          {!readonly && isSendMessageAction(action) && (
            <div className={`${styles.item} ${styles.fluid}`}>
              <div className="ui input fluid">
                <InfoTooltip
                  placement={"right"}
                  children={t("automation.tooltip.form.sendMessageChannel")}
                  trigger={
                    <TargetChannelDropdown
                      setAction={setAction}
                      action={action}
                    />
                  }
                />
              </div>
            </div>
          )}
        </div>
        <div className={styles.controlText}>
          <textarea
            id={textareaId}
            className={`ui input ${styles.textContent}`}
            value={action.messageContent ?? ""}
            disabled={readonly}
            onChange={(ev) => {
              setAction(
                produce(action, (actionDraft) => {
                  actionDraft.messageContent = ev.target.value;
                })
              );
            }}
          />
          {!readonly && (
            <div className={styles.textControls}>
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
          )}
        </div>
        {!readonly && (
          <>
            <div className={styles.variablesHead}>
              <label>
                {t("automation.action.sendMessage.field.variables.label")}
              </label>
            </div>
            <div className={styles.controlVariables}>
              <VariablesSelection
                isSearchable={false}
                bordered
                hideHeader
                compactItems
                restrictHeight={245}
                updateText={(text) => {
                  setAction(
                    produce(action, (actionDraft) => {
                      actionDraft.messageContent = text;
                    })
                  );
                }}
                textareaId={textareaId}
              />
            </div>
          </>
        )}
      </div>
      {props.error && <FieldError text={props.error} standalone />}
    </div>
  );
}

export const SendMessageActionMemo = React.memo(
  SendMessageAction,
  (prevProps, nextProps) => {
    return equals(prevProps, nextProps);
  }
);
