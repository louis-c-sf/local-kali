import React from "react";
import mainStyles from "../StripeOnboardingScreen.module.css";
import styles from "../StripeOnboardingSteps.module.css";
import { useTranslation } from "react-i18next";
import { Button } from "component/shared/Button/Button";
import { useStripeOnboardingStep } from "../StripeOnboardingStepProvider";
import ShopifyImg from "component/Channel/Onboarding/assets/shopify/shopify.svg";
import { Image, Loader } from "semantic-ui-react";
import { useHistory } from "react-router";
import useRouteConfig from "config/useRouteConfig";
import { useFetchShopifyStoreList } from "api/Company/useFetchShopifyStoreList";
import ShopifyStoreConnectForm from "./ShopifyStoreConnectForm";

export default function StripeImportProductStep() {
  const { t } = useTranslation();
  const { goToNextStep } = useStripeOnboardingStep();
  const history = useHistory();
  const { routeTo } = useRouteConfig();

  const { data: shopifyStores, loading, error } = useFetchShopifyStoreList();

  if (loading) {
    return (
      <div className={mainStyles.contentContainer}>
        <Loader active />
      </div>
    );
  }

  if (error) {
    return (
      <div className={mainStyles.contentContainer}>
        {t("somethingWentWrong")}
      </div>
    );
  }

  const hasShopifyStores = shopifyStores ? shopifyStores.length > 0 : false;

  return (
    <div className={mainStyles.contentContainer}>
      {hasShopifyStores ? (
        <ShopifyStoreConnectForm shopifyStores={shopifyStores} />
      ) : (
        <>
          <div className={styles.connectShopifyContainer}>
            <Image src={ShopifyImg} alt="Shopify" />
            <p>{t("onboarding.stripe.importProducts.connectShopify")}</p>
          </div>
          <div className={styles.buttonGroup}>
            <Button
              primary
              className="fluid"
              onClick={() => history.push(routeTo("/channels/shopify"))}
            >
              {t("onboarding.stripe.connectNow")}
            </Button>
            <Button className="fluid" onClick={goToNextStep}>
              {t("onboarding.stripe.skipForNow")}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
