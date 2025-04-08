import React from "react";
import { QuickReplyType } from "../../../types/QuickReplies/QuickReplyType";
import { UploadedQuickReplyFileType } from "../../../types/UploadedFileType";
import moment from "moment";
import { Button } from "../../shared/Button/Button";
import { DropzoneInputProps } from "react-dropzone";
import { useTranslation } from "react-i18next";
import { StaffType } from "../../../types/StaffType";
import { TypeStatusEnum } from "../../../types/LoginType";
import styles from "./SendMessageTools.module.css";
import { EditorTools } from "./EditorTools";
import { Ref } from "semantic-ui-react";
import ChatChannelDropdown from "../ChatChannelDropdown";
import { useAppSelector } from "../../../AppRootContext";
import { DropdownSelectionOptionType } from "../ChannelFilterDropdown";

export function SendMessageTools(props: {
  onFileAttach: (event: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputProps: (props?: DropzoneInputProps) => DropzoneInputProps;
  messageMode: TypeStatusEnum;
  quickReplyTemplates: QuickReplyType[];
  setAttachments: (
    files: UploadedQuickReplyFileType[],
    templateId: number
  ) => void;
  channelAllowedToSendVoice: boolean;
  onAudioRecord: () => void;
  onAudioRecorded: (
    data: Blob,
    mimeType: string,
    duration: moment.Duration
  ) => void;
  messageAssignee: StaffType | undefined;
  setMessageAssignee: (assignee: StaffType | undefined) => void;
  onSend: () => void;
  sendDisabled: boolean;
  disableAll: boolean;
  textOnly: boolean;
  sendOnly: boolean;
  setButtonNode: (node: HTMLElement | null) => void;
  lastVarInputId?: string;
  canSendInteractiveMessage: boolean;
  selectedChannelItem: DropdownSelectionOptionType | undefined;
  setSelectedChannelItem: (
    channel: DropdownSelectionOptionType | undefined
  ) => void;
}) {
  const {
    setAttachments,
    channelAllowedToSendVoice,
    disableAll,
    fileInputProps,
    messageAssignee,
    messageMode,
    onAudioRecord,
    onAudioRecorded,
    onFileAttach,
    onSend,
    quickReplyTemplates,
    sendDisabled,
    setMessageAssignee,
    textOnly,
    sendOnly,
    lastVarInputId,
    setButtonNode,
    canSendInteractiveMessage,
    selectedChannelItem,
    setSelectedChannelItem,
  } = props;
  const isNote = useAppSelector((s) => s.inbox.messenger.mode === "note");
  const hasInteractiveMessage = useAppSelector((s) =>
    Boolean(s.inbox.messenger.interactiveMessage)
  );

  const { t } = useTranslation();

  function getModeStyles(mode: TypeStatusEnum) {
    const map: Partial<Record<TypeStatusEnum, string>> = {
      note: styles.note,
      reply: styles.reply,
    };
    const classes = [map[mode] ?? ""];
    if (sendOnly) {
      classes.push(styles.sendOnly);
    }
    return classes.join(" ");
  }

  const labelMap: Record<TypeStatusEnum, string> = {
    note: t("chat.buttons.addNote"),
    reply: t("chat.buttons.send"),
    schedule: t("chat.buttons.schedule"),
  };

  const buttonLabel = labelMap[messageMode];

  return (
    <div className={`${styles.tools} ${getModeStyles(messageMode)}`}>
      {!props.sendOnly && (
        <EditorTools
          textOnly={textOnly}
          onChange={onFileAttach}
          fileInputProps={fileInputProps}
          messageMode={messageMode}
          quickReplyTemplates={quickReplyTemplates}
          setAttachments={setAttachments}
          channelAllowedToSendVoice={channelAllowedToSendVoice}
          onAudioRecord={onAudioRecord}
          onAudioRecorded={onAudioRecorded}
          messageAssignee={messageAssignee}
          messageAssignee1={setMessageAssignee}
          lastVarInputId={lastVarInputId}
          hasInteractiveMessage={hasInteractiveMessage}
          canSendInteractiveMessage={canSendInteractiveMessage}
        />
      )}
      {!isNote && (
        <div className={styles.channelSelector}>
          <span className={styles.label}>{t("chat.send.sendAs")}</span>
          <ChatChannelDropdown
            selectedChannelItem={selectedChannelItem}
            setSelectedChannelItem={setSelectedChannelItem}
          />
        </div>
      )}
      <Ref innerRef={setButtonNode}>
        <Button
          primary
          onClick={onSend}
          className={styles.send}
          disabled={sendDisabled || disableAll}
          content={buttonLabel}
        />
      </Ref>
    </div>
  );
}
