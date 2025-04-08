import React from "react";
import StripeLogo from "assets/images/channels/stripe.svg";
import styles from "./StripeOnboardingScreen.module.css";
import { Image } from "semantic-ui-react";

export default function StripeCircleIcon() {
  return (
    <div className={styles.logo}>
      <Image src={StripeLogo} alt="Stripe Logo" />
    </div>
  );
}
