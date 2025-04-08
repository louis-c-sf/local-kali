import { getWithExceptions } from "api/apiRequest";
import { SleekPayStatusType } from "core/models/Ecommerce/Payment/SleekPayStatusType";

interface ResponseType extends SleekPayStatusType {}

export async function fetchSleekPayStatus(
  countryCode: string
): Promise<ResponseType> {
  return getWithExceptions("/SleekPay/Status", {
    param: {
      platformCountry: countryCode,
    },
  });
}
