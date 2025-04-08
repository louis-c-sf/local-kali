export default interface PlanResponseType {
  publicKey: string;
  plans: PlanType[];
}
export interface PlanType {
  id: string;
  subscriptionName: string;
  description: string;
  amount: number;
  currency: string;
  maximumContact: number;
  maximumMessageSent: number;
  maximumCampaignSent: number;
  includedAgents: number;
  maximumChannel: boolean;
  extraChatAgentPlan?: string;
  extraChatAgentPrice: number;
  subscriptionTier: number;
}
export enum SubscriptionTier {
  Free = 0,
  Pro = 1,
  Premium = 2,
  Enterprise = 3,
  AddOn = 4,
  Agent = 5,
}
export interface PlanDisplayType {
  stripePlanId?: string;
  planId: string;
  planTitle: string;
  price: string;
  currency?: string;
  priceDescription: string;
  planDescriptions: string[];
  planDetailDescriptions: string[];
  agentIncluded: number;
  extraChatAgentPrice: number;
  messageTotal?: number;
  selectTooltip?: string;
}

export function isPlanType(x: any): x is PlanType {
  return (
    typeof x.id === "string" &&
    typeof x.subscriptionName === "string" &&
    typeof x.includedAgents === "number"
  );
}

export function isFreeOrFreemiumPlan(plan: PlanType | PlanDisplayType) {
  if (isPlanType(plan)) {
    return (
      plan.id.toLowerCase() === "sleekflow_free" ||
      plan.id.toLowerCase() === "sleekflow_freemium" ||
      plan.id.toLowerCase() === "sleekflow_v10_startup"
    );
  } else {
    return (
      plan.planId.toLowerCase() === "sleekflow_free" ||
      plan.planId.toLowerCase() === "sleekflow_freemium" ||
      plan.planId.toLowerCase() === "sleekflow_v10_startup"
    );
  }
}

export function isProPlan(plan: PlanType | PlanDisplayType) {
  if (isPlanType(plan)) {
    return /pro/i.test(plan.id);
  }
  return /pro/i.test(plan.planId);
}

export function isEnterprisePlan(plan: PlanType | PlanDisplayType) {
  if (isPlanType(plan)) {
    return /enterprise/i.test(plan.id);
  }
  return /enterprise/i.test(plan.planId);
}

export function isPremiumPlan(plan: PlanType | PlanDisplayType) {
  if (isPlanType(plan)) {
    return /premium/i.test(plan.id);
  }
  return /premium/i.test(plan.planId);
}

export function isYearlyPlan(plan: PlanType | PlanDisplayType) {
  if (isPlanType(plan)) {
    return /yearly/i.test(plan.id);
  }
  return /yearly/i.test(plan.planId);
}

export function isFreePlan(plan: PlanType | PlanDisplayType) {
  if (isPlanType(plan)) {
    return plan.id.toLowerCase() === "sleekflow_free";
  } else {
    return plan.planId.toLowerCase() === "sleekflow_free";
  }
}

export function isStandardPlan(plan: PlanType | PlanDisplayType) {
  if (isPlanType(plan)) {
    return /standard/i.test(plan.id.toLowerCase());
  } else {
    return /standard/i.test(plan.planId.toLowerCase());
  }
}

export function isFreemiumPlan(plan: PlanType | PlanDisplayType) {
  if (isPlanType(plan)) {
    return plan.id.toLowerCase() === "sleekflow_freemium";
  } else {
    return plan.planId.toLowerCase() === "sleekflow_freemium";
  }
}

export function isDemoPlan(plan: PlanType | PlanDisplayType) {
  if (isPlanType(plan)) {
    return /sleekflow_demo/.test(plan.id.toLowerCase());
  } else {
    return /sleekflow_demo/.test(plan.planId.toLowerCase());
  }
}
