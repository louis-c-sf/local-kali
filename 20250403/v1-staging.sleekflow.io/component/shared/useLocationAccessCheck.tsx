import React, { useEffect } from "react";
import { useHistory, useLocation } from "react-router";
import { useMainMenus } from "../Header/Menu/localizable/useMainMenus";
import { LOCATION_STORAGE_KEY } from "../Header/PostLogin";
import { useAccessRulesGuard } from "../Settings/hooks/useAccessRulesGuard";
import { useAppSelector } from "../../AppRootContext";
import { equals } from "ramda";
import useRouteConfig from "../../config/useRouteConfig";

export default function useLocationAccessCheck() {
  const loggedInUserDetail = useAppSelector(
    (s) => s.loggedInUserDetail,
    equals
  );
  const history = useHistory();
  const location = useLocation();
  const accessRuleGuard = useAccessRulesGuard();
  const { roleDisplayMenuItem } = useMainMenus();
  const { routeTo } = useRouteConfig();
  const currentPlanId = useAppSelector((s) => s.currentPlan?.id);
  const isRbacEnabled = useAppSelector((s) => s.isRbacEnabled);

  useEffect(() => {
    if (loggedInUserDetail?.roleType && currentPlanId) {
      const menuItems = roleDisplayMenuItem(loggedInUserDetail);
      if (
        accessRuleGuard.isMenuAccessAllowed(
          menuItems,
          location.pathname,
          isRbacEnabled
        )
      ) {
        localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(location));
      } else {
        const prevLoc = localStorage.getItem(LOCATION_STORAGE_KEY);
        if (prevLoc) {
          history.replace(JSON.parse(prevLoc));
        } else {
          history.goBack();
        }
      }
    }
  }, [
    location.pathname,
    currentPlanId,
    loggedInUserDetail?.roleType,
    accessRuleGuard,
    isRbacEnabled,
  ]);
  useEffect(() => {
    if (currentPlanId && !accessRuleGuard.isPaid()) {
      if (
        [
          routeTo("/guide/whatsapp-comparison"),
          routeTo("/request-whatsapp"),
          routeTo("/channels/official/whatsapp/video"),
        ].includes(location.pathname)
      ) {
        history.push("/settings/plansubscription");
      }
    }
  }, [currentPlanId, accessRuleGuard, location.pathname]);
}
