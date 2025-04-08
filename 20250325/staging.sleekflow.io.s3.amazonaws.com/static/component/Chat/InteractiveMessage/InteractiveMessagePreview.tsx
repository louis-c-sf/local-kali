import { useAppSelector } from "AppRootContext";
import { PreviewContent } from "component/shared/PreviewContent";
import PreviewListContent from "component/shared/PreviewListContent";
import React from "react";
import { useTranslation } from "react-i18next";
import { WhatsappTemplateComponentButtonType } from "types/WhatsappTemplateResponseType";
import {
  ButtonType,
  InteractiveMessageValues,
} from "./InteractiveMessageSchema";

export default function InteractiveMessagePreview({
  formValues,
}: {
  formValues: InteractiveMessageValues;
}) {
  const { t } = useTranslation();
  const messageDraft = useAppSelector((s) => {
    return s.inbox.messageDrafts.find(
      (d) => d.conversationId === s.profile.conversationId
    )?.text;
  });
  // For preview purpose, concat with ellipse to avoid showing long messages which distorts the preview image
  const draftText = messageDraft
    ? messageDraft.length > 150
      ? messageDraft.substring(0, 150).concat("...")
      : messageDraft
    : "";

  const isQuickReply = formValues.buttonType === ButtonType.QUICK_REPLY;
  const isListMessage = formValues.buttonType === ButtonType.LIST_MESSAGE;

  let buttons: WhatsappTemplateComponentButtonType[] = [];

  if (isQuickReply) {
    buttons =
      formValues?.quickReplies?.map((reply) => ({
        text: reply,
        type: "button",
      })) || [];
  }

  return (
    <div style={{ position: "sticky", top: 0, overflowY: "auto" }}>
      {isQuickReply && <PreviewContent value={draftText} buttons={buttons} />}
      {isListMessage && (
        <PreviewListContent
          value={draftText}
          buttonText={
            formValues.listMessage?.title ||
            t("form.interactiveMessage.field.listMessage.listTitle.label")
          }
          sections={formValues.listMessage?.sections || []}
        />
      )}
    </div>
  );
}
