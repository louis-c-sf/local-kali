import MessageType from "../../../../types/MessageType";

export function isPaymentMessage(message: MessageType) {
  return (
    message.deliveryType === "PaymentLink" &&
    Boolean(message.sleekPayRecord ?? message.sleekPayRecordProxy)
  );
}
