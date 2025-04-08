import React from "react";
import { QuickReplyType } from "../../../types/QuickReplies/QuickReplyType";
import { useTranslation } from "react-i18next";
import { UploadedQuickReplyFileType } from "../../../types/UploadedFileType";
import { useAppDispatch, useAppSelector } from "../../../AppRootContext";
import { StaffType } from "../../../types/StaffType";
import { TextareaNote } from "./TextareaNote";
import { TextareaMessage } from "./TextareaMessage";
import styles from "./SendMessageTextArea.module.css";
import { useSendMessageContext } from "component/Chat/Messenger/SendMessageBox/SendMessageContext";
import { Ref, TextArea } from "semantic-ui-react";
import { DISPLAY_ERROR_LOG_COMPANY_ID } from "App/errorBoundaries/ErrorContent";

export default function SendMessageTextArea(props: {
  handleSubmit: () => void;
  messageType: string;
  messageAssigneeCandidates: StaffType[];
  messageAssignee: StaffType | undefined;
  quickReplyTemplates: QuickReplyType[];
  conversationId: string;
  autoFocus: boolean;
  disabled: boolean;
  onQuickReplyAttach: (
    files: UploadedQuickReplyFileType[],
    templateId: number
  ) => void;
}) {
  const loginDispatch = useAppDispatch();
  const sendMessage = useSendMessageContext();
  const companyId = useAppSelector((s) => s.company?.id ?? "");
  const {
    handleSubmit,
    messageType,
    messageAssigneeCandidates,
    messageAssignee,
    quickReplyTemplates,
    autoFocus,
    disabled,
  } = props;

  const { t } = useTranslation();

  const onChange = (type: string, ...value: string[]) => {
    if (type === "note") {
      sendMessage.setNote(value[0], value[1]);
    } else {
      sendMessage.setReply(value[0]);
    }
  };

  const keydown = (e: React.KeyboardEvent) => {
    if (e.keyCode === 13 && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      handleSubmit();
    }
  };

  const isLegacyIE =
    /(Windows 7|Windows NT 6.1|Chrome\/109.0.0.0)/.test(navigator.userAgent) ||
    DISPLAY_ERROR_LOG_COMPANY_ID.includes(companyId);

  return (
    <div className={styles.container}>
      {isLegacyIE && (
        <div className="textarea">
          <div className="textarea__control">
            <Ref innerRef={sendMessage.setTextInput}>
              <TextArea
                minRows={1}
                className="textarea__input"
                value={sendMessage.messageDraft.markupText}
                onChange={(e, data) => {
                  const value = data.value as string;
                  messageType === "note"
                    ? onChange(messageType, value, value)
                    : onChange(messageType, value);
                }}
                onKeyDown={keydown}
                disabled={disabled}
                placeholder={
                  messageType === "note"
                    ? t("chat.form.send.placeholder.note")
                    : t("chat.form.send.placeholder.message")
                }
              />
            </Ref>
          </div>
        </div>
      )}

      {!isLegacyIE && messageType === "note" && (
        <TextareaNote
          onChangeText={(markText: string, plainText: string) => {
            onChange("note", markText, plainText);
          }}
          textVal={sendMessage.messageDraft.markupText}
          candidates={messageAssignee ? [] : messageAssigneeCandidates}
          candidateSelected={messageAssignee}
          onAdd={(id: string | number, display: string) => {
            const assignee = messageAssigneeCandidates.find(
              (staff) => staff.userInfo.id === String(id)
            );
            if (assignee) {
              loginDispatch({
                type: "INBOX.MESSENGER.UPDATE_MESSAGE_ASSIGNEE",
                assignee,
              });
            }
          }}
          onKeyDown={keydown}
          setMessageAssignee={(assignee) => {
            loginDispatch({
              type: "INBOX.MESSENGER.UPDATE_MESSAGE_ASSIGNEE",
              assignee,
            });
          }}
        />
      )}

      {!isLegacyIE && messageType !== "note" && (
        <TextareaMessage
          autoFocus={autoFocus}
          value={sendMessage.messageDraft.text}
          onChange={(value) => onChange("reply", value)}
          onKeyDown={keydown}
          quickReplyTemplates={quickReplyTemplates}
          onQuickReplyAttach={props.onQuickReplyAttach}
        />
      )}
    </div>
  );
}
