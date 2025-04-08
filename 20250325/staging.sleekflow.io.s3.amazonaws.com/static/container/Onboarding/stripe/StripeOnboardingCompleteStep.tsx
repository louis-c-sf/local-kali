import React from "react";
import mainStyles from "./StripeOnboardingScreen.module.css";
import GreenTickSuccess from "../assets/GreenTickSuccess";
import styles from "./StripeOnboardingSteps.module.css";
import TrackStatus from "assets/images/onboarding/track-status.png";
import PaymentLink from "assets/images/onboarding/payment-link.png";
import ConnectShopify from "assets/images/onboarding/connect-shopify.png";
import TrackSales from "assets/images/onboarding/track-sales.png";
import { Trans, useTranslation } from "react-i18next";
import { Image } from "semantic-ui-react";
import { Link } from "react-router-dom";

const EXPLORE_FEATURES = {
  trackStatus: "trackStatus",
  paymentLink: "paymentLink",
  connectShopify: "connectShopify",
  trackSales: "trackSales",
};

export default function StripeOnboardingCompleteStep() {
  const { t } = useTranslation();

  const features = Object.values(EXPLORE_FEATURES).map((feature) => {
    if (feature === EXPLORE_FEATURES.trackStatus) {
      return {
        image: TrackStatus,
        title: t("onboarding.stripe.exploreFeatures.trackStatus.title"),
        description: (
          <Trans i18nKey="onboarding.stripe.exploreFeatures.trackStatus.description">
            Go to <Link to="/settings/paymentlink">Settings</Link> to edit the
            payment link appearance, message and manage orders.
          </Trans>
        ),
      };
    }
    if (feature === EXPLORE_FEATURES.paymentLink) {
      return {
        image: PaymentLink,
        title: t("onboarding.stripe.exploreFeatures.paymentLink.title"),
        description: (
          <Trans i18nKey="onboarding.stripe.exploreFeatures.paymentLink.description">
            Click <span>$</span> for creating custom payment link
          </Trans>
        ),
      };
    }
    if (feature === EXPLORE_FEATURES.connectShopify) {
      return {
        image: ConnectShopify,
        title: t("onboarding.stripe.exploreFeatures.connectShopify.title"),
        description: (
          <Trans i18nKey="onboarding.stripe.exploreFeatures.connectShopify.description">
            Once you've connected Shopify with SleekFlow, you can share products
            or payment links to customers on social channels. Click
            <a
              href="https://www.youtube.com/watch?v=r7jhUCFLU18"
              target="_blank"
              rel="noreferrer noopener"
            >
              here
            </a>
            to learn more about the benefits and set up process.
          </Trans>
        ),
      };
    }
    if (feature === EXPLORE_FEATURES.trackSales) {
      return {
        image: TrackSales,
        title: t("onboarding.stripe.exploreFeatures.trackSales.title"),
        description: (
          <Trans i18nKey="onboarding.stripe.exploreFeatures.trackSales.description">
            Get real-time analytics on sales performance individually and as a
            teams in <Link to="/analytics">Analytics</Link>
          </Trans>
        ),
      };
    }
    return null;
  });

  return (
    <div className={mainStyles.contentContainer}>
      <div className={styles.successSection}>
        <GreenTickSuccess />
        <h1>{t("onboarding.stripe.exploreFeatures.title")}</h1>
        <p>{t("onboarding.stripe.exploreFeatures.description")}</p>
      </div>
      <div className={styles.exploreFeatureSection}>
        {features.map(
          (feature) =>
            feature && (
              <div key={feature.title} className={styles.featureWrapper}>
                <Image src={feature.image} alt={feature.title} />
                <div>
                  <p className={styles.featureTitle}>{feature.title}</p>
                  <p>{feature.description}</p>
                </div>
              </div>
            )
        )}
      </div>
      <div className={styles.backToChannels}>
        <Link to="/channels">{t("onboarding.stripe.backToChannels")}</Link>
      </div>
    </div>
  );
}
