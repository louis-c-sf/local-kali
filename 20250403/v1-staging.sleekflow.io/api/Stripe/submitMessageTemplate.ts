import { StripeMessageTemplateType } from "api/Stripe/fetchStripeMessageTemplate";
import { postWithExceptions } from "api/apiRequest";

export async function submitMessageTemplate(
  messages: StripeMessageTemplateType[]
) {
  //todo add country code once implemented on BE
  // const query = `?platformCountry=${countryCode}`;
  return await postWithExceptions(`/SleekPay/message/template`, {
    param: messages,
  });
}
