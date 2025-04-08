import { getWithExceptions } from "api/apiRequest";
import { FacebookTokenWabaResponseType } from "./submitFacebookAccessToken";

export async function fetchFacebookPhoneNumber(): Promise<FacebookTokenWabaResponseType> {
  return await getWithExceptions("/company/whatsapp/cloudapi/waba", {
    param: {},
  });
}
