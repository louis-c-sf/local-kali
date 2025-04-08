import { post } from "api/apiRequest";
import { POST_STRIPE_PAYMENT_LINK } from "api/apiPath";

export default async function postStripePaymentLink(formData: FormData) {
  return post(POST_STRIPE_PAYMENT_LINK, {
    param: formData,
    header: { "Content-Type": "application/x-www-form-urlencoded" },
  });
}
