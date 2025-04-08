import {
  ButtonType,
  InteractiveMessageValues,
} from "component/Chat/InteractiveMessage/InteractiveMessageSchema";

import {
  ListMessageObjectType,
  QuickReplyObjectType,
  WhatsappInteractiveObjectType,
} from "types/MessageType";
import { initialInteractiveMessageValues } from "./SendInteractiveMessageForm";

const InteractiveMessageTypeMap = {
  button: ButtonType.QUICK_REPLY,
  list: ButtonType.LIST_MESSAGE,
};

export function denormalizeInteractiveMessageRule(
  interactiveMessage?: WhatsappInteractiveObjectType
): InteractiveMessageValues {
  if (!interactiveMessage) {
    return initialInteractiveMessageValues;
  }
  const quickReplies = (
    interactiveMessage as QuickReplyObjectType
  ).action.buttons?.map((button) => button.reply.title) || [""];

  const listMessageTitle =
    (interactiveMessage as ListMessageObjectType).action?.button || "";

  const parsedListSections = (
    interactiveMessage as ListMessageObjectType
  ).action.sections?.map((section) => ({
    title: section?.title || "",
    options: section.rows.map((row) => ({
      name: row.title,
      description: row?.description || "",
    })),
  }));

  return {
    buttonType: InteractiveMessageTypeMap[interactiveMessage.type],
    quickReplies,
    listMessage: {
      title: listMessageTitle,
      sections: parsedListSections,
    },
  };
}
