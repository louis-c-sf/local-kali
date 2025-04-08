export enum FreeTrialHubDict {
  salesforce = "salesforce",
  hubspot = "hubspot",
  combined = "combined",
  additionalStaff = "additionalStaff",
}

export type PlatformOptionType =
  | FreeTrialHubDict.salesforce
  | FreeTrialHubDict.hubspot;

export enum FreeTrialStatus {
  noEligible = "noEligible",
  notUsed = "notUsed",
  during = "during",
  cancel = "cancel",
}

export type PlanItemType = {
  freeTrialStatus: keyof typeof FreeTrialStatus;
  isUsedPaidPlan: boolean;
  periodEnd?: string;
};
export type PlanInfoType = {
  additionalStaff?: PlanItemType;
  salesforceCrm: PlanItemType;
  hubspotCrm: PlanItemType;
};
