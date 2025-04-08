import { getWithExceptions } from "../../apiRequest";
import { GET_SLEEKPAY_MESSAGE_TEMPLATE } from "../../apiPath";

type MessageTemplateResponseType = {
  messageType: string;
  messageBody: string;
  params: string[];
  createdAt: string;
  updatedAt: string;
  id: number;
};

export async function fetchMessageTemplate(): Promise<
  [MessageTemplateResponseType]
> {
  return await getWithExceptions(GET_SLEEKPAY_MESSAGE_TEMPLATE, {
    param: { messageType: "PaymentMessage" },
  });
}
