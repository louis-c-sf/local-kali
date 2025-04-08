import React from "react";
import Auth0ErrorScreen from "App/errorBoundaries/Auth0ErrorScreen";
import { Redirect, useLocation } from "react-router";
import { useTranslation } from "react-i18next";

export function ShopifyEmailAuth() {
  const location = useLocation<{ email: string }>();
  const searchParams = new URLSearchParams(location.search);
  const { t } = useTranslation();
  if (!location.state?.email) {
    return <Redirect to="/" />;
  }
  return (
    <Auth0ErrorScreen
      // returnBtnContent={t("auth0ErrorScreen.verifyNewShopifyAccountButton")}
      emailAddress={location.state.email ?? searchParams.get("email")}
    />
  );
}
