import React from "react";
import { useTranslation } from "react-i18next";
import { PreviewContent } from "component/shared/PreviewContent";
import PreviewListContent from "component/shared/PreviewListContent";
import {
  ButtonType,
  InteractiveMessageValues,
} from "component/Chat/InteractiveMessage/InteractiveMessageSchema";
import { WhatsappTemplateComponentButtonType } from "types/WhatsappTemplateResponseType";

export default function InteractiveMessagePreviewContent({
  draftText,
  formValues,
}: {
  draftText: string;
  formValues?: InteractiveMessageValues;
}) {
  const { t } = useTranslation();

  if (!formValues) {
    return null;
  }

  const isQuickReply = formValues?.buttonType === ButtonType.QUICK_REPLY;
  const isListMessage = formValues?.buttonType === ButtonType.LIST_MESSAGE;

  let buttons: WhatsappTemplateComponentButtonType[] = [];

  if (isQuickReply) {
    buttons =
      formValues?.quickReplies?.map((reply) => ({
        text: reply,
        type: "button",
      })) || [];
  }

  const messageContent = draftText
    ? draftText.length > 150
      ? draftText.substring(0, 150).concat("...")
      : draftText
    : "";

  return (
    <div>
      {isQuickReply && (
        <PreviewContent value={messageContent} buttons={buttons} />
      )}
      {isListMessage && (
        <PreviewListContent
          value={messageContent}
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
