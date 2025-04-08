import MessageType from "types/MessageType";
import { WhatsappCloudAPIOrderObject } from "core/models/Message/WhatsappCloudAPIMessageType";
import { Object } from "ts-toolbelt";

export type PayloadDetailOverride = Object.Required<
  MessageType,
  "extendedMessagePayload",
  "deep"
>;

export interface CartMessageType extends MessageType {
  extendedMessagePayload: MessageType["extendedMessagePayload"] & {
    extendedMessagePayloadDetail: PayloadDetailOverride["extendedMessagePayload"]["extendedMessagePayloadDetail"] & {
      whatsappCloudApiOrderObject: WhatsappCloudAPIOrderObject;
    };
  };
}

export function isWhatsappCartMessage(x: MessageType): x is CartMessageType {
  const hasOrderPayload =
    x.extendedMessagePayload?.extendedMessagePayloadDetail
      ?.whatsappCloudApiOrderObject !== undefined &&
    x.extendedMessagePayload?.extendedMessagePayloadDetail
      ?.whatsappCloudApiOrderObject !== null;
  const isCloudApi = x.channel === "whatsappcloudapi";
  return isCloudApi && hasOrderPayload && !x.isSenderStaff;
}
