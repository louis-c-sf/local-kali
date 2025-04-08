import { useEffect } from "react";
import { equals } from "ramda";
import { fetchStaffList } from "./fetchStaffList";
import { useAppDispatch, useAppSelector } from "../../AppRootContext";
import { defaultStaff } from "../../types/StaffType";

export function useCompanyStaff() {
  const staffList = useAppSelector((s) => s.staffList, equals);
  const loginDispatch = useAppDispatch();
  const booted = !equals(staffList, [defaultStaff]);
  const isUserIdExist = useAppSelector((s) => s.user?.id !== "");

  useEffect(() => {
    if (booted || !isUserIdExist) {
      return;
    }
    fetchStaffList(loginDispatch);
  }, [booted, isUserIdExist]);

  return {
    booted,
    staffList: booted ? staffList : [],
    refresh: async () => {
      //todo replace with rxjs switchMap
      try {
        return await fetchStaffList(loginDispatch);
      } catch (e) {
        console.error("useCompanyStaff.refresh", e);
        return staffList;
      }
    },
  };
}
