import { useAppSelector } from "AppRootContext";
import mixpanel from "mixpanel-browser";
import { equals, pick } from "ramda";
import { useEffect } from "react";
import { useLocation } from "react-router";
import {
  isFreeOrFreemiumPlan,
  isPremiumPlan,
  isProPlan,
  isEnterprisePlan,
  PlanType,
  PlanDisplayType,
} from "types/PlanSelectionType";
import { useTranslation } from "react-i18next";
import { useAuth0 } from "@auth0/auth0-react";

const channelTypeMap = {
  whatsApp: "WhatsApp",
  facebook: "Facebook",
  sms: "SMS",
  weChat: "WeChat",
  line: "Line",
  telegram: "Telegram",
  viber: "Viber",
  instagram: "Instagram",
};

export const getChannelTypeObj = (channel: keyof typeof channelTypeMap) => {
  return { "Channel Type": channelTypeMap[channel] };
};

const getAuthType = (connectionStrategy?: string) => {
  if (connectionStrategy === "google-oauth2") {
    return "Google";
  }
  if (connectionStrategy === "apple") {
    return "Apple";
  }
  return "Email";
};

const languageMap = {
  "zh-HK": "Traditional Chinese",
  "zh-CN": "Simplified Chinese",
  "pt-BR": "Portuguese Brazil",
  "id-ID": "Bahasa Indonesia",
  "en-US": "English",
};

const getLanguage = (language: string) => {
  return languageMap[language] ?? "English";
};

const getDeviceType = () => {
  const ua = window.navigator.userAgent;
  const tabletRegex = /(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i;
  const mobRegex =
    /Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/;

  if (tabletRegex.test(ua)) return "Tablet";
  if (mobRegex.test(ua)) return "Mobile";
  return "Desktop";
};

const getPlanType = (plan: PlanType | PlanDisplayType) => {
  if (isFreeOrFreemiumPlan(plan)) {
    return "Free";
  }
  if (isProPlan(plan)) {
    return "Pro";
  }
  if (isPremiumPlan(plan)) {
    return "Premium";
  }
  if (isEnterprisePlan(plan)) {
    return "Enterprise";
  }
  return "";
};

export function useAnalytics() {
  const { company, currentPlan } = useAppSelector(
    pick(["company", "currentPlan"]),
    equals
  );
  const location = useLocation();
  const currentStaff = useAppSelector(
    (s) => s.staffList.find((staff) => staff.userInfo.id === s.user.id),
    equals
  );
  const {
    i18n: { language },
  } = useTranslation();
  const { user } = useAuth0();

  useEffect(() => {
    if (!company?.id || !currentPlan.id || !currentStaff) {
      return;
    }
    mixpanel.identify(currentStaff.userInfo.id);
    mixpanel.register({
      Platform: "Web v1",
      Language: getLanguage(language),
      "Device Type": getDeviceType(),
      "Web App Version": process.env.REACT_APP_WEB_APP_VERSION ?? "",
    });
    mixpanel.people.set({
      "Company ID": company.id,
      "Company Name": company.companyName,
      "User Email": currentStaff.userInfo.email,
      Name: currentStaff.userInfo.userName,
      Username: currentStaff.userInfo.userName,
      "User Role": currentStaff?.userInfo.userRole ?? "",
      "Subscription Plan": getPlanType(currentPlan),
      "Company Creation Time": company.createdAt,
      "Authentication Method": getAuthType(
        user?.["https://app.sleekflow.io/connection_strategy"]
      ),
    });
    mixpanel.track("Session Initialized");
    return () => {
      mixpanel.reset();
    };
  }, [currentStaff?.userInfo.id, company?.id, currentPlan.id]);
  useEffect(() => {
    if (!currentStaff?.userInfo.id || !company?.id || !currentPlan.id) {
      return;
    }

    const { email, userRole } = currentStaff?.userInfo;
    // Wait and add user info manually to skip the initial page view tracking that has no user info
    //@ts-ignore
    mixpanel.track_pageview({
      $email: email,
      Role: userRole,
      "Subscription Plan": currentPlan,
      Platform: "Web v1",
    });
  }, [location.pathname, currentStaff, company?.id, currentPlan.id]);
}
