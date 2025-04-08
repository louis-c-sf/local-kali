import React from "react";
import paymentStyles from "./StripePayment.module.css";
import { Image } from "semantic-ui-react";
import flashIcon from "./assets/flash.svg";

export default function Footer(props: { className: string }) {
  const { className } = props;
  return (
    <div className={className}>
      <span>Powered by</span>
      <Image src={flashIcon} className={paymentStyles.flashIcon} />
      <a target="_blank" rel="noreferrer" href="https://sleekflow.io">
        SleekFlow
      </a>
    </div>
  );
}
