import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../AppRootContext";
import { isFreePlan } from "../../types/PlanSelectionType";
import { equals, pick } from "ramda";

export function useFetchMessageSent() {
  const { currentPlan } = useAppSelector(pick(["currentPlan"]), equals);
  const loginDispatch = useAppDispatch();
  const booted = useAppSelector((s) => s.usage.booted);

  const loadCompanyUsageData = () => {
    loginDispatch({
      type: "COMPANY_USAGE.API.LOAD",
    });
  };

  useEffect(() => {
    if (currentPlan.id && !isFreePlan(currentPlan)) {
      loadCompanyUsageData();
    } else if (isFreePlan(currentPlan) && currentPlan.id) {
      loginDispatch({
        type: "USAGE_UPDATED",
        usage: {
          booted: true,
        },
      });
    }
  }, [currentPlan.id]);

  return {
    booted,
  };
}
