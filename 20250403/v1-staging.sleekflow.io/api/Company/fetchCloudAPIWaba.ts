import { WhatsAppCloudAPIResponseType } from "../../types/CompanyType";
import { getWithExceptions } from "../apiRequest";

export default function fetchCloudAPIWaba(): Promise<WhatsAppCloudAPIResponseType> {
  return getWithExceptions("/company/whatsapp/cloudapi/by-waba", {
    param: {},
  });
}
