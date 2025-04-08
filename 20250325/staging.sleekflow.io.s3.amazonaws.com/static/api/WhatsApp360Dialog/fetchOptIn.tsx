import { getWithExceptions } from "api/apiRequest";
import { OptInType } from "features/Whatsapp360/models/OptInType";

export default function fetchOptIn(): Promise<OptInType> {
  return getWithExceptions("/Company/twilio/optin", {
    param: {},
  });
}
