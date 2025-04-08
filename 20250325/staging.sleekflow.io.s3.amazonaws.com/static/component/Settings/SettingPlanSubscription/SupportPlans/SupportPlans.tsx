import React from "react";
import styles from "../SupportPlans/SupportPlans.module.css";
import { ContactSupportPrompt } from "../ContactSupportPrompt";
import { useTranslation } from "react-i18next";
import SupportPlanCard from "./SupportPlanCard";
import {
  CurrentUserAddOns,
  StripeCheckoutPlans,
} from "../../../../api/User/useSettingsStipeCheckout";
import {
  isPremiumPlan,
  isYearlyPlan,
  PlanType,
} from "../../../../types/PlanSelectionType";
import { TFunction } from "i18next";

const getSupportPlanFeatures: (t: TFunction) => Record<
  string,
  {
    id: string;
    title: string;
    listItems: Record<
      string,
      | {
          title: string;
          listItems: Record<string, string>;
        }
      | Record<string, string>
    >;
    yearlyOnly: boolean;
    consultUs?: string;
  }
> = (t: TFunction) => ({
  onboardingSupport: {
    id: "onboardingSupport",
    title: t("settings.plan.supportPlans.onboardingSupport.title"),
    listItems: t("settings.plan.supportPlans.onboardingSupport.description", {
      returnObjects: true,
    }) as Record<
      string,
      | {
          title: string;
          listItems: Record<string, string>;
        }
      | Record<string, string>
    >,
    yearlyOnly: false,
  },
  prioritySupport: {
    id: "prioritySupport",
    title: t("settings.plan.supportPlans.prioritySupport.title"),
    listItems: t("settings.plan.supportPlans.prioritySupport.description", {
      returnObjects: true,
    }) as Record<
      string,
      | {
          title: string;
          listItems: Record<string, string>;
        }
      | Record<string, string>
    >,
    yearlyOnly: true,
  },
  chatbotAutomationSetup: {
    id: "chatbotAutomationSetup",
    title: t("settings.plan.supportPlans.chatbotAutomationSetup.title"),
    listItems: t(
      "settings.plan.supportPlans.chatbotAutomationSetup.description",
      {
        returnObjects: true,
      }
    ) as Record<
      string,
      | {
          title: string;
          listItems: Record<string, string>;
        }
      | Record<string, string>
    >,
    yearlyOnly: false,
    consultUs: t("settings.plan.supportPlans.chatbotAutomationSetup.consultUs"),
  },
});

const SupportPlans = ({
  currentUserAddOns,
  currentPlan,
  currency,
  stripePlans,
  stripePublicKey,
}: {
  currentUserAddOns: CurrentUserAddOns;
  stripePublicKey: string | undefined;
  currentPlan: PlanType;
  currency: string;
  stripePlans: StripeCheckoutPlans | undefined;
}) => {
  const { t } = useTranslation();
  const supportPlans = getSupportPlanFeatures(t);

  return (
    <div className={`container`}>
      <div className={styles.supportPlanContainer}>
        <div>
          <ContactSupportPrompt
            contactSupportMessage={t(
              "settings.plan.supportPlans.contactSupportMessage"
            )}
            title={t("settings.plan.supportPlans.header")}
          >
            {t("settings.plan.supportPlans.needSupport")}
          </ContactSupportPrompt>
        </div>
        <div className={styles.supportSectionWrapper}>
          {Object.values(supportPlans).map((s) => {
            const isCurrentPlanYearly = isYearlyPlan(currentPlan);
            const isCurrentPlanPremium = isPremiumPlan(currentPlan);
            const supportPlans =
              stripePlans?.supportPlans?.[
                isCurrentPlanYearly ? "yearly" : "monthly"
              ][isCurrentPlanPremium ? "premium" : "pro"]?.[s.id];
            const supportPlanPrice =
              supportPlans?.displayAmount.toLocaleString();
            const isPlanSubscribed = currentUserAddOns[s.id].isSubscribed;

            if (!supportPlanPrice && !s.consultUs) {
              return null;
            }

            return (
              <SupportPlanCard
                isPlanSubscribed={isPlanSubscribed}
                key={s.id}
                yearlyOnly={s.yearlyOnly}
                stripePublicKey={stripePublicKey}
                planId={supportPlans?.id}
                price={supportPlanPrice}
                selectedCurrency={currency}
                listItems={s.listItems}
                supportTitle={s.title}
                consultUs={s?.consultUs}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SupportPlans;
