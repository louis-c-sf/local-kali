import { useAppSelector, useAppDispatch } from "AppRootContext";
import { equals } from "ramda";
import { useCallback } from "react";
import fetchOptIn from "api/WhatsApp360Dialog/fetchOptIn";
import { OptInType } from "features/Whatsapp360/models/OptInType";

export function useTwilioOptInQuery() {
  const data = useAppSelector((s) => s.inbox.whatsAppTemplates.optIn, equals);
  const loginDispatch = useAppDispatch();

  const fetch = useCallback(
    async (force: boolean): Promise<OptInType> => {
      if (!force && data.booted) {
        return data.data;
      }
      const result = await fetchOptIn();

      loginDispatch({
        type: "INBOX.WHATSAPP_TEMPLATES.OPTIN_LOADED",
        optIn: result,
      });

      return result;
    },
    [data.booted]
  );

  return {
    optIn: data.data,
    booted: data.booted,
    fetch,
  };
}
