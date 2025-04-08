import { fetchShopifyChargeResult } from "api/StripePayment/fetchShopifyChargeResult";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useHistory, useLocation } from "react-router";
import { useFlashMessageChannel } from "../component/BannerMessage/flashBannerMessage";
import useRouteConfig from "../config/useRouteConfig";
import RedirectionPage from "./RedirectionPage";
import { htmlEscape } from "../lib/utility/htmlEscape";

function ShopifySubscriptionSuccessContainer() {
  const location = useLocation();
  const param = new URLSearchParams(location.search);
  const chargeId = param.get("charge_id");
  const flash = useFlashMessageChannel();
  const history = useHistory();
  const { t } = useTranslation();
  const { routeTo } = useRouteConfig();
  const getChargeResult = async (chargeId: string) => {
    try {
      const res = await fetchShopifyChargeResult(chargeId);
      if (res.charge_id) {
        history.push(routeTo("/settings/plansubscription"));
      }
    } catch (e) {
      getChargeResult(chargeId);
      console.error(`unable to get charge result:${e}`);
      if (e.message) {
        flash(e.message);
      } else {
        flash(`${t("common:system.error.unknown")}: ${e}`);
      }
    }
  };

  const getChargeResultWithRetry = async (chargeId: string) => {
    const retries = 3;
    const timeout = 2 * 1000;
    let error;
    for (let i = 0; i < retries; i++) {
      try {
        await new Promise<void>((resolve, reject) => {
          setTimeout(() => {
            try {
              getChargeResult(chargeId);
              resolve();
            } catch (e) {
              reject(e);
            }
          }, timeout);
        });
        return;
      } catch (e) {
        error = e;
      }
    }
    if (error) {
      console.error("Failed to execute function after multiple retries", error);
      flash(`${t("common:system.error.unknown")}: ${htmlEscape(`${error}`)}`);
    }
  };

  useEffect(() => {
    if (!chargeId) {
      return;
    }
    getChargeResultWithRetry(chargeId);
  }, [chargeId]);
  return <RedirectionPage />;
}

export default ShopifySubscriptionSuccessContainer;
