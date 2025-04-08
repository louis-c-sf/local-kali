import React from "react";
import Helmet from "react-helmet";
import { useTranslation } from "react-i18next";
import { PostLogin } from "../../Header";
import { Button } from "semantic-ui-react";
import SyncShopifyImg from "./assets/shopify/sync-shopify.png";
import { useHistory } from "react-router";

function ShopifyOnboarding() {
  const { t } = useTranslation();
  const history = useHistory();

  return (
    <div className="post-login">
      <Helmet title={t("onboarding.shopify.pageTitle")} />
      <PostLogin selectedItem={""} />
      <div className="main instagram-container">
        <div className="sub-container">
          <div className="header-with-img row">
            <div>
              <img
                src={SyncShopifyImg}
                style={{ width: 90, height: "auto" }}
                alt=""
              />
            </div>
            <div className="header-text">
              <div className="h3">{t("onboarding.shopify.syncTitle")}</div>
              <div>{t("onboarding.shopify.syncText")}</div>
            </div>
          </div>
          <div className="row">
            <div>{t("onboarding.shopify.syncTime")}</div>
            <div>{t("onboarding.shopify.syncJob")}</div>
          </div>
          <Button
            className="ui button primary full-button"
            onClick={() => history.push("/channels")}
          >
            {t("onboarding.ig.backToChannels")}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ShopifyOnboarding;
