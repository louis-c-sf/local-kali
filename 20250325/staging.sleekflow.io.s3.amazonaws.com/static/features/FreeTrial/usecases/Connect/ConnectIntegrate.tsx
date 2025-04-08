import React, { useEffect } from "react";
import { PostLogin } from "component/Header";
import Helmet from "react-helmet";
import { Trans, useTranslation } from "react-i18next";
import { useHistory, useLocation, useParams } from "react-router";
import { equals } from "ramda";
import { Image } from "semantic-ui-react";
import styles from "./ConnectIntegrate.module.css";
import { FreeTrialHubDict } from "../../modules/types";
import SalesforceLogo from "../../../Salesforce/assets/salesforce-logo.svg";
import HubspotLogo from "../../../../assets/images/channels/hubspot-logo.svg";
import ConnectLine from "../../../../assets/images/channels/connect-line.svg";
import SleekflowLogo from "../../../../assets/images/channels/sleekflow-logo.svg";
import { Button } from "component/shared/Button/Button";
import moment from "moment";
import useRouteConfig from "config/useRouteConfig";
import { useAppSelector } from "AppRootContext";
import { isFreeOrFreemiumPlan } from "../../../../types/PlanSelectionType";
import { getWhatsAppSupportUrl } from "../../../../utility/getWhatsAppSupportUrl";
import TickIcon from "../../../../assets/images/icons/tick-circle.svg";

const ConnectIntegrate = () => {
  const { t } = useTranslation();
  const isSalesforceCrmEnabled = useAppSelector(
    (s) => s.company?.addonStatus?.isSalesforceCrmEnabled
  );
  const isHubspotCrmEnabled = useAppSelector(
    (s) => s.company?.addonStatus?.isHubspotIntegrationEnabled
  );
  const currentPlan = useAppSelector((s) => s.currentPlan, equals);
  const location = useLocation<{
    isPaymentSuccess: boolean;
    quantity: number;
  }>();
  const history = useHistory();
  const { routeTo } = useRouteConfig();
  const { commerceHub } = useParams<{
    commerceHub: string;
  }>();
  const pageTitle =
    commerceHub === FreeTrialHubDict.additionalStaff
      ? t("nav.accountAdded.title")
      : t("nav.connectIntegrate.title");
  const isPaymentSuccess = location.state?.isPaymentSuccess ?? false;
  const quantity = location.state?.quantity ?? false;
  const firstUpperType =
    commerceHub.charAt(0).toUpperCase() + commerceHub.slice(1);
  const endDate =
    commerceHub === FreeTrialHubDict.additionalStaff
      ? moment().add(91, "days").format("DD MMM,y")
      : moment().add(31, "days").format("DD MMM,y");
  const handleConnect = () => {
    if (commerceHub === FreeTrialHubDict.salesforce) {
      if (isSalesforceCrmEnabled) {
        history.push(routeTo("/onboarding/salesforce"));
        return;
      } else {
        if (isFreeOrFreemiumPlan(currentPlan)) {
          window.open(
            getWhatsAppSupportUrl(
              t(
                "settings.plan.addOn.integrationFeatures.salesforceCRMIntegration.consultUsMessage"
              )
            ),
            "_blank"
          );
          return;
        } else {
          history.push(routeTo("/free-trial/intro/salesforce"));
          return;
        }
      }
    } else {
      if (isHubspotCrmEnabled) {
        history.push(routeTo("/onboarding/hubspot"));
        return;
      } else {
        if (isFreeOrFreemiumPlan(currentPlan)) {
          window.open(
            getWhatsAppSupportUrl(
              t(
                "settings.plan.addOn.integrationFeatures.hubspotIntegration.consultUsMessage"
              )
            ),
            "_blank"
          );
          return;
        } else {
          history.push(routeTo("/free-trial/intro/hubspot"));
          return;
        }
      }
    }
  };

  const handleInvite = () => {
    console.log("handleInvite: ");
    history.push({
      pathname: routeTo("/settings/usermanagement"),
      state: {
        openInviteUserModal: true,
      },
    });
  };

  useEffect(() => {
    if (!isPaymentSuccess) {
      history.push(routeTo("/error/unexpected"));
    }
  }, [isPaymentSuccess]);

  useEffect(() => {
    if (
      ![
        FreeTrialHubDict.salesforce,
        FreeTrialHubDict.hubspot,
        FreeTrialHubDict.additionalStaff,
      ].includes(commerceHub as FreeTrialHubDict)
    ) {
      history.push(routeTo("/error/unexpected"));
    }
  }, [commerceHub, history, routeTo]);

  return (
    <div className={`post-login ${styles.container}`}>
      <PostLogin selectedItem={""} />
      <Helmet title={pageTitle} />
      <div className={`${styles.main} main`}>
        <div className={styles.box}>
          <header>
            {commerceHub === FreeTrialHubDict.additionalStaff ? (
              <Image src={TickIcon} />
            ) : (
              <>
                {commerceHub === FreeTrialHubDict.salesforce ? (
                  <Image src={SalesforceLogo} />
                ) : (
                  <Image className={styles.hubspotLogo} src={HubspotLogo} />
                )}
                <Image src={ConnectLine} />
                <Image src={SleekflowLogo} />
              </>
            )}
          </header>
          <div className={styles.title}>
            {commerceHub === FreeTrialHubDict.additionalStaff ? (
              t("channels.freeTrial.accountAdded.title", {
                quantity,
              })
            ) : (
              <Trans
                i18nKey="channels.freeTrial.connect.title"
                values={{
                  platform: firstUpperType,
                }}
              >
                Continue to set up your {firstUpperType} integration
              </Trans>
            )}
          </div>
          <div className={styles.subTitle}>
            {commerceHub === FreeTrialHubDict.additionalStaff ? (
              t("channels.freeTrial.accountAdded.subTitle", {
                quantity,
                endDate,
              })
            ) : (
              <Trans
                i18nKey="channels.freeTrial.connect.subTitle"
                values={{
                  platform: firstUpperType,
                  endDate,
                }}
              >
                You’ve started your 1-month free trial for {firstUpperType}{" "}
                integration. Your free trial ends on {endDate}.
              </Trans>
            )}
          </div>
          <div className={styles.description}>
            {commerceHub === FreeTrialHubDict.additionalStaff ? (
              t("channels.freeTrial.accountAdded.description")
            ) : (
              <Trans
                i18nKey="channels.freeTrial.connect.description"
                values={{
                  platform: firstUpperType,
                  endDate,
                }}
              >
                Click ‘Connect now’ to complete connecting your {firstUpperType}{" "}
                CRM to SleekFlow. You can also connect later under Channels or
                manage this subscription under Settings Payments & Subscription
                Billing.
              </Trans>
            )}
          </div>
          <Button
            primary
            content={
              commerceHub === FreeTrialHubDict.additionalStaff
                ? t("channels.freeTrial.accountAdded.button")
                : t("channels.freeTrial.connect.button")
            }
            onClick={
              commerceHub === FreeTrialHubDict.additionalStaff
                ? handleInvite
                : handleConnect
            }
          />
        </div>
      </div>
    </div>
  );
};

export default ConnectIntegrate;
