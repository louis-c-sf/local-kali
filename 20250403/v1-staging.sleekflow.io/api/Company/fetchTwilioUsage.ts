import { GET_TWILIO_USAGE } from "../apiPath";
import { getWithExceptions } from "../apiRequest";

export default async function fetchTwilioUsage() {
  return getWithExceptions(GET_TWILIO_USAGE, {
    param: {},
  });
}
