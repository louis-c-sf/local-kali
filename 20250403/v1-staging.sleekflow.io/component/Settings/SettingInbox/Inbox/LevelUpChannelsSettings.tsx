import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "semantic-ui-react";
import { equals } from "ramda";
import {
  isFreeOrFreemiumPlan,
  isYearlyPlan,
} from "../../../../types/PlanSelectionType";
import { useAppDispatch, useAppSelector } from "../../../../AppRootContext";
import { post } from "../../../../api/apiRequest";
import { POST_STRIPE_CHECKOUT_V2 } from "../../../../api/apiPath";
import styles from "./LevelUpChannelsSettings.module.css";
import { useAccessRulesGuard } from "component/Settings/hooks/useAccessRulesGuard";
import { useSettingsStripeCheckout } from "api/User/useSettingsStipeCheckout";
import { useHistory } from "react-router";
import useRouteConfig from "config/useRouteConfig";

export default function LevelUpChannelsSettings() {
  const currentPlan = useAppSelector((s) => s.currentPlan, equals);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();
  const history = useHistory();
  const { routeTo } = useRouteConfig();
  const accessRulesGuard = useAccessRulesGuard();
  const isResellerClient = accessRulesGuard.isResellerClient();
  const loginDispatch = useAppDispatch();
  const {
    stripePlans,
    loading: stripePlansLoading,
    publicKey,
  } = useSettingsStripeCheckout(currentPlan.currency);
  const handleUpgrade = async () => {
    if (isResellerClient) {
      loginDispatch({
        type: "IS_DISPLAY_UPGRADE_PLAN_MODAL",
        isDisplayUpgradePlanModal: true,
      });
      return;
    }
    if (isFreeOrFreemiumPlan(currentPlan)) {
      return history.push(routeTo("/settings/plansubscription"));
    }
    const nextPlan = isYearlyPlan(currentPlan)
      ? stripePlans?.mainSubscriptionPlans?.yearly.premium.id
      : stripePlans?.mainSubscriptionPlans?.monthly.premium.id;
    if (publicKey && nextPlan) {
      try {
        setIsLoading(true);
        const result = await post(POST_STRIPE_CHECKOUT_V2, {
          param: {
            subscriptionItems: [
              {
                planId: nextPlan,
              },
            ],
          },
        });
        const stripe = window.Stripe(publicKey);
        if (stripe) {
          stripe.redirectToCheckout({
            sessionId: result.id,
          });
        }
      } catch (e) {
        console.error(`handleUpgrade error: ${e}`);
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.title}>
        {t("settings.inbox.channels.LevelUpChannelsSettings.title")}
      </div>
      <div className={styles.description}>
        {t("settings.inbox.channels.LevelUpChannelsSettings.description")}
      </div>
      <div className={styles.buttonWrap}>
        <Button
          primary
          onClick={handleUpgrade}
          loading={stripePlansLoading || isLoading}
        >
          {t("settings.inbox.channels.LevelUpChannelsSettings.button")}
        </Button>
      </div>
    </div>
  );
}
