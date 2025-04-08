import React, { ReactNode, useCallback } from "react";
import { Action } from "../../types/LoginType";
import { useAppDispatch } from "../../AppRootContext";

const HIDE_BANNER_TIMEOUT = 3000;

function flashBannerMessage(
  message: ReactNode,
  dispatch: React.Dispatch<Action>,
  timeout?: number
) {
  dispatch({
    type: "UPDATE_BANNER_MESSAGE",
    bannerMessage: message,
  });

  return new Promise<void>((resolve) => {
    setTimeout(() => {
      dispatch({
        type: "HIDE_BANNER_MESSAGE",
      });
      resolve();
    }, timeout ?? HIDE_BANNER_TIMEOUT);
  });
}

export type FlashDispatcher = (
  message: ReactNode,
  timeoout?: number
) => Promise<void>;

/**
 * Use this hook to lift up LoginContext dependencies from everywhere possible.
 * Instead of calling `flashBannerMessage(msg. t, ...context values)` from a leaf component,
 * pass a function to it's props like in {@link BulkEdit}.
 */
export function useFlashMessageChannel(): FlashDispatcher {
  const loginDispatch = useAppDispatch();
  // Returns a stable flash function reference, would not force extra calling component renders
  return useCallback(
    (message: ReactNode, timeoout?: number) => {
      return flashBannerMessage(message, loginDispatch);
    },
    [loginDispatch]
  );
}
