import { getWithExceptions } from "api/apiRequest";
import moment from "moment";
import { SleekPayVolumeType } from "core/models/Ecommerce/Payment/SleekPayVolumeType";

interface ResponseType extends SleekPayVolumeType {}

export async function fetchSleekPayVolume(
  countryCode: string
): Promise<ResponseType> {
  // Dev note: pass params in when we need more period display options
  const now = moment.utc();
  const oneWeekBefore = moment.utc().subtract(1, "week");
  return getWithExceptions("/SleekPay/volume", {
    param: {
      volumeFrom: oneWeekBefore.toISOString(),
      volumeTo: now.toISOString(),
      platformCountry: countryCode,
    },
  });
}
