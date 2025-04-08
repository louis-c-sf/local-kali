import PlanResponseType, {
  PlanDisplayType,
} from "../../types/PlanSelectionType";
import React, { useContext, useEffect, useState } from "react";
import { SettingSelectPlanList } from "../../config/PlanSelectionConfig";
import { StripeCheckoutType } from "../../types/LoginType";
import { useAppSelector } from "../../AppRootContext";

export default function useSubscriptionPlans(
  onPlansLoaded: (list: PlanDisplayType[]) => any,
  dependencies: any[]
) {
  const stripeCheckout = useAppSelector((s) => s.stripeCheckout);

  const getPlanDetails = () => {
    if (!stripeCheckout) {
      return;
    }
    try {
      const selectionPlanList = transformStripeCheckoutToDisplayPlans(
        stripeCheckout
      );
      onPlansLoaded(selectionPlanList);
    } catch (e) {
      console.error("getPlanDetails", e);
    }
  };

  useEffect(() => {
    getPlanDetails();
  }, [...dependencies, JSON.stringify(stripeCheckout)]);
}

export function transformStripeCheckoutToDisplayPlans(
  result: StripeCheckoutType
) {
  return result.plans
    .filter(
      (plan) =>
        plan.subscriptionName.toLowerCase().includes("v2") ||
        plan.subscriptionName.toLowerCase().includes("whatsapp")
    )
    .map((plan) => {
      const foundIndex = SettingSelectPlanList.findIndex(
        (settingSelectPlan) => plan.id === settingSelectPlan.planId
      );
      if (foundIndex > -1) {
        const selectionPlan = SettingSelectPlanList[foundIndex];
        const foundPlanDescription = selectionPlan.planDescriptions.findIndex(
          (planDescription) => planDescription.includes("${contact}")
        );
        if (foundIndex > -1 && foundPlanDescription > -1) {
          selectionPlan.planDescriptions[
            foundPlanDescription
          ] = selectionPlan.planDescriptions[foundPlanDescription].replace(
            "${contact}",
            result.plans[foundIndex].maximumContact + ""
          );
        }
        return {
          ...selectionPlan,
          currency: plan.currency,
          planDescriptions: selectionPlan.planDescriptions,
          price: plan.amount + "",
          planId: plan.id,
          stripePlanId: "",
        };
      } else {
        return {
          planTitle: plan.subscriptionName,
          planMainDescription: "",
          priceDescription: "",
          planDetailDescriptions: [""],
          agentIncluded: plan.includedAgents,
          extraChatAgentPrice: plan.extraChatAgentPrice,
          planDescriptions: [""],
          price: plan.amount + "",
          planId: plan.id,
          currency: plan.currency,
          stripePlanId: "",
        };
      }
    });
}
