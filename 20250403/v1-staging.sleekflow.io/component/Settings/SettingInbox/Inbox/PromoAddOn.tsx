import React from "react";
import { useTranslation } from "react-i18next";
import { Button, Image } from "semantic-ui-react";
import MoreFeatureIcon from "./assets/more-feature.svg";
import styles from "./PromoAddOn.module.css";

const PromoAddOn = () => {
  const { t } = useTranslation();
  return (
    <>
      <div className={styles.promoAddOn}>
        <div>
          <Image src={MoreFeatureIcon} />
          <span>{t("settings.inbox.contacts.promoAddOn.title")}</span>
        </div>
        <Button
          primary
          onClick={() => {
            window.open("/settings/plansubscription", "_blank");
          }}
        >
          {t("settings.inbox.contacts.promoAddOn.button")}
        </Button>
      </div>
      <div className={styles.promoAddOnSizeBox} />
    </>
  );
};

const PromoAddOnMemoized = React.memo(PromoAddOn);

export default PromoAddOnMemoized;
