import React from "react";
import { ContactSupportPrompt } from "../ContactSupportPrompt";
import {
  isFreeOrFreemiumPlan,
  PlanType,
} from "../../../../types/PlanSelectionType";
import SettingAddOnCard from "./SettingAddOnCard";
import {
  INTEGRATION_FEATURES_ADDONS,
  NORMAL_ADDITIONAL_CONTACT,
} from "../SettingPlanUtils";
import { Trans, useTranslation } from "react-i18next";
import {
  CurrentUserAddOns,
  StripeCheckoutPlans,
} from "../../../../api/User/useSettingsStipeCheckout";
import commonStyles from "./SettingAddOn.module.css";
import { TFunction } from "i18next";
import styles from "./SettingAddOnCard.module.css";
import { MonthlyPrice } from "features/FreeTrial/modules/FreeTriaMonthlyPriceDict";
import {
  FreeTrialHubDict,
  FreeTrialStatus,
} from "features/FreeTrial/modules/types";
import { getIntegrationFeaturePlanDetails } from "component/Settings/helpers/getIntegrationFeaturePlanDetails";

const getIntegrationFeaturesAddOn: (t: TFunction) => Record<
  string,
  {
    id: typeof INTEGRATION_FEATURES_ADDONS[number];
    title: string;
    description: string;
    consultUs?: string;
    getPriceLabel?: ({
      selectedCurrency,
      price,
    }: {
      selectedCurrency: string;
      price: string | number;
    }) => React.ReactNode;
    getAddOnLink?: ({
      planId,
      freeTrialStatus,
    }: {
      planId: string;
      freeTrialStatus: string | undefined;
    }) => string | undefined;
  }
> = (t: TFunction) => ({
  shopifyIntegration: {
    id: "shopifyIntegration",
    title: t(
      "settings.plan.addOn.integrationFeatures.shopifyIntegration.title"
    ),
    description: t(
      "settings.plan.addOn.integrationFeatures.shopifyIntegration.description"
    ),
  },
  paymentIntegration: {
    id: "paymentIntegration",
    title: t(
      "settings.plan.addOn.integrationFeatures.paymentIntegration.title",
      {
        quota: NORMAL_ADDITIONAL_CONTACT,
      }
    ),
    description: t(
      "settings.plan.addOn.integrationFeatures.paymentIntegration.description"
    ),
  },
  hubspotIntegration: {
    id: "hubspotIntegration",
    title: t(
      "settings.plan.addOn.integrationFeatures.hubspotIntegration.title"
    ),
    description: t(
      "settings.plan.addOn.integrationFeatures.hubspotIntegration.description"
    ),
    consultUs: t(
      "settings.plan.addOn.integrationFeatures.hubspotIntegration.consultUsMessage"
    ),
    getAddOnLink: ({
      planId,
      freeTrialStatus,
    }: {
      planId: string;
      freeTrialStatus: string | undefined;
    }) => {
      return freeTrialStatus && freeTrialStatus === FreeTrialStatus.notUsed
        ? `/free-trial/intro/${FreeTrialHubDict.hubspot}`
        : undefined;
    },
  },
  salesforceCRMIntegration: {
    id: "salesforceCRMIntegration",
    title: t(
      "settings.plan.addOn.integrationFeatures.salesforceCRMIntegration.title"
    ),
    description: t(
      "settings.plan.addOn.integrationFeatures.salesforceCRMIntegration.description"
    ),
    consultUs: t(
      "settings.plan.addOn.integrationFeatures.salesforceCRMIntegration.consultUsMessage"
    ),
    getAddOnLink: ({
      planId,
      freeTrialStatus,
    }: {
      planId: string;
      freeTrialStatus: string | undefined;
    }) => {
      return freeTrialStatus && freeTrialStatus === FreeTrialStatus.notUsed
        ? `/free-trial/intro/${FreeTrialHubDict.salesforce}`
        : undefined;
    },
  },
});

const IntegrationFeaturesSection = ({
  stripePlans,
  currentPlan,
  currency,
  stripePublicKey,
  currentUserAddOns,
}: {
  currentUserAddOns: CurrentUserAddOns;
  stripePlans: StripeCheckoutPlans | undefined;
  currentPlan: PlanType;
  currency: string;
  stripePublicKey: string | undefined;
}) => {
  const { t } = useTranslation();
  const integrationFeatures = getIntegrationFeaturesAddOn(t);

  return (
    <div className={commonStyles.addOnContainer}>
      <div className={commonStyles.leftContainer}>
        <ContactSupportPrompt
          contactSupportMessage={t("settings.plan.addOn.contactSupportMessage")}
          title={t("settings.plan.integrationFeatures")}
        >
          {t("settings.plan.addOn.integrationFeatures.needSupport")}
        </ContactSupportPrompt>
      </div>

      <div className={commonStyles.addOnSectionWrapper}>
        {Object.values(integrationFeatures).map((f) => {
          const isCurrentPlanFree = isFreeOrFreemiumPlan(currentPlan);
          const integrationFeaturePlanDetails =
            getIntegrationFeaturePlanDetails(
              currentPlan,
              stripePlans?.addOnPlans?.integrationFeatures,
              f.id
            );
          const isPaidPlanSubscribed = currentUserAddOns?.[f.id]?.isSubscribed;
          const upperCurrency = currentPlan.currency.toUpperCase();
          const monthlyPrice =
            f.id === "salesforceCRMIntegration"
              ? MonthlyPrice[upperCurrency]["salesforce"]
              : MonthlyPrice[upperCurrency]["hubspot"];
          const hasFreeTrialMode =
            ["hubspotIntegration", "salesforceCRMIntegration"].includes(f.id) &&
            !isCurrentPlanFree;
          const freeTrialStatus = hasFreeTrialMode
            ? currentUserAddOns[f.id].freeTrialStatus
            : undefined;
          const periodEnd = hasFreeTrialMode
            ? currentUserAddOns[f.id].periodEnd
            : undefined;
          const price = hasFreeTrialMode
            ? monthlyPrice
            : integrationFeaturePlanDetails?.displayAmount ?? "";
          if (!price && !f?.consultUs) {
            return null;
          }
          return (
            <SettingAddOnCard
              planId={integrationFeaturePlanDetails?.id}
              stripePublicKey={stripePublicKey}
              isPaidPlanSubscribed={isPaidPlanSubscribed}
              key={f.id}
              id={f.id}
              description={f.description}
              addOnTitle={f.title}
              price={
                f.getPriceLabel ? (
                  f.getPriceLabel({
                    selectedCurrency: currency,
                    price,
                  })
                ) : (
                  <Trans
                    values={{
                      currency,
                      price,
                    }}
                    i18nKey={"settings.plan.priceLabel"}
                  >
                    Free
                    <span className={styles.pricePeriodLabel}>Lifetime</span>
                  </Trans>
                )
              }
              consultUs={f?.consultUs}
              hasFreeTrialMode={hasFreeTrialMode}
              freeTrialStatus={freeTrialStatus}
              periodEnd={periodEnd}
              addOnLink={
                f?.getAddOnLink &&
                integrationFeaturePlanDetails?.id &&
                f.getAddOnLink({
                  planId: integrationFeaturePlanDetails.id,
                  freeTrialStatus,
                })
              }
            />
          );
        })}
      </div>
    </div>
  );
};

export default IntegrationFeaturesSection;
