import React, { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router";
import { GET_CANNY_TOKEN } from "../api/apiPath";
import { post } from "../api/apiRequest";
import { fetchCurrentUserDetail } from "../api/User/fetchCurrentUserDetail";
import { useCurrentUserDetail } from "../api/User/useCurrentUserDetail";
import RedirectionPage from "./RedirectionPage";
import { useAppSelector } from "../AppRootContext";

function RedirectFeedback() {
  const user = useAppSelector((s) => s.user);
  const history = useHistory();
  const location = useLocation();
  const param = new URLSearchParams(location.search);
  const { loggedInUserDetail, refreshCurrentUserDetail } =
    useCurrentUserDetail();
  const [accessToken, setAccessToken] = useState("");

  interface CannyTokenType {
    access_token: string;
  }

  function getRedirectURL() {
    try {
      const currentUrl = new URL(window.location.href);
      const redirectUrl = new URL(
        currentUrl?.searchParams?.get("redirect") ?? ""
      );
      if (!redirectUrl.protocol.startsWith("https")) {
        return null;
      }
      redirectUrl.searchParams.set("ssoToken", accessToken);
      return redirectUrl;
    } catch (e) {
      console.error(`getRedirectURL error ${e}`);
    }
  }

  const redirectURL = getRedirectURL();
  if (accessToken && redirectURL) {
    window.location.assign(redirectURL.href);
  }
  useEffect(() => {
    refreshCurrentUserDetail();
  }, []);
  useEffect(() => {
    if (loggedInUserDetail && user.id) {
      if (loggedInUserDetail.roleType) {
        const { profilePictureURL, userInfo } = loggedInUserDetail;
        post(GET_CANNY_TOKEN, {
          param: {
            avatarURL: profilePictureURL
              ? `${URL}${loggedInUserDetail.profilePictureURL}`
              : "",
            email: userInfo.email,
            id: userInfo.id,
            name: userInfo.lastName
              ? `${userInfo.firstName} ${userInfo.lastName}`
              : userInfo.firstName,
          },
        })
          .then((token: CannyTokenType) => {
            setAccessToken(token.access_token);
            history.replace({
              pathname: location.pathname,
              search: new URLSearchParams(
                `?redirect=https://feedback.sleekflow.io/features/${
                  param.get("path") ?? ""
                }`
              ).toString(),
            });
          })
          .catch((error) => {
            console.error("#add-canny", error);
          });
      }
    } else {
      fetchCurrentUserDetail(user.id);
    }
  }, [JSON.stringify(loggedInUserDetail), user?.id]);
  return <RedirectionPage />;
}

export default RedirectFeedback;
