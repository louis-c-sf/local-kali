import React, { useRef, useEffect } from "react";
import { useHistory } from "react-router";
import { POST_GOOGLE_SIGNIN } from "../../api/apiPath";
import { post } from "../../api/apiRequest";
import { signUpLoginIn } from "../../App/lifecycle/useSessionLifecycle";
import { useAppDispatch } from "../../AppRootContext";
import useRouteConfig from "../../config/useRouteConfig";
import { UserType } from "../../types/LoginType";
import styles from "./ChannelSignupButton.module.css";
import { trackDreamData } from "../../utility/dreamData";
interface GoogleInvitationType {
  teamIds: number[];
  companyId: string;
  userRole: string;
}
interface ChannelSignupButtonProps {
  buttonText: string;
  subHeaderText: string;
  invitationParams?: GoogleInvitationType;
  type: "google" | "shopify";
  className?: string;
  onClick?: () => void;
}
export default function ChannelSignupButton(props: ChannelSignupButtonProps) {
  const { type, buttonText, subHeaderText, invitationParams } = props;
  const history = useHistory();
  const { routeTo } = useRouteConfig();
  let auth2: gapi.auth2.GoogleAuth;
  const loginDispatch = useAppDispatch();
  const signinRef = useRef<HTMLDivElement>(null);
  function attachSignin() {
    if (signinRef.current) {
      auth2.attachClickHandler(
        signinRef.current,
        {},
        function (googleUser: gapi.auth2.GoogleUser) {
          post(POST_GOOGLE_SIGNIN, {
            param: {
              tokenId: googleUser.getAuthResponse().id_token,
              ...(invitationParams && { ...invitationParams }),
            },
          }).then((result: UserType) => {
            loginDispatch({
              type: "GOOGLE_SIGNIN",
              googleAuth: auth2,
            });
            loginDispatch({
              type: "LOGIN",
              user: result,
            });
            signUpLoginIn(result);
            if (result.signalRGroupName) {
              trackDreamData("signup", result.email);
              history.push(routeTo(`/inbox/${result.id}`));
            } else {
              history.push(routeTo("/signup"));
            }
          });
        },
        function (error: any) {
          console.debug(
            `google sign in error: ${JSON.stringify(error, undefined, 2)}`
          );
        }
      );
    }
  }
  useEffect(() => {
    if (signinRef.current && type === "google") {
      try {
        gapi.load("auth2", function () {
          // Retrieve the singleton for the GoogleAuth library and set up the client.
          auth2 = gapi.auth2.init({
            client_id: process.env.REACT_APP_GAPI_CLIENT_ID,
            cookie_policy: "single_host_origin",
          });
          auth2.isSignedIn.get();
          attachSignin();
        });
      } catch (e) {
        console.error(`gapi fetch error ${e}`);
      }
    }
  }, [signinRef.current, type]);
  return (
    <div
      onClick={props.onClick}
      className={`${styles.container} ${
        props.className ? props.className : ""
      }`}
    >
      <div className={styles.button} ref={signinRef}>
        <div
          className={`${styles.text} ${
            type === "google" ? styles.google : styles.shopify
          }`}
        >
          {buttonText}
        </div>
      </div>
      {subHeaderText && <div className={styles.subHeader}>{subHeaderText}</div>}
    </div>
  );
}
