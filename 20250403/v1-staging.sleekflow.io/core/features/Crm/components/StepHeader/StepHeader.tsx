import React from "react";
import { Image } from "semantic-ui-react";
import styles from "./StepHeader.module.css";
import SalesForceImg from "assets/images/channels/salesforce.svg";
import HubspotImg from "assets/images/channels/hubspot.svg";
import { ProviderType } from "../../API/Onboarding/contracts";

const logoImag = {
  "salesforce-integrator": SalesForceImg,
  "hubspot-integrator": HubspotImg,
};

const logoStyle = {
  "salesforce-integrator": styles.salesforceImg,
  "hubspot-integrator": styles.hubspotImg,
};

export default function StepHeader(props: {
  title: string;
  subtitle: string;
  provider: ProviderType;
}) {
  const { title, subtitle, provider } = props;
  return (
    <div className={styles.header}>
      <div className={styles.imageWrapper}>
        <Image src={logoImag[provider]} className={logoStyle[provider]} />
      </div>
      <div className={styles.titleWrapper}>
        <div className={styles.title}>{title}</div>
        <div className={styles.subTitle}>{subtitle}</div>
      </div>
    </div>
  );
}
