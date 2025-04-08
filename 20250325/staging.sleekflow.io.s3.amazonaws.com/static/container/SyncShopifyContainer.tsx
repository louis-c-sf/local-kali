import React from "react";
import Helmet from "react-helmet";
import { useTranslation } from "react-i18next";
import { PostLogin } from "../component/Header";
import SyncShopify from "../component/Shopify/SyncShopify";

function SyncShopifyContainer() {
  const { t } = useTranslation();
  return (
    <div className="post-login">
      <Helmet
        title={t("nav.common.title", { page: t("nav.shopify.syncTitle") })}
      />
      <PostLogin selectedItem={""} />
      <div className="main">
        <div className="wrap">
          <SyncShopify />
        </div>
      </div>
    </div>
  );
}

export default SyncShopifyContainer;
