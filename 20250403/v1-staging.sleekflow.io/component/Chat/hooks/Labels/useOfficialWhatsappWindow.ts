import MessageType from "../../../../types/MessageType";
import moment from "moment";
import { useCallback } from "react";

export function useOfficialWhatsappWindow(props: { selectedChannel?: string }) {
  const daysWindowSize =
    props.selectedChannel === "facebook"
      ? 7
      : props.selectedChannel === "wechat"
      ? 2
      : 1;

  const getConversationOfficialWindow = useCallback(
    (lastMessageFromCustomer: MessageType | undefined) => {
      if (!lastMessageFromCustomer) {
        return [undefined, undefined];
      }
      const messageCreatedAt = moment.utc(lastMessageFromCustomer.createdAt);
      const messageLatestDateAllowed = moment
        .utc(lastMessageFromCustomer.createdAt)
        .add(daysWindowSize, "d");
      if (messageCreatedAt.isValid() && messageLatestDateAllowed.isValid()) {
        return [messageCreatedAt, messageLatestDateAllowed];
      }
      return [undefined, undefined];
    },
    [daysWindowSize]
  );

  const getIsConversationWithinOfficialWindow = useCallback(
    (lastMessageFromCustomer: MessageType) => {
      const [messageCreatedAt, messageLatestDateAllowed] =
        getConversationOfficialWindow(lastMessageFromCustomer);
      return moment.utc().isBetween(messageCreatedAt, messageLatestDateAllowed);
    },
    [daysWindowSize, getConversationOfficialWindow]
  );

  return {
    getConversationOfficialWindow,
    getIsConversationWithinOfficialWindow,
  };
}
