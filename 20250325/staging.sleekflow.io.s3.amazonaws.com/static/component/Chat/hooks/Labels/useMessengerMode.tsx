import { TypeStatusEnum } from "../../../../types/LoginType";
import { useCallback, useEffect } from "react";
import Cookie from "js-cookie";
import Cookies from "js-cookie";
import { useAppDispatch, useAppSelector } from "../../../../AppRootContext";

const COOKIE_KEY = "INBOX.MESSENGER.MODE";

export function useMessengerMode() {
  const mode = useAppSelector((s) => s.inbox.messenger.mode);
  const loginDispatch = useAppDispatch();
  useEffect(() => {
    if (mode === undefined) {
      const modeStored = (Cookie.get(COOKIE_KEY) ?? "reply") as TypeStatusEnum;
      selectMode(modeStored);
    }
  }, [mode === undefined]);

  function selectMode(mode: TypeStatusEnum) {
    Cookie.set(COOKIE_KEY, mode, { expires: 365 });
    loginDispatch({ type: "INBOX.MESSENGER.SELECT_MODE", mode });
  }

  const handleLogout = useCallback(() => {
    loginDispatch({ type: "INBOX.MESSENGER.RESET_MODE" });
    Cookies.remove(COOKIE_KEY);
  }, []);

  return {
    selectMode: useCallback(selectMode, [loginDispatch]),
    messengerMode: mode,
    onLogout: handleLogout,
  };
}
