import { get } from "../apiRequest";
import { GET_PARTNER_STATUS } from "../apiPath";
import { PartnerStatusType } from "../../types/PartnershipType";

export default async function fetchPartnerStatus(): Promise<PartnerStatusType> {
  return await get(GET_PARTNER_STATUS, {
    param: {},
  });
}
