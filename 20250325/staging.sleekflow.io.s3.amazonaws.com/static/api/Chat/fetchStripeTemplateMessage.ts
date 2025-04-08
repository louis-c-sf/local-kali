import { getWithExceptions } from "api/apiRequest";
import { StripeMessageTemplateType } from "api/Stripe/fetchStripeMessageTemplate";

export default function fetchStripeTemplateMessage(
  mode: string
): Promise<StripeMessageTemplateType[]> {
  const messageType = {
    payment: "PaymentMessage",
    product: "GeneralProductMessage",
  };
  return getWithExceptions("/SleekPay/message/template", {
    param: {
      messageType: messageType[mode],
    },
  });
}
