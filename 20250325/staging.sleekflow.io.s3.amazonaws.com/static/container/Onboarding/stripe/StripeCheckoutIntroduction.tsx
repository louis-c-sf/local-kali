import React from "react";
import { Button } from "component/shared/Button/Button";
import { Image } from "semantic-ui-react";
import mainStyles from "./StripeOnboardingScreen.module.css";
import styles from "./StripeCheckoutIntroduction.module.css";
import Clock from "assets/images/message-status/clock.svg";
import StripeCircleIcon from "./StripeCircleIcon";
import TickIcon from "assets/tsx/icons/TickIcon";
import { useTranslation } from "react-i18next";
import { TFunction } from "i18next";

function getKeyFeatures(t: TFunction) {
  return [
    t("onboarding.stripe.intro.keyFeatures.paymentLink"),
    t("onboarding.stripe.intro.keyFeatures.checkoutLink"),
    t("onboarding.stripe.intro.keyFeatures.checkoutBranding"),
  ];
}

function getBenefits(t: TFunction) {
  return [
    t("onboarding.stripe.intro.benefits.lowSurcharge"),
    t("onboarding.stripe.intro.benefits.conversionRate"),
    t("onboarding.stripe.intro.benefits.trackSales"),
    t("onboarding.stripe.intro.benefits.security"),
  ];
}

export default function StripeCheckoutIntroduction({
  onClickConnect,
}: {
  onClickConnect: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className={mainStyles.contentContainer}>
      <div className={styles.topSection}>
        <div className={styles.installContainer}>
          <StripeCircleIcon />
          <div>
            <h1>{t("onboarding.stripe.intro.title")}</h1>
            <p>{t("onboarding.stripe.intro.description")}</p>
            <Button primary onClick={onClickConnect}>
              {t("onboarding.stripe.linkButton")}
            </Button>
            <div className={styles.duration}>
              <Image src={Clock} alt="Clock" />
              {t("onboarding.stripe.intro.5MinFree")}
            </div>
          </div>
        </div>
      </div>
      <div className={styles.bottomSection}>
        <div className={styles.descriptionSection}>
          <div className={styles.featuresSection}>
            <div>
              <p className={mainStyles.listTitle}>
                {t("onboarding.stripe.intro.keyFeatures.title")}
              </p>
              <ul className={mainStyles.checkList}>
                {getKeyFeatures(t).map((feature) => (
                  <li key={feature}>
                    <TickIcon /> <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className={mainStyles.listTitle}>
                {t("onboarding.stripe.intro.benefits.title")}
              </p>
              <ul className={mainStyles.checkList}>
                {getBenefits(t).map((benefit) => (
                  <li key={benefit}>
                    <TickIcon /> <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className={styles.longDescription}>
            {t("onboarding.stripe.intro.longDescription.first")}
          </p>
          <p>{t("onboarding.stripe.intro.longDescription.second")}</p>
        </div>
        <div className={styles.reminderCard}>
          <p className={mainStyles.listTitle}>
            {t("onboarding.stripe.intro.reminderCard.required.header")}
          </p>
          <ul>
            <li>
              {t(
                "onboarding.stripe.intro.reminderCard.required.proofOfBusiness"
              )}
            </li>
            <li>{t("onboarding.stripe.intro.reminderCard.required.info")}</li>
            <li>
              {t("onboarding.stripe.intro.reminderCard.required.bankAccount")}
            </li>
          </ul>
          <p className={mainStyles.listTitle}>
            {t("onboarding.stripe.intro.reminderCard.supportCurrency.header")}
          </p>
          <p>
            {t(
              "onboarding.stripe.intro.reminderCard.supportCurrency.description"
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
