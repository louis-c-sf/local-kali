import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useLocation } from "react-router";
import { useTranslation } from "react-i18next";
import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";
import { LogoutOptions } from "@auth0/auth0-spa-js";
import serveriI18n from "i18next";
import { swapKeysAndValues } from "../AppRootContext";
import { VersionDic } from "container/Settings/Profile/types";
import { fetchWebVersion } from "api/Setting/fetchWebVersion";
import { logoutReturnTo } from "component/Header/UserProfileDropdown";

export const AUTH0_LOCALE_MAPPING = {
  en: "en-US",
  id: "id-ID",
  "pt-BR": "pt-BR",
  "zh-TW": "zh-HK",
  "zh-CN": "zh-CN",
};

export const AUTH0_LOCALE_MAPPING_REVERSE = {
  "en-US": "en",
  "id-ID": "id",
  "pt-BR": "pt-BR",
  "zh-HK": "zh-TW",
  "zh-CN": "zh-CN",
};

export const WEB_VERSION_V2_URL = `https://${process.env.REACT_APP_V2_PATH}`;

export const logoutWithLocale = (
  logout: (options?: LogoutOptions) => void,
  language: string,
  connectionStrategy?: string
) => {
  return logout(logoutReturnTo(connectionStrategy));
};

function Auth0ProviderWithRedirect({
  children,
}: {
  children: React.ReactNode;
}) {
  const history = useHistory();
  const { search } = useLocation();
  const searchParams = new URLSearchParams(search);
  const screenHint = searchParams.get("screen_hint");
  const { i18n } = useTranslation();
  const langCode = window.location.pathname.split("/")[1];
  const langMapping = swapKeysAndValues(AUTH0_LOCALE_MAPPING);
  const backFromV2FormSession = sessionStorage.getItem("backFromV2ForLogin");
  const { isAuthenticated } = useAuth0();
  const getCorrectLangCode = () => {
    if (!langCode) {
      return langMapping[serveriI18n.language];
    }
    return langCode === "zh-HK" ? "zh-TW" : langCode;
  };

  const PATH_ALLOWED_TO_REDIRECT = [
    "/settings/opt-in",
    "/settings/templates",
    "/sync-shopify",
    "/settings/plansubscription",
    "/channels",
    "/settings/inbox",
  ];

  const checkDefaultWebVersionRedirect = async (userId: string) => {
    try {
      if (backFromV2FormSession) {
        sessionStorage.setItem("backFromV2", "true");
        return;
      }
      const result = await fetchWebVersion(userId);
      if (result.version === VersionDic.v2) {
        window.location.replace(WEB_VERSION_V2_URL);
      }
    } catch (e) {
      console.error("GET_WEB_VERSION error: ", e);
    } finally {
    }
  };

  useEffect(() => {
    const partnerKey = searchParams.get("partner_key");
    if (
      !isAuthenticated &&
      partnerKey &&
      window.location.pathname.endsWith(langCode)
    ) {
      localStorage.setItem("partnerKey", partnerKey);
    }
  }, [searchParams, isAuthenticated]);
  const isValidCallbackPath =
    PATH_ALLOWED_TO_REDIRECT.includes(window.location.pathname) ||
    window.location.pathname.includes("/settings/templates");
  return (
    <Auth0Provider
      ui_locales={getCorrectLangCode()}
      domain={process.env.REACT_APP_AUTH0_DOMAIN}
      clientId={process.env.REACT_APP_AUTH0_CLIENT_ID}
      useRefreshTokens
      onRedirectCallback={(appState, user) => {
        const userId =
          user?.["https://app.sleekflow.io/login_as_user_id"] ??
          user?.["https://app.sleekflow.io/user_id"];
        i18n.changeLanguage(AUTH0_LOCALE_MAPPING[appState?.locale] ?? "en-US");
        if (isValidCallbackPath) {
          history.push(window.location.pathname);
        } else {
          checkDefaultWebVersionRedirect(userId);
          history.push(`/inbox/${userId}`);
        }
      }}
      redirectUri={
        isValidCallbackPath
          ? `${window.location.origin}${window.location.pathname}`
          : window.location.origin
      }
      audience={process.env.REACT_APP_AUTH0_AUDIENCE}
      screen_hint={screenHint ? screenHint : undefined}
      skipRedirectCallback={[
        "/facebook/connect",
        "/instagram/connect",
        "/facebook/ads/connect",
        "/company/shopify/install",
        "/company/shopify/redirect/url",
        "/settings/plansubscription",
        `${i18n.language}/settings/templates`,
      ].includes(window.location.pathname)}
    >
      {children}
    </Auth0Provider>
  );
}

export default Auth0ProviderWithRedirect;
