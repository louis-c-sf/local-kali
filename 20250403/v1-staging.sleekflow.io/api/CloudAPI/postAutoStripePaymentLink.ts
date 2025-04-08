import { postWithExceptions } from "../apiRequest";

export type AutoStripePaymentLinkRequestType = {
  wabaId: string;
  wabaPhoneNumberId: string;
  isActive: boolean;
};

export async function postAutoStripePaymentLink(
  param: AutoStripePaymentLinkRequestType
) {
  return postWithExceptions(
    "/company/whatsapp/cloudapi/productcatalog/phone-number/auto-send-payment-url/toggle",
    {
      param,
    }
  );
}
