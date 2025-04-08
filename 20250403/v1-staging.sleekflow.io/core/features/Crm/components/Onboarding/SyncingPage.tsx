import React, { useEffect } from "react";
import SalesForceImg from "assets/images/channels/salesforce.svg";
import HubspotImg from "assets/images/channels/hubspot.svg";
import { Image } from "semantic-ui-react";
import styles from "./SyncingPage.module.css";
import { Button } from "component/shared/Button/Button";
import { useTranslation } from "react-i18next";
import { ProviderType } from "core/features/Crm/API/Onboarding/contracts";
import useFetchCompany from "api/Company/useFetchCompany";

const logoImag = {
  "salesforce-integrator": SalesForceImg,
  "hubspot-integrator": HubspotImg,
};

const logoStyle = {
  "salesforce-integrator": styles.salesforceImg,
  "hubspot-integrator": styles.hubspotImg,
};

export default function SyncingPage(props: {
  providerType: ProviderType;
  titleText: string;
  btnText: string;
  onBtnClick: () => void;
}) {
  const { btnText, onBtnClick, titleText, providerType } = props;
  const { t } = useTranslation();
  const { refreshCompany } = useFetchCompany();

  useEffect(() => {
    refreshCompany();
  }, []);

  return (
    <div className={`container ${styles.container}`}>
      <div className={styles.imageWrapper}>
        <Image
          src={logoImag[providerType]}
          className={logoStyle[providerType]}
        />
      </div>
      <div className={styles.title}>{titleText}</div>
      <div className={styles.desc}>
        {t("onboarding.crm.stepSyncing.description")}
      </div>
      <Button primary customSize="mid" fluid onClick={onBtnClick}>
        {btnText}
      </Button>
    </div>
  );
}
