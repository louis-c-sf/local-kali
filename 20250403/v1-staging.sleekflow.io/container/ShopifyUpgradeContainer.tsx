import React from "react";
import Helmet from "react-helmet";
import { useTranslation } from "react-i18next";
import { PostLogin } from "../component/Header";
import ShopifyUpgrade from "../component/Shopify/ShopifyUpgrade";

function ShopifyUpgradeContainer() {
  const { t } = useTranslation();
  return (
    <div className="post-login">
      <Helmet
        title={t("nav.common.title", { page: t("nav.shopify.pageTitle") })}
      />
      <PostLogin selectedItem={""} />
      <ShopifyUpgrade />
    </div>
  );
}

export default ShopifyUpgradeContainer;
