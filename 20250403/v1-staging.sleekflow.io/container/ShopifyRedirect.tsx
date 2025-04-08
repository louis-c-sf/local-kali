import React, { useEffect, useState } from "react";
import { Redirect, useHistory, useLocation } from "react-router";
import {
  POST_SHOPIFY_INTEGRATE_LINK,
  POST_SHOPIFY_REDIRECT_LINK,
} from "../api/apiPath";
import { post } from "../api/apiRequest";
import RedirectionPage from "./RedirectionPage";
import useRouteConfig from "config/useRouteConfig";
import useFetchCompany from "api/Company/useFetchCompany";
import { isFreemiumPlan } from "types/PlanSelectionType";
import { ExcludedAddOn } from "component/Settings/SettingPlanSubscription/SettingPlan/SettingPlan";
import { useShopifyConnect } from "features/Shopify/policies/useShopifyConnect";
import { useAuth0 } from "@auth0/auth0-react";
import { useFlashMessageChannel } from "component/BannerMessage/flashBannerMessage";
import { useTranslation } from "react-i18next";
import { useSettingsSubscriptionPlan } from "component/Settings/SettingPlanSubscription/hooks/useSettingsSubscriptionPlan";

export const SELECTED_PLAN_STORAGE_KEY = "selectedPlan";

interface ShopifyIntegrationResponseType {
  user: {
    firstName: string;
    displayName: string;
    userRole: string;
    createdAt: string;
    updatedAt: string;
    lastLoginAt: string;
    id: string;
    userName: string;
    normalizedUserName: string;
    email: string;
    normalizedEmail: string;
    emailConfirmed: boolean;
    securityStamp: string;
    concurrencyStamp: string;
    phoneNumberConfirmed: boolean;
    twoFactorEnabled: boolean;
    lockoutEnabled: boolean;
    accessFailedCount: number;
  };
  is_new_user: boolean;
}
function ShopifyRedirect() {
  const location = useLocation();
  const history = useHistory();
  const { routeTo } = useRouteConfig();
  const params = new URLSearchParams(location.search);
  const shopName = params.get("shop");
  const code = params.get("code");
  const { refreshCompany, company } = useFetchCompany();
  const { stripePublicKey, stripePlans } = useSettingsSubscriptionPlan();
  const shopifyConnect = useShopifyConnect({
    setLoading: undefined,
    addOnPlans: stripePlans?.addOnPlans,
    stripePublicKey,
  });
  const { loginWithPopup } = useAuth0();
  const { t } = useTranslation();
  const [shopifyResp, setShopifyResp] =
    useState<ShopifyIntegrationResponseType>();
  const flash = useFlashMessageChannel();
  useEffect(() => {
    if (shopifyResp || company?.id || !code || !shopName) {
      return;
    }
    async function IntegrateShopifyStore() {
      try {
        const result: ShopifyIntegrationResponseType = await post(
          POST_SHOPIFY_INTEGRATE_LINK,
          {
            param: {
              code: code,
              shop: shopName,
            },
          }
        );
        setShopifyResp(result);
        if (!result.is_new_user) {
          try {
            await loginWithPopup({
              login_hint: result.user.email,
            });
            setTimeout(async () => {
              await refreshCompany();
            }, 3000);
          } catch (e) {
            flash(t("flash.channels.subscription.shopify"));
          }
        }
      } catch (error) {
        console.error(`post POST_SHOPIFY_INTEGRATE_LINK ${error}`);
      }
    }
    IntegrateShopifyStore();
  }, [shopName, code, company?.id, shopifyResp?.user?.id]);
  useEffect(() => {
    if (!shopName) {
      return;
    }
    if (shopName && code === null) {
      post(POST_SHOPIFY_REDIRECT_LINK, {
        param: {
          UsersMyShopifyUrl: shopName,
        },
      })
        .then((res) => {
          window.location.href = res.url;
        })
        .catch((error) => {
          console.error(`post POST_SHOPIFY_REDIRECT_LINK ${error}`);
        });
    }
  }, [shopName, code]);
  useEffect(() => {
    if (!company || !shopName) {
      return;
    }
    const selectedShopify = company.shopifyConfigs?.find((config) =>
      config.usersMyShopifyUrl.includes(shopName)
    );
    const foundBillRecords = company.billRecords.filter(ExcludedAddOn) ?? [];
    const [currentBillRecord] = foundBillRecords;
    const currentPlan = currentBillRecord.subscriptionPlan;
    if (selectedShopify?.id) {
      if (
        selectedShopify.isShopifySubscriptionPaid ||
        company.isShopifyAccount
      ) {
        if (company.isShopifyAccount) {
          if (isFreemiumPlan(currentPlan)) {
            return history.push(routeTo("/settings/plansubscription"));
          }
          shopifyConnect.updateBillingOwner({
            selectedShopifyId: selectedShopify.id,
          });
        } else {
          history.push({
            pathname: routeTo(`/sync-shopify/${selectedShopify.id}`),
          });
        }
      } else {
        if (!currentPlan) {
          return;
        }
        const storedPlan = localStorage.getItem(SELECTED_PLAN_STORAGE_KEY);
        if (!storedPlan && isFreemiumPlan(currentPlan)) {
          history.push(routeTo(`/settings/plansubscription`));
          return;
        }
        history.push(routeTo("/settings/commerce"));
      }
    }
  }, [shopName, company?.id]);

  return shopifyResp?.is_new_user ? (
    <Redirect
      to={{
        state: {
          email: shopifyResp.user.email,
        },
        search: "error_description=error_new_shopify_user",
        pathname: "/company/shopify/email/auth",
      }}
    />
  ) : (
    <RedirectionPage />
  );
}

export default ShopifyRedirect;
