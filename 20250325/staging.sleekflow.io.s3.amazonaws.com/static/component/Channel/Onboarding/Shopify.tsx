import { TFunction } from "i18next";
import React from "react";
import Helmet from "react-helmet";
import { useTranslation } from "react-i18next";
import { PostLogin } from "../../Header";
import { Button } from "semantic-ui-react";
import { useHistory } from "react-router-dom";
import ShopifyImg from "./assets/shopify/shopify.svg";
import useRouteConfig from "../../../config/useRouteConfig";
import { BackLink } from "component/shared/nav/BackLink";
import useFetchCompany from "api/Company/useFetchCompany";
import { ShopifyCustomOnboarding } from "./ShopifyCustomOnboarding";

function ShopifyOnboarding() {
  const { t } = useTranslation();
  const history = useHistory();
  const { routeTo } = useRouteConfig();

  const handleBack = () => {
    history.push(routeTo("/channels"));
  };
  const { company } = useFetchCompany();
  const WhatYouNeedItems = (t: TFunction) => {
    return [
      t("onboarding.shopify.whatYouNeed1"),
      t("onboarding.shopify.whatYouNeed2"),
      t("onboarding.shopify.whatYouNeed3"),
      t("onboarding.shopify.whatYouNeed4"),
      t("onboarding.shopify.whatYouNeed5"),
    ];
  };
  if (!company?.isShopifyAccount) {
    return <ShopifyCustomOnboarding />;
  }
  return (
    <div className="post-login">
      <Helmet title={t("onboarding.shopify.pageTitle")} />
      <PostLogin selectedItem={""} />
      <div className="main instagram-container full-width">
        <div className="wrapper">
          <div className="content-container">
            <div className="nav-container">
              <BackLink onClick={handleBack}>
                {t("onboarding.ig.backToChannels")}
              </BackLink>
            </div>
            <div className="sub-container">
              <div className="header-with-img row">
                <div>
                  <img src={ShopifyImg} alt="" />
                </div>
                <div className="header-text">
                  <div className="h3">{t("onboarding.shopify.getStarted")}</div>
                  <div>{t("onboarding.shopify.description")}</div>
                </div>
              </div>
              <div className="row">
                <div className="h3 with-margin">
                  {t("onboarding.shopify.setup")}
                </div>
                <div>{t("onboarding.shopify.setupDescription")}</div>
              </div>
              <div className="row">
                <div className="h3 with-margin">
                  {t("onboarding.ig.whatYouNeed")}
                </div>
                <div>
                  {WhatYouNeedItems(t).map((i: any) => (
                    <div className="checklist">
                      <svg
                        width="18"
                        height="16"
                        viewBox="0 0 18 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                          d="M15.6979 4.81772L6.7201 13.9199C6.41788 14.2399 5.90233 14.2399 5.6001 13.9199L1.90233 10.1333C1.6001 9.81328 1.6001 9.3155 1.90233 8.9955C2.20455 8.6755 2.7201 8.6755 3.02233 8.9955L6.16899 12.2133L14.5957 3.67994C14.8979 3.35994 15.4134 3.35994 15.7157 3.67994C16.0179 3.99994 16.0179 4.49772 15.6979 4.81772Z"
                          fill="#6078FF"
                        />
                      </svg>
                      <div>{i}</div>
                    </div>
                  ))}
                </div>
              </div>
              <Button
                className="ui button primary full-button"
                onClick={() =>
                  window.open(
                    "https://apps.shopify.com/sleekflow",
                    "_blank",
                    "noopener, noreferrer"
                  )
                }
              >
                {t("onboarding.ig.start")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShopifyOnboarding;
