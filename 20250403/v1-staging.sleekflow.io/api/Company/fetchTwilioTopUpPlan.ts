import { GET_TWILIO_TOPUP_CREDIT_PLANS } from "../apiPath";
import { getWithExceptions } from "../apiRequest";

export default async function fetchTwilioTopUpPlan() {
  return getWithExceptions(GET_TWILIO_TOPUP_CREDIT_PLANS, { param: {} });
}
