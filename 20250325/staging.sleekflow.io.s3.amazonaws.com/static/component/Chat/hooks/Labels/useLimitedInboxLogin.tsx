import { useContext, useEffect, useState } from "react";
import {
  isAjaxHttpError,
  isAxiosHttpError,
  postWithExceptions,
} from "../../../../api/apiRequest";
import {
  POST_SESSION_DEREGISTER_DEVICE,
  POST_SESSION_REGISTER_DEVICE,
} from "../../../../api/apiPath";
import uuid from "uuid";
import { SignalRContext } from "../../../SignalR/SignalRObservable";
import { useSignalRGroup } from "../../../SignalR/useSignalRGroup";
import { DeviceSessionType } from "../../../../types/LoginType";
import { useAppDispatch, useAppSelector } from "../../../../AppRootContext";
import UAParser from "ua-parser-js";
import {
  cleanUpLogin,
  useSessionLifecycle,
} from "../../../../App/lifecycle/useSessionLifecycle";
import { useAuth0 } from "@auth0/auth0-react";

export const BROWSER_ID_STORAGE_KEY = "SF_BROWSER_ID";

export function registerSessionTakeover(
  browserIdGenerated: string,
  takeover: boolean
): Promise<DeviceSessionType[]> {
  const { os } = UAParser(navigator.userAgent);
  return postWithExceptions(POST_SESSION_REGISTER_DEVICE, {
    param: {
      deviceName: os.name,
      uuid: browserIdGenerated,
      deviceType: "web",
      isTakeover: takeover,
    },
  });
}

export function deregisterSessionTaker(
  browserIdGenerated: string,
  takeover: boolean
): Promise<DeviceSessionType[]> {
  const { os } = UAParser(navigator.userAgent);
  return postWithExceptions(POST_SESSION_DEREGISTER_DEVICE, {
    param: {
      deviceName: os.name,
      uuid: browserIdGenerated,
      deviceType: "web",
      isTakeover: takeover,
    },
  });
}

export function useLimitedInboxLogin() {
  const { connection } = useContext(SignalRContext);
  const isLoginAs = useAppSelector((s) => s.user?.loginInAs);
  const signalRGroupName = useAppSelector((s) => s.user?.signalRGroupName);
  const sessionRegistered = useAppSelector((s) => s.session.started);
  const loginDispatch = useAppDispatch();
  const [sessionPending, setSessionPending] = useState(false);
  const { performLogout } = useSessionLifecycle();

  function startSession() {
    loginDispatch({ type: "INBOX.SESSION.STARTED" });
  }

  function stopSession() {
    loginDispatch({ type: "INBOX.SESSION.STOPPED" });
  }

  const { user, isAuthenticated } = useAuth0();

  // DEV NOTE: Don't register device if user is a dive user
  const stringifiedDiveUserInfo =
    user?.["https://app.sleekflow.io/login_as_user_id"];

  useEffect(() => {
    if (
      !isAuthenticated ||
      !connection?.connectionId ||
      sessionRegistered ||
      sessionPending ||
      isLoginAs ||
      stringifiedDiveUserInfo
    ) {
      return;
    }
    const browserId =
      window.localStorage.getItem(BROWSER_ID_STORAGE_KEY) ?? uuid();
    setSessionPending(true);
    registerSessionTakeover(browserId, false)
      .then(() => {
        connection.invoke("DeviceAddToGroup", browserId);
        startSession();
        window.localStorage.setItem(BROWSER_ID_STORAGE_KEY, browserId);
      })
      .catch((e) => {
        startSession();
        if (isAxiosHttpError(e)) {
          if (e?.response?.status === 400) {
            const sessions: DeviceSessionType[] = e.response.data;
            if (
              sessions.some(
                (session) =>
                  session.sessionStatus === "AutoLogout" &&
                  session.uuid === browserId
              )
            ) {
              performLogout();
            } else {
              loginDispatch({
                type: "INBOX.SESSION.TAKEOVER_LOCK",
                sessions: sessions,
              });
            }
          }
          if (e?.response?.status === 401) {
            cleanUpLogin();
            window.location.replace(`/`);
          }
        } else if (isAjaxHttpError(e)) {
          const sessions: DeviceSessionType[] = e.response;
          loginDispatch({
            type: "INBOX.SESSION.TAKEOVER_LOCK",
            sessions: sessions,
          });
        } else {
          console.error(e);
          setTimeout(() => {
            // attempt again
            stopSession();
          }, 3000);
        }
      })
      .finally(() => {
        setSessionPending(false);
      });
  }, [
    isAuthenticated,
    sessionRegistered,
    isLoginAs,
    sessionPending,
    connection?.connectionId,
  ]);

  useSignalRGroup(
    signalRGroupName,
    {
      ForceLogout: [
        (state, session: DeviceSessionType) => {
          loginDispatch({
            type: "INBOX.SESSION.TAKEOVER_LOCK",
            sessions: [session],
          });
        },
      ],
      AutoLogout: [
        (state, session: DeviceSessionType) => {
          const browserId =
            window.localStorage.getItem(BROWSER_ID_STORAGE_KEY) ?? uuid();
          deregisterSessionTaker(browserId, false)
            .then((res) => {
              window.localStorage.removeItem(BROWSER_ID_STORAGE_KEY);
            })
            .catch((e) => {
              console.error(`deregisterSessionTaker error ${e}`);
            })
            .finally(() => {
              performLogout();
            });
        },
      ],
    },
    "useLimitedInboxLogin"
  );
}
