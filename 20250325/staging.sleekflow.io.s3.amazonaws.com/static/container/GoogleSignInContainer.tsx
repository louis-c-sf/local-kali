import React, { useRef, useEffect } from "react";
import { useHistory } from "react-router";
import useRouteConfig from "../config/useRouteConfig";
import { useAppDispatch } from "../AppRootContext";
import { post } from "../api/apiRequest";
import { POST_GOOGLE_SIGNIN } from "../api/apiPath";
import { UserType } from "../types/LoginType";
import { signUpLoginIn } from "../App/lifecycle/useSessionLifecycle";

interface GoogleInvitationType {
  teamIds: number[];
  companyId: string;
  userRole: string;
}
interface GoogleSignInContainerProps {
  buttonText: string;
  subHeaderText: string;
  invitationParams?: GoogleInvitationType;
}
export default function GoogleSignInContainer(
  props: GoogleSignInContainerProps
) {
  const { buttonText, subHeaderText, invitationParams } = props;
  const loginDispatch = useAppDispatch();
  let auth2: gapi.auth2.GoogleAuth;
  const googleSignInRef = useRef<HTMLDivElement>(null);
  const history = useHistory();
  const { routeTo } = useRouteConfig();
  function attachSignin() {
    if (googleSignInRef.current) {
      auth2.attachClickHandler(
        googleSignInRef.current,
        {},
        function(googleUser: gapi.auth2.GoogleUser) {
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
              history.push(routeTo(`/inbox/${result.id}`));
            } else {
              history.push(routeTo("/signup"));
            }
          });
        },
        function(error: any) {
          console.debug(
            `google sign in error: ${JSON.stringify(error, undefined, 2)}`
          );
        }
      );
    }
  }

  useEffect(() => {
    if (googleSignInRef.current) {
      try {
        gapi.load("auth2", function() {
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
  }, [googleSignInRef.current]);

  return (
    <div className="google-sign-container">
      <div className="ui button small" ref={googleSignInRef}>
        <div>{buttonText}</div>
      </div>
      <div className="subHeader">{subHeaderText}</div>
    </div>
  );
}
