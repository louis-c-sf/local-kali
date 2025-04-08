import React, { useEffect } from "react";
import {
  GET_INSTAGRAM_REDIRECT,
  POST_COMPANY_INSTAGRAM_SUBSCRIBE,
} from "../api/apiPath";
import { get, postWithExceptions } from "../api/apiRequest";
import { useHistory } from "react-router-dom";
import RedirectionPage from "../container/RedirectionPage";
import useRouteConfig from "../config/useRouteConfig";
import mixpanel from "mixpanel-browser";
import { getChannelTypeObj } from "./shared/useAnalytics";

function InstagramRedirection() {
  const history = useHistory();
  const { routeTo } = useRouteConfig();
  const sendInstagramResponseToServer = async (code: string) => {
    try {
      const result = await get(GET_INSTAGRAM_REDIRECT, {
        param: { code },
      });
      if (result?.data) {
        const instagramData = result.data;
        if (!instagramData) {
          history.push(routeTo("/onboarding/instagram"), { failed: true });
          return;
        }

        if (Array.isArray(instagramData)) {
          const validInstagramAccount = instagramData.filter(
            (i) => i.access_token
          );
          Promise.all(
            validInstagramAccount.map((ig) => {
              postWithExceptions(POST_COMPANY_INSTAGRAM_SUBSCRIBE, {
                param: {
                  ...ig,
                  business_integration_system_user_access_token:
                    result.business_integration_system_user_access_token,
                },
              });
            })
          )
            .then(() => {
              mixpanel.track(
                "Channel Connected",
                getChannelTypeObj("instagram")
              );
              history.push(routeTo("/onboarding/instagram"), { success: true });
            })
            .catch(() => {
              history.push(routeTo("/onboarding/instagram"), { failed: true });
            });
        }
      } else {
        history.push(routeTo("/onboarding/instagram"), { failed: true });
      }
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    const params = new URLSearchParams(document.location.search.substring(1));
    try {
      sendInstagramResponseToServer(params.get("code") ?? "");
    } catch (error) {
      console.error("facebook redirect error:", error);
    }
  }, []);
  return <RedirectionPage />;
}

export default InstagramRedirection;
