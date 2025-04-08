import React, { useEffect, useState } from "react";
import queryString from "query-string";
import { post } from "../api/apiRequest";
import { POST_ACCOUNT_VERIFY } from "../api/apiPath";
import Cookie from "js-cookie";
import VerifyEmailSuccess from "./VerifyEmailSuccess";
import { useLocation } from "react-router";

const VerifyEmail = () => {
  const location = useLocation();
  const { userId, code } = queryString.parse(location.search);
  const [isRedirect, setRedirect] = useState(false);
  const [success, isSuccess] = useState(false);

  const verifyEmailAccount = async () => {
    try {
      if (window.location.search) {
        const params = window.location.search.substring(1);
        if (params) {
          const userId = params
            .split("&")
            .find((param) => param.includes("userId"));
          const code = params
            .split("&")
            .find((param) => param.includes("code"));
          if (userId && code) {
            console.debug("userId", userId, userId.split("=")[1]);
            const token = decodeURIComponent(
              code.substring(code.indexOf("=") + 1)
            );
            const result = await post(POST_ACCOUNT_VERIFY, {
              param: {
                userId: userId.split("=")[1],
                token,
              },
            });
            if (result) {
              Cookie.set("accessToken", result.accessToken);
              localStorage.setItem("accessToken", result.accessToken);
              Cookie.set("user", result);
            }
          } else {
            // window.location.href = "/signin";
          }
        } else {
          // window.location.href = "/signin";
        }
      } else {
        // window.location.href = "/signin";
      }
    } catch (e) {
      // window.location.href = "/signin";
    }

    isSuccess(true);
    // setTimeout(() => {
    //   setRedirect(true);
    // }, 5000);
  };
  useEffect(() => {
    verifyEmailAccount();
  }, []);
  return <VerifyEmailSuccess />;
};

export default VerifyEmail;
