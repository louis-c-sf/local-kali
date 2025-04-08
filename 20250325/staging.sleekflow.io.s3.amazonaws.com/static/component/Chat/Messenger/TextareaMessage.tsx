import React, { useEffect, useState, useContext, useRef } from "react";
import { Mention, MentionsInput } from "react-mentions";
import { is } from "ramda";
import { Header, Icon, Ref } from "semantic-ui-react";
import { QuickReplyType } from "../../../types/QuickReplies/QuickReplyType";
import { useTranslation } from "react-i18next";
import { UploadedQuickReplyFileType } from "../../../types/UploadedFileType";
import { useSendMessageContext } from "component/Chat/Messenger/SendMessageBox/SendMessageContext";

interface TextareaMessageProps {
  autoFocus: boolean;
  value: string;
  onChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  quickReplyTemplates: QuickReplyType[];
  onQuickReplyAttach: (
    files: UploadedQuickReplyFileType[],
    quickReplyId: number
  ) => void;
}

export function TextareaMessage(props: TextareaMessageProps) {
  const {
    onKeyDown,
    onChange,
    autoFocus,
    value,
    quickReplyTemplates,
    onQuickReplyAttach,
  } = props;
  const [templateInserted, setTemplateInserted] = useState(false);
  const { t } = useTranslation();
  const sendMessage = useSendMessageContext();

  const inputRefInner = useRef<HTMLTextAreaElement | null>(null);
  inputRefInner.current = sendMessage.textInput;

  useEffect(() => {
    if (templateInserted) {
      setTemplateInserted(false);
      if (sendMessage.textInput) {
        const textarea = sendMessage.textInput;
        textarea.selectionStart = textarea.textLength;
        textarea.selectionEnd = textarea.textLength;
      }
    }
  }, [templateInserted]);

  return (
    <Ref innerRef={catchTextarea(sendMessage.setTextInput)}>
      <MentionsInput
        inputRef={inputRefInner}
        value={value}
        allowSuggestionsAboveCursor={true}
        suggestionsPortalHost={sendMessage.chatContentNode ?? undefined}
        placeholder={t("chat.form.send.placeholder.message")}
        className="textarea"
        autoFocus={autoFocus}
        data-catch_typing="true"
        onChange={(e) => onChange(e.target.value)}
        allowSpaceInQuery={true}
        onKeyDown={onKeyDown}
        rows={1}
      >
        <Mention
          trigger={"/"}
          className="no-scrollbars"
          data={quickReplyTemplates.map((template) => ({
            display: template.name,
            id: template.id as number,
          }))}
          onAdd={(id, display) => {
            const template = quickReplyTemplates.find((tpl) => tpl.id === id);
            onChange(template?.text || "");
            const files = template?.files ?? [];
            if (files.length > 0 && template?.id) {
              onQuickReplyAttach(files, template.id);
            }
            setTemplateInserted(true);
          }}
          renderSuggestion={(suggestion) => {
            const template = quickReplyTemplates.find(
              (tpl) => tpl.id === suggestion.id
            );
            const files = template?.files ?? [];
            return (
              <div className={"template-suggestion"}>
                <Header as={"h6"}>
                  {suggestion.display}{" "}
                  {files.length > 0 && (
                    <Icon className={"attachment-trigger"} size={"small"} />
                  )}
                </Header>
                <p>{template?.text}</p>
              </div>
            );
          }}
        />
      </MentionsInput>
    </Ref>
  );
}

export const catchTextarea =
  (setTextInput: (input: HTMLTextAreaElement | null) => void) =>
  (parent: any) => {
    if (parent === null) {
      setTextInput(null);
      return;
    }
    const textarea =
      parent.inputElement ?? parent.querySelector("textarea.textarea__input");
    setTextInput(textarea ?? null);
  };
