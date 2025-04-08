import Cookies from "js-cookie";
import { useMessengerMode } from "../../component/Chat/hooks/Labels/useMessengerMode";
import { useCallback, useContext } from "react";
import { FILTERS_STORAGE_KEY } from "../../container/Contact";
import { LOCATION_STORAGE_KEY } from "../../component/Header/PostLogin";
import { useAppDispatch, useAppSelector } from "../../AppRootContext";
import { SignalRContext } from "../../component/SignalR/SignalRObservable";
import { UserType } from "../../types/LoginType";

export function useSessionLifecycle() {
  const { onLogout: onMessengerModeLogout } = useMessengerMode();
  const loginDispatch = useAppDispatch();
  const { connection } = useContext(SignalRContext);
  const signalRGroupId = useAppSelector((s) => s.user?.signalRGroupName);

  return {
    performLogout: useCallback(async () => {
      if (connection) {
        if (signalRGroupId) {
          await connection.invoke("RemoveFromGroup", signalRGroupId);
        }
        // todo unregister the browser to allow logging in from any other one
      }
      loginDispatch({ type: "CLEAR_COMPANY" });
      loginDispatch({ type: "GOOGLE_SIGNOUT" });
      loginDispatch({ type: "CLEAR_CACHED_MESSAGE" });
      loginDispatch({ type: "INBOX.SESSION.STOPPED" });
      cleanUpLogin();
      onMessengerModeLogout();
    }, [loginDispatch, connection, signalRGroupId]),
  };
}

// TODO: Dive Login
export function signUpLoginIn(user: UserType, isShopify?: boolean) {
  // @ts-ignore
  localStorage.setItem("accessToken", user?.accessToken);
  localStorage.setItem("user", JSON.stringify(user));
  if (!isShopify) {
    window.chmln.identify(user.id, {
      email: user.email,
      userName: user.userName,
      firstName: user.firstName,
      lastName: user.lastName,
    });
  }
}

//todo move all usages onto hook
export function cleanUpLogin() {
  localStorage.removeItem("user");
  localStorage.removeItem("accessToken");
  Cookies.remove("skipChannels");
  localStorage.removeItem(LOCATION_STORAGE_KEY);
  localStorage.removeItem(FILTERS_STORAGE_KEY);
  window.chmln.clear();
}
