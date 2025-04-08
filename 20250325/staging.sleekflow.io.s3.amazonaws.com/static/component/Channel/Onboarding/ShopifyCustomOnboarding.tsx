import useRouteConfig from "config/useRouteConfig";
import { Trans, useTranslation } from "react-i18next";
import { useHistory, useLocation } from "react-router";
import React, { useState } from "react";
import {
  GET_SHOPIFY_USAGE,
  POST_SHOPIFY_PRIVATE_APP,
} from "../../../api/apiPath";
import { TFunction } from "i18next";
import { get, postWithExceptions } from "api/apiRequest";
import { Button, Checkbox, Input, Step } from "semantic-ui-react";
import ShopifyImg from "./assets/shopify/shopify.svg";
import styles from "./ShopifyCustomOnboarding.module.css";
import StatusAlert from "component/shared/StatusAlert";
import CreateShopifyImg from "./assets/shopify/create-private-app.svg";
import ShopifyPasswordImg from "./assets/shopify/shopify-password.svg";
import ConnectShopifyImg from "./assets/shopify/connect-private-app.svg";
import SyncShopify from "component/Shopify/SyncShopify";
import Helmet from "react-helmet";
import { PostLogin } from "component/Header";
import { BackLink } from "component/shared/nav/BackLink";
import { Stepper } from "react-form-stepper";

const WhatYouNeedItems = (t: TFunction) => {
  return [
    t("onboarding.shopify.whatYouNeed1"),
    t("onboarding.shopify.whatYouNeed2"),
    t("onboarding.shopify.whatYouNeed3"),
    t("onboarding.shopify.whatYouNeed4"),
    t("onboarding.shopify.whatYouNeed5"),
  ];
};

const FirstTimeCustomAppItems = (t: TFunction) => {
  return [
    <Trans i18nKey="onboarding.shopify.enableStep1">
      Go to Shopify Admin Page
    </Trans>,
    <Trans i18nKey="onboarding.shopify.enableStep2">
      Go to <b>Apps</b> from the left navigation bar
    </Trans>,
    <Trans i18nKey="onboarding.shopify.enableStep3">
      Go to <b>Develop Apps</b> at the bottom
    </Trans>,
    <Trans i18nKey="onboarding.shopify.enableStep4">
      Allow <b>Custom App Development</b>
    </Trans>,
    <Trans i18nKey="onboarding.shopify.enableStep5">
      Press <b>Allow Custom App Development</b> again
    </Trans>,
  ];
};

