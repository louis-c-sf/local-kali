import React, { useEffect } from "react";
import { GET_FACEBOOK_REDIRECT } from "../api/apiPath";
import { get, getWithExceptions } from "../api/apiRequest";
import { useHistory, useLocation } from "react-router-dom";
import RedirectionPage from "../container/RedirectionPage";
import useRouteConfig from "../config/useRouteConfig";
import { useAppDispatch } from "../AppRootContext";
import { useFlashMessageChannel } from "./BannerMessage/flashBannerMessage";
import { useTranslation } from "react-i18next";
import { htmlEscape } from "../lib/utility/htmlEscape";

function FacebookRedirection() {
  const location = useLocation();
  const loginDispatch = useAppDispatch();
  const history = useHistory();
  const { routeTo } = useRouteConfig();
  const flash = useFlashMessageChannel();
  const { t } = useTranslation();
  const sendFacebookResponseToServer = async (code: string) => {
    const result = await getWithExceptions(GET_FACEBOOK_REDIRECT, {
      param: { code },
    });
    loginDispatch({
      type: "UPDATE_FACEBOOK_RESPONSE",
      facebookResponse: {
        type: "facebook",
        response: JSON.stringify(result),
      },
    });
    history.push(routeTo("/channels"));
  };
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    try {
      sendFacebookResponseToServer(params.get("code") ?? "");
    } catch (error) {
      flash(t("flash.common.error.general", { error: htmlEscape(`${error}`) }));
      console.error("facebook redirect error:", error);
    }
  }, []);
  return <RedirectionPage />;
}

export default FacebookRedirection;
