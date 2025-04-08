import React from "react";
import ShopifyStoreField from "./ShopifyStoreField";
import { Button } from "component/shared/Button/Button";
import styles from "../StripeOnboardingSteps.module.css";
import { ShopifyStoreResponseType } from "api/Company/useFetchShopifyStoreList";
import { useTranslation } from "react-i18next";
import { useStripeOnboardingStep } from "../StripeOnboardingStepProvider";
import { FieldArray, Formik, FormikHelpers } from "formik";
import { putMethod } from "api/apiRequest";
import { PUT_SHOPIFY_STATUS } from "api/apiPath";
import { useFlashMessageChannel } from "component/BannerMessage/flashBannerMessage";
import { Loader } from "semantic-ui-react";
import { useHistory } from "react-router";

interface ShopifyStore extends ShopifyStoreResponseType {
  enabled: boolean;
  shopName: string;
}

export interface ShopifyStoreConnectFormValues {
  stores: ShopifyStore[];
}

export default function ShopifyStoreConnectForm({
  shopifyStores,
}: {
  shopifyStores?: ShopifyStoreResponseType[];
}) {
  const { t } = useTranslation();
  const { goToNextStep } = useStripeOnboardingStep();
  const flash = useFlashMessageChannel();
  const history = useHistory();

  // Remove "stripe-linked" param
  function proceed() {
    history.replace({ search: "" });
    goToNextStep();
  }

  async function onFormSubmit(
    values: ShopifyStoreConnectFormValues,
    { setSubmitting }: FormikHelpers<ShopifyStoreConnectFormValues>
  ) {
    try {
      const inputs = values.stores.map((store) => ({
        name: store.shopName,
        shopifyId: store.id,
        isShowInInbox: store.isShowInInbox,
      }));

      await Promise.all(
        inputs.map(async (input) =>
          putMethod(
            PUT_SHOPIFY_STATUS.replace("{shopifyId}", input.shopifyId),
            {
              param: { name: input.name, isShowInInbox: input.isShowInInbox },
            }
          )
        )
      );
      flash(t("flash.stripe.success.update-name"));
      proceed();
    } catch (e) {
      console.error(e);
      flash(t("flash.stripe.error.update-name"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <p className={styles.chooseStoreTitle}>
        {t("onboarding.stripe.importProducts.title")}
      </p>
      <Formik
        onSubmit={onFormSubmit}
        initialValues={{
          stores:
            shopifyStores?.map((store) => ({
              enabled: false,
              shopName: store.name ?? "",
              ...store,
            })) || [],
        }}
      >
        {({ values, submitForm, isSubmitting }) => {
          const isAllDisabled = values.stores?.every((store) => !store.enabled);
          const isAllShopNameFilled = values.stores?.every((store) => {
            if (store.enabled) {
              return store.shopName !== "";
            }
            return true;
          });

          const canProceed = !isAllDisabled && isAllShopNameFilled;

          return (
            <>
              <FieldArray name="stores">
                {() => (
                  <div className={styles.storeGroup}>
                    {values.stores?.map((store, index) => (
                      <ShopifyStoreField key={store.id} index={index} />
                    ))}
                  </div>
                )}
              </FieldArray>
              <div className={styles.accessList}>
                <p>{t("onboarding.stripe.importProducts.accessList.header")}</p>
                <ul>
                  <li>
                    {t("onboarding.stripe.importProducts.accessList.viewOrder")}
                  </li>
                  <li>
                    {t(
                      "onboarding.stripe.importProducts.accessList.viewStoreInfo"
                    )}
                  </li>
                </ul>
              </div>
              <div className={styles.buttonGroup}>
                <Button
                  primary
                  className="fluid"
                  onClick={submitForm}
                  disabled={!canProceed || isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader active inline size="tiny" />
                  ) : (
                    t("onboarding.ig.next")
                  )}
                </Button>
                <Button type="button" className="fluid" onClick={proceed}>
                  {t("onboarding.stripe.skipForNow")}
                </Button>
              </div>
            </>
          );
        }}
      </Formik>
    </>
  );
}
