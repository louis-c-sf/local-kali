import React from "react";
import { ContactSupportPrompt } from "../ContactSupportPrompt";
import {
  isEnterprisePlan,
  isFreeOrFreemiumPlan,
  isPremiumPlan,
  PlanType,
} from "../../../../types/PlanSelectionType";
import SettingAddOnCard from "./SettingAddOnCard";
import {
  CORE_FEATURES_ADDONS,
  EXTRA_ADDITIONAL_CONTACT,
  HIDE_CURRENCY_SWITCHER_CURRENCIES,
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
import { FreeTrialStatus } from "features/FreeTrial/modules/types";
import { getIntegrationFeaturePlanDetails } from "component/Settings/helpers/getIntegrationFeaturePlanDetails";

const getCoreFeaturesAddOn: (t: TFunction) => Record<
  string,
  {
    id: typeof CORE_FEATURES_ADDONS[number];
    title: string | ((quota: number | string) => string);
    allowEdit?: boolean;
    description: string;
    getQuotaLabel?: (quota: string | number | undefined) => string;
    getAddOnLink?: ({
      planId,
      currency,
      freeTrialStatus,
    }: {
      planId: string;
      currency: string;
      freeTrialStatus?: string;
    }) => string;
    getPriceLabel?: ({
      selectedCurrency,
      price,
    }: {
      selectedCurrency: string;
      price: string | number;
    }) => React.ReactNode;
    consultUs?: string;
  }
> = (t: TFunction) =>
  ({
    additionalStaffLogin: {
      id: "additionalStaffLogin",
      title: t("settings.plan.addOn.coreFeatures.additionalStaffLogin.title"),
      description: t(
        "settings.plan.addOn.coreFeatures.additionalStaffLogin.description"
      ),
      allowEdit: true,
      getQuotaLabel: (quota: string | number | undefined) =>
        t("settings.plan.addOn.coreFeatures.additionalStaffLogin.quota", {
          quota,
        }),
      getAddOnLink: ({
        planId,
        currency,
        freeTrialStatus,
      }: {
        planId: string;
        currency: string;
        freeTrialStatus?: string;
      }) => {
        return freeTrialStatus && freeTrialStatus === FreeTrialStatus.notUsed
          ? "/free-trial/intro/additionalStaff"
          : `/subscriptions/add-ons/additional-staff?planId=${planId}&currency=${currency}`;
      },
      getPriceLabel: ({
        selectedCurrency,
        price,
      }: {
        selectedCurrency: string;
        price: string | number;
      }) => (
        <Trans
          values={{ currency: selectedCurrency, price: price }}
          i18nKey={
            "settings.plan.addOn.coreFeatures.additionalStaffLogin.priceLabel"
          }
        >
          Free
          <span className={styles.pricePeriodLabel}>Lifetime</span>
        </Trans>
      ),
    },
    additionalContacts: {
      id: "additionalContacts",
      allowEdit: true,
      title: (quota: string | number) =>
        t("settings.plan.addOn.coreFeatures.additionalContacts.title", {
          quota,
        }),
      description: t(
        "settings.plan.addOn.coreFeatures.additionalContacts.description"
      ),
      getQuotaLabel: (quota: string | number | undefined) =>
        t("settings.plan.addOn.coreFeatures.additionalContacts.quota", {
          quota,
        }),
      getAddOnLink: ({
        planId,
        currency,
      }: {
        planId: string;
        currency: string;
      }) =>
        `/subscriptions/add-ons/additional-contacts?planId=${planId}&currency=${currency}`,
    },
    unlimitedMessagingChannels: {
      id: "unlimitedMessagingChannels",
      title: t(
        "settings.plan.addOn.coreFeatures.unlimitedMessagingChannels.title"
      ),
      description: t(
        "settings.plan.addOn.coreFeatures.unlimitedMessagingChannels.description"
      ),
    },
    contactMasking: {
      id: "sensitiveDataMasking",
      title: t("settings.plan.addOn.coreFeatures.contactMasking.title"),
      description: t(
        "settings.plan.addOn.coreFeatures.contactMasking.description"
      ),
    },
    whatsappQrCode: {
      id: "whatsappQrCode",
      title: t("settings.plan.addOn.coreFeatures.whatsappQrCode.title"),
      description: t(
        "settings.plan.addOn.coreFeatures.whatsappQrCode.description"
      ),
    },
  } as const);

const CoreFeaturesSection = ({
  stripePlans,
  currentPlan,
  currency,
  currentUserAddOns,
  stripePublicKey,
}: {
  stripePlans: StripeCheckoutPlans | undefined;
  currentPlan: PlanType;
  currency: string;
  currentUserAddOns: CurrentUserAddOns;
  stripePublicKey: string | undefined;
}) => {
  const { t } = useTranslation();
  const coreFeatures = getCoreFeaturesAddOn(t);
  return (
    <div
      className={`${commonStyles.addOnContainer} ${commonStyles.addOnContainerCoreFeatures}`}
    >
      <ContactSupportPrompt
        contactSupportMessage={t("settings.plan.addOn.contactSupportMessage")}
        title={t("settings.plan.coreFeatures")}
      >
        {t("settings.plan.selection.section.addOn.needSupport")}
      </ContactSupportPrompt>

      <div className={commonStyles.addOnSectionWrapper}>
        {Object.values(coreFeatures).map((f) => {
          const isCurrentPlanPremium = isPremiumPlan(currentPlan);
          const isCurrentPlanEnterprise = isEnterprisePlan(currentPlan);
          const isCurrentPlanFree = isFreeOrFreemiumPlan(currentPlan);
          const currentPlanString = isCurrentPlanPremium ? "premium" : "pro";
          const coreFeaturePlanDetails = getIntegrationFeaturePlanDetails(
            currentPlan,
            stripePlans?.addOnPlans?.coreFeatures,
            f.id
          );
          const isAdditionalContactsSubscribed =
            currentUserAddOns.additionalContacts.isSubscribed;
          const isPaidPlanSubscribed = currentUserAddOns?.[f.id]?.isSubscribed;
          const quota = currentUserAddOns?.[f.id]?.quota;
          const getQuotaLabelFunc = f?.getQuotaLabel;
          const quotaLabel = getQuotaLabelFunc && getQuotaLabelFunc(quota);
          const additionalContactsQuota =
            HIDE_CURRENCY_SWITCHER_CURRENCIES.includes(currency)
              ? EXTRA_ADDITIONAL_CONTACT
              : NORMAL_ADDITIONAL_CONTACT;
          const price = coreFeaturePlanDetails?.displayAmount ?? "";
          if (!price && !f?.consultUs) {
            return null;
          }

          return (
            <SettingAddOnCard
              allowEdit={f?.allowEdit}
              consultUs={f?.consultUs}
              addOnLink={
                f?.getAddOnLink &&
                coreFeaturePlanDetails?.id &&
                f.getAddOnLink({
                  planId: coreFeaturePlanDetails.id,
                  currency,
                })
              }
              isAdditionalContactsSubscribed={isAdditionalContactsSubscribed}
              planId={coreFeaturePlanDetails?.id}
              stripePublicKey={stripePublicKey}
              key={f.id}
              id={f.id}
              isPaidPlanSubscribed={isPaidPlanSubscribed}
              description={f.description}
              addOnTitle={
                typeof f.title === "string"
                  ? f.title
                  : f.title(additionalContactsQuota)
              }
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
              currentQuotaLabel={quotaLabel}
            />
          );
        })}
      </div>
    </div>
  );
};

export default CoreFeaturesSection;
