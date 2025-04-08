import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import { Dimmer, Loader } from "semantic-ui-react";
import { POST_TWILIO_TOPUP_CREDIT } from "../../../api/apiPath";
import { postWithExceptions } from "../../../api/apiRequest";
import fetchTwilioTopUpPlan from "../../../api/Company/fetchTwilioTopUpPlan";
import useStripeCheckout from "../../../api/User/useStripeCheckout";
import useRouteConfig from "../../../config/useRouteConfig";
import { TwilioUsageRecordType } from "../../../types/CompanyType";
import { equals, pick } from "ramda";
import { useAppSelector } from "../../../AppRootContext";
import SettingTopUpPlanSelection from "./SettingTopUpPlanSelection";

export interface TopUpCreditType {
  id: string;
  name: string;
  price: number;
  currency: string;
}

export default function SettingTwilioTopUp() {
  const { company, user } = useAppSelector(pick(["user", "company"]), equals);
  const [creditBalance, setCreditBalance] = useState<TwilioUsageRecordType>();
  const [twilioTopUpPlan, setTwilioTopUpPlan] = useState<TopUpCreditType[]>();
  const [loadingTopUp, setLoadingTopUp] = useState(false);
  const { stripeCheckout, refreshStripeCheckout } = useStripeCheckout();
  const { t } = useTranslation();
  const history = useHistory();
  const { routeTo } = useRouteConfig();

  useEffect(() => {
    if (company?.twilioUsageRecords) {
      const [firstTwilioUsageRecord] = company.twilioUsageRecords;
      if (firstTwilioUsageRecord) {
        setCreditBalance(firstTwilioUsageRecord);
      } else {
        history.push(routeTo(`/inbox/${user.id}`));
      }
    }
  }, [company?.twilioUsageRecords]);
  useEffect(() => {
    refreshStripeCheckout();
  }, [stripeCheckout?.publicKey]);
  useEffect(() => {
    if (!loadingTopUp && twilioTopUpPlan === undefined) {
      setLoadingTopUp(true);
      fetchTwilioTopUpPlan()
        .then((res) => {
          setTwilioTopUpPlan(res);
        })
        .catch((error) => {
          console.error(`fetchTwilioTopUpPlan error ${error}`);
        })
        .finally(() => {
          setLoadingTopUp(false);
        });
    }
  }, [!loadingTopUp && twilioTopUpPlan === undefined]);

  async function submitPayment(topUpPlanId: string) {
    try {
      setLoadingTopUp(true);
      const result = await postWithExceptions(POST_TWILIO_TOPUP_CREDIT, {
        param: {
          accountSID: creditBalance?.twilioAccountId,
          topupPlanId: topUpPlanId,
        },
      });
      if (stripeCheckout) {
        const stripe = window.Stripe(stripeCheckout.publicKey);
        if (stripe) {
          stripe.redirectToCheckout({
            sessionId: result.id,
          });
        }
      }
    } catch (e) {
      console.error(`submitPayment error ${e}`);
      setLoadingTopUp(false);
    }
  }

  return (
    <Dimmer.Dimmable
      dimmed
      className={"main-primary-column content topup-credit"}
    >
      {loadingTopUp ? (
        <Dimmer active={loadingTopUp} inverted>
          <Loader inverted />
        </Dimmer>
      ) : (
        <>
          <div className="header">
            {t("settings.billing.topupCredit.header")}
          </div>
          {creditBalance && (
            <div className="balance">
              <div
                className={`container ${
                  creditBalance.balance > 0
                    ? `positive`
                    : creditBalance.balance === undefined ||
                      creditBalance.balance === 0
                    ? ""
                    : `negative`
                }`}
              >
                <div className="container-header">
                  {t("settings.billing.topupCredit.currentBalance.header")}
                </div>
                <span>
                  {creditBalance.balance === undefined
                    ? `US$ 0.00`
                    : `US$ ${Math.abs(creditBalance.balance).toFixed(2)}`}
                </span>
              </div>
              <div className="container">
                <div className="container-header">
                  {t("settings.billing.topupCredit.usage.header")}
                </div>
                <span>
                  {creditBalance.totalPrice === undefined
                    ? `US$ 0.00`
                    : `US$ ${creditBalance.totalPrice.toFixed(2)}`}
                </span>
              </div>
              <div className="container">
                <div className="container-header">
                  {t("settings.billing.topupCredit.amountTopUp.header")}
                </div>
                <span>
                  {creditBalance.totalCreditValue === undefined
                    ? `US$ 0.00`
                    : `US$ ${creditBalance.totalCreditValue.toFixed(2)}`}
                </span>
              </div>
            </div>
          )}
          <div className="header">
            {t("settings.billing.topupCredit.addCreditFund.header")}
          </div>
          <div className="subHeader">
            {t("settings.billing.topupCredit.addCreditFund.subHeader", {
              type: t("settings.billing.tab.twilio"),
            })}
          </div>
          <div className="container add-topup">
            <div className="header">
              {t("settings.billing.topupCredit.addTopUpCredit.header")}
            </div>
            <div className="subHeader">
              {t("settings.billing.topupCredit.addTopUpCredit.subHeader")}
            </div>
            <SettingTopUpPlanSelection
              topUpPlans={twilioTopUpPlan}
              submitPayment={submitPayment}
            />
          </div>
        </>
      )}
    </Dimmer.Dimmable>
  );
}
