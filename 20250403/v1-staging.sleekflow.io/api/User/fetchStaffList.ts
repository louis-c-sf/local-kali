import React from "react";
import { Action } from "../../types/LoginType";
import { get } from "../apiRequest";
import { GET_COMPANY_STAFF } from "../apiPath";
import { StaffType } from "../../types/StaffType";

export async function fetchStaffList(dispatch: React.Dispatch<Action>) {
  try {
    const result: StaffType[] = await get(GET_COMPANY_STAFF, {
      param: {
        limit: 1000,
        offset: 0,
      },
    });
    dispatch({
      type: "UPDATE_STAFF_LIST",
      staffList: result,
    });
    return result;
  } catch (e) {
    console.error("fetchStaffList", e);
  }
}
