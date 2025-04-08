import { useTranslation } from "react-i18next";
import { Button } from "../../../shared/Button/Button";
import styles from "./ChangePlanButton.module.css";
import React, { useState } from "react";
import { useFlashMessageChannel } from "../../../BannerMessage/flashBannerMessage";
import { onClickRedirectToStripe } from "../SettingPlanUtils";
import {
  isFreeOrFreemiumPlan,
  PlanType,
} from "../../../../types/PlanSelectionType";
import { useFeaturesGuard } from "component/Settings/hooks/useFeaturesGuard";
import { parseHttpError } from "api/apiRequest";
import { fetchShopifySubscriptionStatus } from "api/Company/fetchShopifySubscriptionStatus";
import postSubscribeShopifyPlan from "api/Shopify/postSubscribeShopifyPlan";
import fetchShopifyOwner from "api/Company/fetchShopifyOwner";
import { useHistory } from "react-router";
import useRouteConfig from "config/useRouteConfig";
import { useAppSelector } from "AppRootContext";
import createShopifyOwner from "api/Company/postShopfiyOwner";

export const ChangePlanButton = ({
  plan,
  currentPlan,
  planInterval,
  planId,
  stripePublicKey,
}: {
  planId: string | undefined;
  stripePublicKey: string | undefined;
  plan: string;
  currentPlan: PlanType;
  planInterval: "yearly" | "monthly";
}) => {
  const { t } = useTranslation();
  const [buttonLoading, setButtonLoading] = useState(false);
  const flash = useFlashMessageChannel();
  const featureGuard = useFeaturesGuard();
  const history = useHistory();
  const { routeTo } = useRouteConfig();
  const [firstShopify] = useAppSelector((s) => s.company?.shopifyConfigs ?? []);
  if (plan === "free" && !isFreeOrFreemiumPlan(currentPlan)) {
    return null;
  }

  if (currentPlan.id.includes(plan) && isFreeOrFreemiumPlan(currentPlan)) {
    return (
      <Button centerText className={styles.changePlanButton} disabled>
        {t("settings.plan.subscriptions.currentPlan")}
      </Button>
    );
  }

  if (currentPlan.id.includes(plan) && currentPlan.id.includes(planInterval)) {
    return (
      <Button centerText className={styles.changePlanButton} disabled>
        {t("settings.plan.subscriptions.currentPlan")}
      </Button>
    );
  }

  const handleShopifySubscription = async () => {
    if (!planId) {
      return;
    }
    try {
      setButtonLoading(true);
      const billingOwnerResp = await fetchShopifyOwner();
      if (!featureGuard.isShopifyStoreExist()) {
        return history.push(routeTo("/onboarding/shopify"));
      }
      if (!billingOwnerResp.shopifyConfigId && firstShopify) {
        await createShopifyOwner(`${firstShopify.id}`);
      }
      const subscriptionStatusRes = await fetchShopifySubscriptionStatus();
      const res = await postSubscribeShopifyPlan(
        planId,
        subscriptionStatusRes.subscriptionStatus
      );
      if (res?.url) {
        window.location.href = res.url;
        return;
      }
    } catch (e) {
      console.error("handleShopifySubscription e: ", e);
      const error = parseHttpError(e);
      flash(error);
    } finally {
      setButtonLoading(false);
    }
  };
  const handleClick = () => {
    featureGuard.isShopifyAccount()
      ? handleShopifySubscription()
      : onClickRedirectToStripe({
          setLoading: setButtonLoading,
          flash,
          planId,
          stripePublicKey,
          t,
        });
  };

  return (
    <Button
      disabled={buttonLoading}
      onClick={handleClick}
      primary
      centerText
      loading={buttonLoading}
      className={styles.changePlanButton}
    >
      {t("settings.plan.subscriptions.changePlan")}
    </Button>
  );
};
