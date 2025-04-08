import React, { useEffect } from "react";
import RedirectionPage from "container/RedirectionPage";
import { useLocation } from "react-router";
import { LOCALSTORAGE_PUBLIC_API_KEY } from "./Create360DialogAccount";
import { post360DialogAPIKey } from "api/WhatsApp360Dialog/post360DialogAPIKey";

function Redirect360DialogLoggedIn() {
  const location = useLocation();
  const param = new URLSearchParams(location.search);
  const channelIds = param.get("channels");
  const clientId = param.get("client");
  const partnerId = param.get("state");
  useEffect(() => {
    async function retrieveAPIkey() {
      const channelId = channelIds?.substring(1, channelIds.length - 1);
      if (!channelId || !clientId || !partnerId) {
        return undefined;
      }
      return post360DialogAPIKey(clientId, channelId, partnerId);
    }

    if (channelIds) {
      retrieveAPIkey().then((res) => {
        const key = res?.whatsapp360DialogOnboardingChannelInfo.apiKey;
        if (key) {
          localStorage.setItem(LOCALSTORAGE_PUBLIC_API_KEY, key);
          window.close();
        }
      });
    }
  }, [channelIds]);
  return <RedirectionPage />;
}

export default Redirect360DialogLoggedIn;
