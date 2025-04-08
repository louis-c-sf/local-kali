import { FreeTrialHubDict } from "features/FreeTrial/modules/types";
import React, { useEffect } from "react";
import { useHistory, useLocation } from "react-router";
import useRouteConfig from "../config/useRouteConfig";
import RedirectionPage from "./RedirectionPage";
import { useFlashMessageChannel } from "component/BannerMessage/flashBannerMessage";
import { useTranslation } from "react-i18next";
import BannerMessage from "component/BannerMessage/BannerMessage";
import { htmlEscape } from "../lib/utility/htmlEscape";

function PaymentFailure() {
  const location = useLocation();
  const param = new URLSearchParams(location.search);
  const planId = param.get("planId");
  const data = param.get("data");
  const topupId = param.get("topupId");
  const info = param.get("info");
  const selectedPlan = planId as string;
  const { routeTo } = useRouteConfig();
  const history = useHistory();
  const flash = useFlashMessageChannel();
  const { t } = useTranslation();

  useEffect(() => {
    try {
      const parsedData = data && JSON.parse(data);
      if (parsedData?.info === "connectFee") {
        history.push({
          pathname: routeTo("/request-whatsapp"),
          state: {
            status: "fail",
          },
        });
        return;
      }
      if (info === "autoTopUp") {
        const phoneNumber = param.get("phoneNumber");
        if (phoneNumber) {
          history.push({
            pathname: routeTo("/request-whatsapp"),
            search: "isCloudAPI=true",
            state: {
              afterSettingAutoTopUp: true,
              phoneNumber: phoneNumber,
            },
          });
        } else {
          history.push({
            pathname: routeTo("/settings/topup"),
          });
        }
        return;
      }
      if (parsedData.info === "freeTrial") {
        if (parsedData.freeTrialType === FreeTrialHubDict.salesforce) {
          history.push("/free-trial/intro/salesforce");
        } else if (parsedData.freeTrialType === FreeTrialHubDict.hubspot) {
          history.push("/free-trial/intro/hubspot");
        } else if (
          parsedData.freeTrialType === FreeTrialHubDict.additionalStaff
        ) {
          history.push("/settings/plansubscription");
        }
        return;
      }
      if (planId) {
        if (planId.includes("sleekflow_v2_agent")) {
          setTimeout(() => {
            history.push(routeTo("/settings/plansubscription"));
          }, 2000);
        } else {
          if (selectedPlan.toLowerCase().includes("whatsapp")) {
            history.push(routeTo("/channel-selection"));
          } else {
            setTimeout(() => {
              history.push(
                data
                  ? routeTo("/settings/plansubscription")
                  : routeTo("/settings/plansubscription")
              );
            }, 2000);
          }
        }
      } else {
        //todo remove topup redirections?
        if (data === "topup") {
          setTimeout(() => {
            history.push(routeTo("/whatsapp-topup-success"));
          }, 2000);
        } else if (topupId) {
          if (data) {
            const topUpJSON = JSON.parse(decodeURIComponent(data));
            setTimeout(() => {
              history.push({
                pathname: routeTo("/request-whatsapp"),
                state: {
                  step: 2,
                  email: topUpJSON.email,
                  accountSid: topUpJSON.accountSid,
                },
              });
            });
            return;
          }
          history.push({
            pathname: routeTo("/settings/topup"),
          });
        } else {
          setTimeout(() => {
            history.push(routeTo("/signin"));
          }, 2000);
        }
      }
    } catch (e) {
      flash(t("flash.stripe.error.unknown", { error: htmlEscape(e.message) }));
      console.error(e);
    }
  }, [location.search, data, history, planId, routeTo, selectedPlan, topupId]);
  return (
    <>
      <RedirectionPage />
      <BannerMessage />
    </>
  );
}

export default PaymentFailure;
