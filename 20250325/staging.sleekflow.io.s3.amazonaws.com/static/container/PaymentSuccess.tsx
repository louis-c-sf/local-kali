import React, { useEffect } from "react";
import { useLocation } from "react-router";
import { post } from "../api/apiRequest";
import { POST_COMPANY_INVITE_V2 } from "../api/apiPath";
import useRouteConfig from "../config/useRouteConfig";
import RedirectionPage from "./RedirectionPage";
import fetchTwilioUsage from "../api/Company/fetchTwilioUsage";
import { useAppDispatch } from "../AppRootContext";
import { FreeTrialHubDict } from "features/FreeTrial/modules/types";
import { useHistory } from "react-router-dom";
import { useFlashMessageChannel } from "component/BannerMessage/flashBannerMessage";
import { useTranslation } from "react-i18next";
import BannerMessage from "component/BannerMessage/BannerMessage";
import { htmlEscape } from "../lib/utility/htmlEscape";

const PaymentSuccess = () => {
  const loginDispatch = useAppDispatch();
  const history = useHistory();
  const location = useLocation();
  const param = new URLSearchParams(location.search);
  const planId = param.get("planId");
  const data = param.get("data");
  const topupId = param.get("topupId");
  const info = param.get("info");
  const selectedPlan = planId as string;
  const { routeTo } = useRouteConfig();
  const flash = useFlashMessageChannel();
  const { t } = useTranslation();

  const postCompanyInviteRequest = async (dataStr: string) => {
    const data = JSON.parse(dataStr as string);

    try {
      const result = await post(POST_COMPANY_INVITE_V2, {
        param: {
          inviteUsers: [
            {
              ...data,
            },
          ],
        },
      });
      if (result) {
        history.push(routeTo(`/settings/usermanagement`));
      }
    } catch (e) {
      console.debug("eeee", e);
    }
  };
  useEffect(() => {
    try {
      const parsedData = data ? JSON.parse(data) : undefined;
      if (parsedData?.info === "connectFee") {
        history.push({
          pathname: routeTo("/request-whatsapp"),
          search: "isCloudAPI=true",
          state: {
            status: "success",
          },
        });
        return;
      } else if (selectedPlan?.includes("shopify_integration")) {
        window.open(
          "https://accounts.shopify.com/store-login",
          "_self",
          "noopener noreferrer"
        );
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
      if (data === "unofficial") {
        if (window["dataLayer"]) {
          window["dataLayer"].push({
            event: "chatapiSubscription",
          });
        }
        setTimeout(() => {
          history.push({
            pathname: routeTo("/channels/unofficial/whatsapp"),
            state: {
              channelName: "whatsapp",
            },
          });
        }, 2000);
        return;
      } else if (parsedData?.info === "freeTrial") {
        const extraData =
          parsedData.freeTrialType === FreeTrialHubDict.additionalStaff
            ? {
                quantity: parsedData.quantity,
              }
            : {};
        history.push({
          pathname: routeTo(`/free-trial/connect/${parsedData.freeTrialType}`),
          state: {
            isPaymentSuccess: true,
            ...extraData,
          },
        });
        return;
      }
      if (planId) {
        if (planId.includes("payment_integration")) {
          history.push(routeTo("/channels"));
          return;
        } else if (planId.includes("shopify_integration")) {
          history.push(routeTo("/onboarding/shopify"));
          return;
        } else if (planId.includes("sleekflow_v9_whatsapp_phone_number")) {
          history.push({
            pathname: routeTo("/request-whatsapp"),
            search: "isCloudAPI=true",
            state: {
              isDisplayPhoneNumberList: true,
            },
          });
          return;
        }
        history.push("/settings/plansubscription");
        // if (
        //   planId.includes("agent_premium_yearly") ||
        //   planId.includes("agent_premium_monthly") ||
        //   planId.includes("agent_pro_yearly") ||
        //   planId.includes("agent_pro_monthly")
        // ) {
        //   if (data) {
        //     postCompanyInviteRequest(data as string);
        //   } else {
        //     setTimeout(() => {
        //       history.push(routeTo("settings/plansubscription"));
        //     }, 2000);
        //   }
        // } else {
        //   if (
        //     planId.includes("onboarding_support_oneoff") ||
        //     planId.includes("priority_support_yearly") ||
        //     planId.includes("support_and_consultation")
        //   ) {
        //     setTimeout(() => {
        //       history.push(routeTo("/consultation-payment-success"));
        //     }, 2000);
        //   } else if (selectedPlan.toLowerCase().includes("whatsapp")) {
        //     history.push(routeTo("/channel-selection"));
        //   } else {
        //     loginDispatch({ type: "UPDATED_PLAN", isPlanUpdated: true });
        //     setTimeout(() => {
        //       if (window["dataLayer"]) {
        //         window["dataLayer"].push({
        //           event: selectedPlan.includes("pro")
        //             ? "proSubscription"
        //             : "premiumSubscription",
        //         });
        //       }
        //       if (data === "payment") {
        //         history.push(routeTo("/guide/whatsapp-comparison"));
        //       } else if (data === "shopify") {
        //         history.push(routeTo("/onboarding/shopify"));
        //       } else {
        //         history.push(routeTo("/channel-selection"));
        //       }
        //     }, 2000);
        //   }
        // }
      } else {
        if (data === "topup") {
          setTimeout(() => {
            history.push(routeTo("/whatsapp-topup-success"));
          }, 2000);
        } else if (topupId) {
          //todo remove topup redirections?
          if (topupId.includes("whatsapp_credit")) {
            setTimeout(() => {
              history.push({
                pathname: routeTo("/settings/topup"),
                state: {
                  isTopUpSuccess: true,
                },
              });
            }, 2000);
            return;
          }
          if (data) {
            const topUpJSON = JSON.parse(decodeURIComponent(data));
            setTimeout(() => {
              history.push({
                pathname: routeTo("/request-whatsapp"),
                state: {
                  step: topUpJSON.step,
                  email: topUpJSON.email,
                  accountSid: topUpJSON.accountSid,
                },
              });
            });
            return;
          }
          fetchTwilioUsage()
            .then(() => {
              history.push({
                pathname: routeTo("/settings/topup"),
                state: {
                  isTopUpSuccess: true,
                },
              });
            })
            .catch(() => {
              history.push({
                pathname: routeTo("/settings/topup"),
              });
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
  }, [location.search]);

  return (
    <>
      <RedirectionPage />
      <BannerMessage />
    </>
  );
};

export default PaymentSuccess;
