import { get } from "../apiRequest";
import { GET_PARTNER_COMMISSION } from "../apiPath";
import { CommissionType } from "../../types/PartnershipType";

export default async function fetchPartnerCommission(): Promise<CommissionType> {
  return await get(GET_PARTNER_COMMISSION, {
    param: {},
  });
}