const CreatedPrivateAppItems = (t: TFunction) => {
  return [
    <Trans i18nKey="onboarding.shopify.enableStep1">
      Go to Shopify Admin Page
    </Trans>,
    <Trans i18nKey="onboarding.shopify.enableStep2">
      Go to <b>Apps</b> from the left navigation bar
    </Trans>,
    <Trans i18nKey="onboarding.shopify.createdBeforeEnableStep3">
      Click <b>Develop Apps</b> at top right corner
    </Trans>,
  ];
};
export function ShopifyCustomOnboarding() {
  const CreatePrivateAppItems = () => {
    return [
      <Trans i18nKey="onboarding.shopify.createStep1">
        Go to <b>Apps</b> <b>Develop apps</b> <b>Create an app</b>
      </Trans>,
      <Trans i18nKey="onboarding.shopify.createStep2">
        Fill in Custom app name as <b>SleekFlow</b>
      </Trans>,
      <Trans i18nKey="onboarding.shopify.createStep3">
        Go to <b>Overview tab</b> <b>Configure Admin API Scope</b>, then you can
        see a list of <b>Admin API access scopes</b>
      </Trans>,
      <Trans i18nKey="onboarding.shopify.createStep4">
        Enable <b>Read access</b> for <b>Products, Customers and Orders</b>
      </Trans>,
      <Trans i18nKey="onboarding.shopify.createStep5">
        Click <b>Save Button</b> at the bottom
      </Trans>,
      <Trans i18nKey="onboarding.shopify.createStep6">
        Click <b>Install App</b> at the top right corner
      </Trans>,
    ];
  };
  const { t } = useTranslation();
  const history = useHistory();
  const { routeTo } = useRouteConfig();
  const [getStarted, setGetStarted] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [haveAccount, setHaveAccount] = useState(false);
  const [createdPrivateApp, setCreatedPrivateApp] = useState("");
  const [enablePrivateApp, setEnablePrivateApp] = useState(false);
  const [setupDone, setSetupDone] = useState(false);
  const [shopUrl, setShopUrl] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [connectedShopify, setConnectedShopify] = useState<any>("");
  const [shopifyUsageInfo, setShopifyUsageInfo] = useState<any>("");

  const handleConnectPrivateApp = async (shop: string, password: string) => {
    setIsLoading(true);
    try {
      const shopifyRes = await postWithExceptions(POST_SHOPIFY_PRIVATE_APP, {
        param: {
          Shop: shop.replace(/(^\w+:|^)\/\//, ""),
          PrivateAppPassword: password,
        },
      });
      const shopifyUsage = await get(
        GET_SHOPIFY_USAGE.replace("{shopifyId}", shopifyRes.id),
        {
          param: {},
        }
      );

      setShopifyUsageInfo(shopifyUsage);
      setConnectedShopify(shopifyRes);
      setIsLoading(false);
      setActiveStep(activeStep + 1);
    } catch (e) {
      setHasError(true);
      setIsLoading(false);
      console.error(`Shopify private app error ${e}`);
    }
  };

  function goNext() {
    setActiveStep(activeStep + 1);
  }

  const handleBack = () => {
    if (getStarted == false && activeStep <= 1) {
      history.push(routeTo("/channels"));
      return;
    }
    if (activeStep == 1) {
      setGetStarted(false);
    } else {
      setActiveStep(activeStep - 1);
    }
  };
  const StepsStyleConfig = {
    activeBgColor: "#6078ff",
    activeTextColor: "white",
    completedBgColor: "#6078ff",
    completedTextColor: "white",
    inactiveBgColor: "#e0e0e0",
    inactiveTextColor: "#ffffff",
    size: "2em",
    circleFontSize: "1em",
    labelFontSize: "16px",
    borderRadius: "50%",
    fontWeight: 500,
  };
  const steps = [
    {
      render: () => (
        <div className="sub-container">
          <div className="header-with-img row">
            <div>
              <img src={ShopifyImg} alt="" />
            </div>
            <div className="header-text">
              <div className="h3">{t("onboarding.shopify.account")}</div>
              <div>{t("onboarding.shopify.accountText")}</div>
            </div>
          </div>
          <div className="checkbox-container row">
            <Checkbox
              checked={haveAccount}
              label={t("onboarding.shopify.haveAccount")}
              onChange={() => setHaveAccount(!haveAccount)}
            />
          </div>
          <div className="bold-text">{t("onboarding.shopify.noAccount")}</div>
          <div className="row">
            <Trans i18nKey="onboarding.shopify.signup">
              Sign up for an account
              <a
                className="link"
                rel="noreferrer noopener"
                href="https://accounts.shopify.com/signup"
                target="_blank"
              >
                here
              </a>
              , . You'll need admin access to connect Shopify to SleekFlow.
            </Trans>
          </div>
          <Button
            className="ui button primary full-button"
            disabled={!haveAccount}
            onClick={() => goNext()}
          >
            {t("onboarding.ig.next")}
          </Button>
        </div>
      ),
    },
    {
      render: () => (
        <div className="sub-container">
          <div className="header-with-img row">
            <div>
              <img
                src={ConnectShopifyImg}
                style={{ width: 90, height: "auto" }}
                alt=""
              />
            </div>
            <div className="header-text">
              <div className="h3">{t("onboarding.shopify.customApp")}</div>
              <div>{t("onboarding.shopify.privateAppText")}</div>
            </div>
          </div>
          <StatusAlert type="info">
            {t("onboarding.shopify.createCustomAppOnAdmin")}
          </StatusAlert>
          <div className={styles.options}>
            <div
              className={`${styles.option} ${
                createdPrivateApp == "false" ? styles.active : ""
              }`}
              onClick={() => setCreatedPrivateApp("false")}
            >
              {t("onboarding.shopify.firstTimeCustom")}
            </div>
            <div
              className={`${styles.option} ${
                createdPrivateApp == "true" ? styles.active : ""
              }`}
              onClick={() => setCreatedPrivateApp("true")}
            >
              {t("onboarding.shopify.createdPrivate")}
            </div>
          </div>
          {createdPrivateApp == "false" ? (
            <ol className="step-list">
              {FirstTimeCustomAppItems(t).map((text) => (
                <li>{text}</li>
              ))}
            </ol>
          ) : (
            ""
          )}
          {createdPrivateApp == "true" ? (
            <ol className="step-list">
              {CreatedPrivateAppItems(t).map((text) => (
                <li>{text}</li>
              ))}
            </ol>
          ) : (
            ""
          )}
          {createdPrivateApp !== "" && (
            <div className="checkbox-container row">
              <Checkbox
                checked={enablePrivateApp}
                label={t("onboarding.shopify.setupComplete")}
                onChange={() => setEnablePrivateApp(!enablePrivateApp)}
              />
            </div>
          )}
          <div className="bold-text">{t("onboarding.shopify.notSureHow")}</div>
          <div className="row">
            <Trans i18nKey="onboarding.shopify.stepByStep">
              Check our step by step guide
              <a
                className="link"
                rel="noreferrer noopener"
                href={
                  "https://docs.sleekflow.io/app-integrations/shopify/custom-app"
                }
                target="_blank"
              >
                here
              </a>
            </Trans>
          </div>
          <Button
            className="ui button primary full-button"
            disabled={createdPrivateApp == "" || !enablePrivateApp}
            onClick={() => goNext()}
          >
            {t("onboarding.ig.next")}
          </Button>
        </div>
      ),
    },
    {
      render: () => (
        <div className="sub-container">
          <div className="header-with-img row">
            <div>
              <img
                src={CreateShopifyImg}
                style={{ width: 90, height: "auto" }}
                alt=""
              />
            </div>
            <div className="header-text">
              <div className="h3">
                {t("onboarding.shopify.createCustomApp")}
              </div>
              <div>{t("onboarding.shopify.createCustomAppText")}</div>
            </div>
          </div>
          <ol className="step-list">
            {CreatePrivateAppItems().map((text) => (
              <li>{text}</li>
            ))}
          </ol>
          <div className="checkbox-container row">
            <Checkbox
              checked={setupDone}
              label={t("onboarding.shopify.setupComplete")}
              onChange={() => setSetupDone(!setupDone)}
            />
          </div>
          <div className="bold-text">{t("onboarding.shopify.notSureHow")}</div>
          <div className="row">
            <Trans i18nKey="onboarding.shopify.stepByStep">
              Check our step by step guide
              <a
                className="link"
                rel="noreferrer noopener"
                href="https://docs.sleekflow.io/app-integrations/shopify/custom-app"
                target="_blank"
              >
                here
              </a>
            </Trans>
          </div>
          <Button
            className="ui button primary full-button"
            disabled={!setupDone}
            onClick={() => goNext()}
          >
            {t("onboarding.ig.next")}
          </Button>
        </div>
      ),
    },
    {
      render: () => (
        <div className="sub-container">
          <div className="header-with-img row">
            <div>
              <img
                src={ShopifyPasswordImg}
                style={{ width: 90, height: "auto" }}
                alt=""
              />
            </div>
            <div className="header-text">
              <div className="h3">{t("onboarding.shopify.retrieveInfo")}</div>
              <div>{t("onboarding.shopify.retrieveInfoText")}</div>
            </div>
          </div>
          {hasError && (
            <div className="full">
              <StatusAlert type="warning">
                {t("onboarding.shopify.infoError")}
              </StatusAlert>
            </div>
          )}
          <div className="bold-text">{t("onboarding.shopify.shopUrl")}</div>
          <div className="input-description">
            {t("onboarding.shopify.shopUrlText")}
          </div>
          <Input
            className="full"
            value={shopUrl}
            placeholder="e.g. sleekflow.myshopify.com"
            onChange={(_, data) => setShopUrl(data.value)}
          />
          <div className="bold-text">{t("onboarding.shopify.apiToken")}</div>

          <div className="input-description">
            <Trans i18nKey="onboarding.shopify.passwordText">
              Go to the <b>API Credentials</b> tab and copy the API access
              token. Please note the token can only be viewed <b>ONCE!</b>
            </Trans>
          </div>
          <Input
            className="full"
            value={password}
            placeholder="e.g. shpat_xxxxxxxxxxxxxxxxxxxxxxxxx"
            onChange={(_, data) => setPassword(data.value)}
          />
          <div className="full">
            <StatusAlert type="info">
              <Trans i18nKey="onboarding.shopify.apiTokenTip">
                If you failed to copy your <b>API token</b>, please reinstall
                the app and try again
              </Trans>
            </StatusAlert>
          </div>
          <div className="bold-text">{t("onboarding.shopify.notSureHow")}</div>
          <div className="row">
            <Trans i18nKey="onboarding.shopify.stepByStep">
              Check our step by step guide
              <a
                className="link"
                rel="noreferrer noopener"
                href="https://docs.sleekflow.io/app-integrations/shopify/custom-app"
                target="_blank"
              >
                here
              </a>
            </Trans>
          </div>
          <Button
            className="ui button primary full-button"
            disabled={isLoading || !shopUrl || !password}
            loading={isLoading}
            onClick={() => handleConnectPrivateApp(shopUrl, password)}
          >
            {t("onboarding.shopify.submit")}
          </Button>
        </div>
      ),
    },
    {
      render: () => (
        <SyncShopify
          shopifyUsageInfo={shopifyUsageInfo}
          connectedShopifyId={connectedShopify.id}
        />
      ),
    },
  ];

  return (
    <div className="post-login">
      <Helmet title={t("onboarding.shopify.pageTitle")} />
      <PostLogin selectedItem={""} />
      <div className="main instagram-container full-width">
        <div className="wrapper">
          <div className="content-container">
            <div className="nav-container">
              <BackLink onClick={handleBack}>
                {getStarted
                  ? t("onboarding.ig.back")
                  : t("onboarding.ig.backToChannels")}
              </BackLink>
            </div>
            {!getStarted ? (
              <div className="sub-container">
                <div className="header-with-img row">
                  <div>
                    <img src={ShopifyImg} alt="" />
                  </div>
                  <div className="header-text">
                    <div className="h3">
                      {t("onboarding.shopify.getStarted")}
                    </div>
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
                  onClick={() => setGetStarted(true)}
                >
                  {t("onboarding.ig.start")}
                </Button>
              </div>
            ) : (
              <>
                <Stepper
                  activeStep={activeStep - 1}
                  styleConfig={StepsStyleConfig}
                  className="stepper"
                >
                  <Step />
                  <Step />
                  <Step />
                  <Step />
                  <Step />
                </Stepper>
                {steps[activeStep - 1].render()}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
