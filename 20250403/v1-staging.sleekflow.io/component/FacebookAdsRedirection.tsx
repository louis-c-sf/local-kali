import React, { useEffect } from "react";
import { GET_FACEBOOK_ADS_REDIRECT } from "../api/apiPath";
import { get } from "../api/apiRequest";
import { useHistory } from "react-router-dom";
import RedirectionPage from "../container/RedirectionPage";
import useRouteConfig from "../config/useRouteConfig";
import { useAppDispatch } from "../AppRootContext";

const FacebookAdsRedirection = () => {
  const history = useHistory();
  const loginDispatch = useAppDispatch();
  const { routeTo } = useRouteConfig();

  const sendFacebookResponseToServer = async (code: string) => {
    const result = await get(GET_FACEBOOK_ADS_REDIRECT, {
      param: { code },
    });
    loginDispatch({
      type: "UPDATE_FACEBOOK_ADS_RESPONSE",
      facebookResponse: JSON.stringify(result),
    });
    history.push(routeTo("/channels"));
  };
  useEffect(() => {
    const params = new URLSearchParams(document.location.search.substring(1));
    try {
      sendFacebookResponseToServer(params.get("code") ?? "");
    } catch (error) {
      console.error("facebook redirect error:", error);
    }
  }, []);
  return <RedirectionPage />;
};
export default FacebookAdsRedirection;
