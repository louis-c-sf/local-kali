import { getWithExceptions } from "api/apiRequest";

export enum MessageTypeEnum {
  payment = "PaymentMessage",
  product = "GeneralProductMessage",
}

export interface StripeMessageTemplateType {
  messageType: MessageTypeEnum.payment | MessageTypeEnum.product;
  messageBody: string;
  params: string[];
  createdAt: string;
  updatedAt: string;
  id?: number;
}

export const fetchStripeMessageTemplate = async (
  countryCode: string
): Promise<StripeMessageTemplateType[]> => {
  return await getWithExceptions("/SleekPay/message/template", {
    param: {
      platformCountry: countryCode,
    },
  });
};
