import { TFunction } from "i18next";
import React, { useEffect, useState } from "react";
import Helmet from "react-helmet";
import { Trans, useTranslation } from "react-i18next";
import { PostLogin } from "../../../component/Header";
import { GET_COMPANY_INSTAGRAM_CONNECTIONURL } from "../../../api/apiPath";
import { Button, Checkbox } from "semantic-ui-react";
import { useHistory, useLocation } from "react-router-dom";
import { get } from "../../../api/apiRequest";
import { useAppSelector } from "../../../AppRootContext";
import IgImg from "../../../assets/images/onboarding/ig.png";
import IgMsgImg from "../../../assets/images/onboarding/ig-msg.png";
import IgFbImg from "../../../assets/images/onboarding/ig-fb.png";
import IgBoxImg from "../../../assets/images/onboarding/ig-box.png";
import useRouteConfig from "../../../config/useRouteConfig";
import { Step, Stepper } from "react-form-stepper";
import styled from "styled-components";
import StatusAlert from "../../../component/shared/StatusAlert";
import { pick } from "ramda";
import { BackLink } from "../../shared/nav/BackLink";
import { useFacebookLogin } from "features/Facebook/helper/useFacebookLogin";

const FollowersContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
`;

interface FollowersTabProps {
  isActive: boolean;
}

const FollowersTab = styled.div<FollowersTabProps>`
  flex: 1;
  display: flex;
  justify-content: center;
  padding: 14px 8px;
  user-select: none;
  font-weight: 500;
  color: ${(props: any) => (props.isActive ? "#6078ff" : "#3c4257")};
  background: white;
  border: ${(props: any) =>
    props.isActive ? "1px solid #6078ff" : "1px solid #eaeaea"};
  cursor: pointer;

  :first-child {
    border-radius: 5px 0px 0px 5px;
  }

  :last-child {
    border-radius: 0px 5px 5px 0px;
  }
