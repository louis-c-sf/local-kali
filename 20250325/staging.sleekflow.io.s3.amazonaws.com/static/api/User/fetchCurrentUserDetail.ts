import { get } from "../apiRequest";
import { GET_COMPANY_STAFF_BY_ID } from "../apiPath";
import { StaffType } from "../../types/StaffType";

export async function fetchCurrentUserDetail(
  userId: string
): Promise<StaffType[]> {
  return await get(GET_COMPANY_STAFF_BY_ID.replace("{staffId}", userId), {
    param: {},
  });
}
