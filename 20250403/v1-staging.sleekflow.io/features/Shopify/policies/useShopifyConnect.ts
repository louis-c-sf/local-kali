import { onClickRedirectToStripe } from "component/Settings/SettingPlanSubscription/SettingPlanUtils";
import { useSettingsSubscriptionPlan } from "component/Settings/SettingPlanSubscription/hooks/useSettingsSubscriptionPlan";
import {
  isYearlyPlan,
  isProPlan,
  isFreemiumPlan,
} from "types/PlanSelectionType";
import { useAppSelector } from "AppRootContext";
import { equals } from "ramda";
import { useTranslation } from "react-i18next";
import { useFlashMessageChannel } from "component/BannerMessage/flashBannerMessage";
import useRouteConfig from "config/useRouteConfig";
import { useAccessRulesGuard } from "component/Settings/hooks/useAccessRulesGuard";
import React from "react";
import { useHistory } from "react-router";
import { useFeaturesGuard } from "component/Settings/hooks/useFeaturesGuard";
import fetchShopifyOwner from "api/Company/fetchShopifyOwner";
import createShopifyOwner from "api/Company/postShopfiyOwner";
import useFetchCompany from "api/Company/useFetchCompany";
import postSubscribeShopifyPlan from "api/Shopify/postSubscribeShopifyPlan";
import { SELECTED_PLAN_STORAGE_KEY } from "container/ShopifyRedirect";
import { fetchShopifySubscriptionStatus } from "api/Company/fetchShopifySubscriptionStatus";
import { ExcludedAddOn } from "component/Settings/SettingPlanSubscription/SettingPlan/SettingPlan";

import {
  StripeCheckoutCoreFeatures,
  StripeCheckoutIntegrationFeatures,
} from "api/User/useSettingsStipeCheckout";

export const SHOPIFY_CONNECT_ROUTE = "/onboarding/shopify";

export function useShopifyConnect(props: {
  setLoading?: React.Dispatch<React.SetStateAction<boolean>>;
  addOnPlans?:
    | {
        coreFeatures: StripeCheckoutCoreFeatures;
        integrationFeatures: StripeCheckoutIntegrationFeatures;
      }
    | undefined;
  stripePublicKey: string | undefined;
}) {
  const { t } = useTranslation();
  const { addOnPlans, stripePublicKey } = props;
  const flash = useFlashMessageChannel();
  const { routeTo } = useRouteConfig();
  const accessRulesGuard = useAccessRulesGuard();
  const history = useHistory();
  const featuresGuard = useFeaturesGuard();
  // const { stripePublicKey, stripePlans } = useSettingsSubscriptionPlan();
  const currentPlan = useAppSelector((s) => s.currentPlan, equals);
  const { company } = useFetchCompany();
  const shopifyPlan =
    addOnPlans?.integrationFeatures[
      isYearlyPlan(currentPlan) ? "yearly" : "monthly"
    ][isProPlan(currentPlan) ? "pro" : "premium"].shopifyIntegration;

  let shopifyPlanId = shopifyPlan?.id;
  async function updateShopifySubscriptionPlan() {
    const foundBillRecords = company?.billRecords.filter(ExcludedAddOn) ?? [];
    const [currentBillRecord] = foundBillRecords;
    const currentSubscriptionPlan = currentBillRecord.subscriptionPlan;
    const plan = isFreemiumPlan(currentSubscriptionPlan)
      ? localStorage.getItem(SELECTED_PLAN_STORAGE_KEY) ??
        currentSubscriptionPlan.id
      : currentSubscriptionPlan.id;
    const postSubscribeShopifyPlanRes = await postSubscribeShopifyPlan(plan);
    window.location.href = postSubscribeShopifyPlanRes.url;
  }
  async function updateBillingOwner({
    selectedShopifyId,
  }: {
    selectedShopifyId?: number;
  }) {
    if (featuresGuard.isShopifyAccount()) {
      try {
        const billingOwnerResp = await fetchShopifyOwner();
        const result = await fetchShopifySubscriptionStatus();
        if (!result.subscriptionStatus) {
          await updateShopifySubscriptionPlan();
        }
        if (!billingOwnerResp.shopifyConfigId) {
          const [firstShopify] = company?.shopifyConfigs ?? [];
          if (firstShopify) {
            await createShopifyOwner(`${firstShopify.id}`);
            await updateShopifySubscriptionPlan();
          }
        }
        if (selectedShopifyId) {
          history.push(routeTo(`/sync-shopify/${selectedShopifyId}`));
        } else {
          history.push(routeTo(SHOPIFY_CONNECT_ROUTE));
        }
      } catch (e) {
        if (company?.id) {
          const [firstShopify] = company.shopifyConfigs ?? [];
          if (firstShopify) {
            await createShopifyOwner(`${firstShopify.id}`);
            await updateShopifySubscriptionPlan();
          }
        }
      }
    }
  }
  function start() {
    if (!shopifyPlanId || !stripePublicKey) {
      return;
    }
    if (featuresGuard.isShopifyAccount()) {
      updateBillingOwner({ selectedShopifyId: undefined });
    } else if (
      shopifyPlanId &&
      accessRulesGuard.isShopifyNeedToPay() &&
      props.setLoading
    ) {
      onClickRedirectToStripe({
        setLoading: props.setLoading,
        t,
        flash,
        planId: shopifyPlanId,
        stripePublicKey,
        quantity: 1,
      });
    } else {
      history.push(routeTo(SHOPIFY_CONNECT_ROUTE));
    }
  }

  return { start, updateBillingOwner };
}
