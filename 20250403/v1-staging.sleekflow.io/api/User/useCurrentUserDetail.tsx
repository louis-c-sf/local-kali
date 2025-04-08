import { fetchCurrentUserDetail } from "./fetchCurrentUserDetail";
import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../AppRootContext";
import { equals } from "ramda";
import { StaffType } from "../../types/StaffType";

export function useCurrentUserDetail() {
  const loggedInUserDetail = useAppSelector(
    (s) => s.loggedInUserDetail,
    equals
  );
  const userId = useAppSelector((s) => s.user?.id);
  const loginDispatch = useAppDispatch();
  const isLoggedInUserDetail = !!loggedInUserDetail;
  const updateCurrentUserDetail = useCallback(async () => {
    try {
      const result: StaffType[] = await fetchCurrentUserDetail(userId);
      const currentStaffDetail = result[0];
      if (currentStaffDetail) {
        loginDispatch({
          type: "UPDATE_LOGGEDIN_USER_DETAIL",
          loggedInUserDetail: currentStaffDetail,
        });
      }
    } catch (e) {
      console.error(`User detail cannot be retrieved`);
    }
  }, [userId, loginDispatch]);

  useEffect(() => {
    if (userId && !loggedInUserDetail) {
      updateCurrentUserDetail();
    }
  }, [userId, isLoggedInUserDetail]);

  return {
    refreshCurrentUserDetail: updateCurrentUserDetail,
    loggedInUserDetail,
    booted: !!loggedInUserDetail,
  };
}