`;

export const StepsStyleConfig = {
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

const WhatYouNeedItems = (t: TFunction) => {
  return [
    t("onboarding.ig.whatYouNeed1"),
    t("onboarding.ig.whatYouNeed2"),
    t("onboarding.ig.whatYouNeed3"),
    t("onboarding.ig.whatYouNeed4"),
  ];
};

const EnableItems = (t: TFunction) => {
  return [
    t("onboarding.ig.howTo1"),
    t("onboarding.ig.howTo2"),
    t("onboarding.ig.howTo3"),
  ];
};

interface LocationProps {
  success: boolean;
  failed: boolean;
}

function InstagramOnboarding() {
  const { t } = useTranslation();
  const history = useHistory();
  const { routeTo } = useRouteConfig();
  const [getStarted, setGetStarted] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [haveIgBusiness, setHaveIgbusiness] = useState(false);
  const [connectedFb, setConnectedFb] = useState(false);
  const [enabledMessage, setEnabledMessage] = useState(false);
  const location = useLocation<LocationProps>();
  const [failedFb, setFailedFb] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAppSelector(pick(["user"]));
  const facebookLogin = useFacebookLogin({
    updateEvent: (token: string) => {
      history.push({
        pathname: "/instagram/connect",
        search: new URLSearchParams({ code: token }).toString(),
      });
    },
  });
  async function getFacebookRedirectInfo() {
    setIsLoading(true);
    try {
      facebookLogin.handleClick({
        type: "instagramConnect",
      });
    } catch (e) {
      console.error(`getFacebookRedirectInfo error ${e}`);
    }
  }

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

  useEffect(() => {
    if (location.state?.failed) {
      setGetStarted(true);
      setFailedFb(true);
      setActiveStep(4);
    }
  }, [location]);

  const steps = [
    {
      render: () => (
        <div className="sub-container">
          <div className="header-with-img row">
            <div>
              <img src={IgImg} alt="" />
            </div>
            <div className="header-text">
              <div className="h3">{t("onboarding.ig.igBusiness")}</div>
              <div>{t("onboarding.ig.igBusinessText")}</div>
            </div>
          </div>
          <div className="checkbox-container row">
            <Checkbox
              checked={haveIgBusiness}
              label={t("onboarding.ig.haveIgBusiness")}
              onChange={() => setHaveIgbusiness(!haveIgBusiness)}
            />
          </div>
          <div className="row">
            <Trans i18nKey="onboarding.ig.notBusiness">
              Not a business account? Update your account by
              <a
                className="link"
                href="https://docs.sleekflow.io/messaging-channels/instagram/convert_business_ig"
                rel="noopener noreferrer"
                target="_blank"
              >
                following these steps
              </a>
              , note that you will need a Facebook page and admin access.
            </Trans>
          </div>
          <Button
            className="ui button primary full-button"
            disabled={!haveIgBusiness}
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
              <img src={IgFbImg} style={{ width: 90, height: "auto" }} alt="" />
            </div>
            <div className="header-text">
              <div className="h3">{t("onboarding.ig.connectToFb")}</div>
              <div>{t("onboarding.ig.connectToFbText")}</div>
            </div>
          </div>
          <div className="checkbox-container row">
            <Checkbox
              checked={connectedFb}
              label={t("onboarding.ig.understand")}
              onChange={() => setConnectedFb(!connectedFb)}
            />
          </div>
          <div className="row">
            <Trans i18nKey="onboarding.ig.howToFb">
              Don’t have access? Please contact your Facebook admin to proceed.
              Not sure how to link a Facebook page?
              <a
                className="link"
                href="https://docs.sleekflow.io/messaging-channels/instagram/connect_ig_fbpage"
                target="_blank"
                rel="noopener noreferrer"
              >
                Learn how here
              </a>
              .
            </Trans>
          </div>
          <Button
            className="ui button primary full-button"
            disabled={!connectedFb}
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
                src={IgMsgImg}
                style={{ width: 212, height: "auto" }}
                alt=""
              />
            </div>
            <div className="header-text">
              <div className="h3">{t("onboarding.ig.enableMsg")}</div>
              <div>{t("onboarding.ig.enableMsgText")}</div>
            </div>
          </div>
          <div className="h3 with-margin">{t("onboarding.ig.howToEnable")}</div>
          <div className="row">
            {EnableItems(t).map((i: any) => (
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
          <div className="checkbox-container row">
            <Checkbox
              checked={enabledMessage}
              label={t("onboarding.ig.enableMsgCheckbox")}
              onChange={() => setEnabledMessage(!enabledMessage)}
            />
          </div>
          <div className="row">
            <Trans i18nKey="onboarding.ig.stillNotSure">
              Still not sure where to find this setting? Check step-by-step
              guide
              <a
                className="link"
                href="https://docs.sleekflow.io/messaging-channels/instagram/allow-access-to-messages"
                target="_blank"
                rel="noopener noreferrer"
              >
                here
              </a>
              .
            </Trans>
          </div>
          <Button
            className="ui button primary full-button"
            disabled={!enabledMessage}
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
                src={IgBoxImg}
                style={{ width: 200, height: "auto" }}
                alt=""
              />
            </div>
            <div className="header-text">
              <div className="h3 with-margin">
                {t("onboarding.ig.connectWithSleekflow")}
              </div>
              <div>{t("onboarding.ig.connectWithSleekflowText")}</div>
            </div>
          </div>
          {failedFb ? (
            <div className="row">
              <StatusAlert type="warning">
                {t("onboarding.ig.failedFb")}
              </StatusAlert>
            </div>
          ) : (
            ""
          )}
          <Button
            className="ui button primary full-button"
            disabled={isLoading}
            loading={isLoading}
            onClick={() => getFacebookRedirectInfo()}
          >
            {t("onboarding.ig.install")}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="post-login">
      <Helmet title={t("onboarding.ig.pageTitle")} />
      <PostLogin selectedItem={""} />
      <div className="main instagram-container">
        <div>
          <div className="nav-container">
            <BackLink onClick={handleBack}>
              {getStarted
                ? t("onboarding.ig.back")
                : t("onboarding.ig.backToChannels")}
            </BackLink>
          </div>
          {!location.state?.success ? (
            !getStarted ? (
              <div className="sub-container">
                <div className="header-with-img row">
                  <div>
                    <img src={IgImg} alt="" />
                  </div>
                  <div className="header-text">
                    <div className="h3">{t("onboarding.ig.getStarted")}</div>
                    <div>{t("onboarding.ig.connectToIg")}</div>
                  </div>
                </div>
                <div className="row">
                  <div className="h3 with-margin">
                    {t("onboarding.ig.toUseIg")}
                  </div>
                  <div>{t("onboarding.ig.toUseIgText")}</div>
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
                </Stepper>
                {steps[activeStep - 1].render()}
              </>
            )
          ) : (
            <div className="sub-container">
              <div className="header-with-img row">
                <div>
                  <img
                    src={IgBoxImg}
                    style={{ width: 200, height: "auto" }}
                    alt=""
                  />
                </div>
                <div className="header-text">
                  <div className="success-msg h3 row">
                    {t("onboarding.ig.success")}
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M11.9819 23.9638C18.5993 23.9638 23.9638 18.5993 23.9638 11.9819C23.9638 5.36447 18.5993 0 11.9819 0C5.36447 0 0 5.36447 0 11.9819C0 18.5993 5.36447 23.9638 11.9819 23.9638Z"
                        fill="#29BB4F"
                      />
                      <path
                        d="M18.2956 5.63672L9.82525 14.1071L5.66891 9.95088L3.55859 12.0609L9.82525 18.3277L20.4059 7.74672L18.2956 5.63672Z"
                        fill="#EBF0F3"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="row">{t("onboarding.ig.allSet")}</div>
                    <div>{t("onboarding.ig.allSetText")}</div>
                  </div>
                </div>
              </div>
              <Button
                className="ui button primary full-button"
                onClick={() => history.push(routeTo(`/inbox/${user.id}`))}
              >
                {t("onboarding.ig.goToInbox")}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default InstagramOnboarding;
