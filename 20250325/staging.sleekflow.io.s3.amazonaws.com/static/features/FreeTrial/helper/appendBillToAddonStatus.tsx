import moment from "moment";
import { BillRecordsType } from "types/CompanyType";
import {
  FreeTrialHubDict,
  PlanInfoType,
  FreeTrialStatus,
  PlanItemType,
} from "../modules/types";

type BillInfoType = {
  isApplied: boolean;
  isPeriodMatch?: boolean;
  isFreeTrial?: boolean;
  periodEnd?: string;
};

function addPlanEnabledFields() {
  return {
    isUsedPaidPlan: true,
    freeTrialStatus: FreeTrialStatus.notUsed,
  };
}

function addNonPlanEnabledFields() {
  return {
    isUsedPaidPlan: false,
    freeTrialStatus: FreeTrialStatus.notUsed,
  };
}

function addNonFreeTrialEligibleFields(
  useFreeTrialPlan: boolean,
  usePaidPlan: boolean
) {
  return {
    isUsedPaidPlan: useFreeTrialPlan,
    freeTrialStatus: usePaidPlan
      ? FreeTrialStatus.during
      : FreeTrialStatus.noEligible,
  };
}

function addMinimalPlanFields() {
  return {
    isUsedPaidPlan: false,
    freeTrialStatus: FreeTrialStatus.cancel,
  };
}

function addExceptionPlanFields() {
  return {
    isUsedPaidPlan: false,
    freeTrialStatus: FreeTrialStatus.noEligible,
  };
}

function getCRMPlanState(
  isCrmEnabled: boolean | undefined,
  isEligible: boolean | undefined,
  billInfo: BillInfoType
): PlanItemType {
  if (!isCrmEnabled && isEligible) {
    return addNonPlanEnabledFields();
  } else if (isCrmEnabled && !isEligible) {
    if (billInfo.isApplied && billInfo.isPeriodMatch) {
      return addNonFreeTrialEligibleFields(
        !billInfo.isFreeTrial,
        billInfo.isFreeTrial ?? false
      );
    }
  } else if (!isCrmEnabled && !isEligible) {
    return addMinimalPlanFields();
  }
  //unknown
  return addExceptionPlanFields();
}
function getAdditionalStaffState(
  isAdditionalStaffEnabled: boolean | undefined,
  isAdditionalStaffFreeTrialEligible: boolean | undefined,
  billsInfo: BillInfoType[]
): PlanItemType {
  if (isAdditionalStaffEnabled && isAdditionalStaffFreeTrialEligible) {
    return addPlanEnabledFields();
  } else if (!isAdditionalStaffEnabled && isAdditionalStaffFreeTrialEligible) {
    return addNonPlanEnabledFields();
  } else if (isAdditionalStaffEnabled && !isAdditionalStaffFreeTrialEligible) {
    let usePaidPlan = false;
    let useFreeTrialPlan = false;
    billsInfo.forEach((billInfo) => {
      if (
        billInfo.isApplied &&
        billInfo.isPeriodMatch &&
        billInfo.isFreeTrial
      ) {
        useFreeTrialPlan = true;
      } else if (
        billInfo.isApplied &&
        billInfo.isPeriodMatch &&
        !billInfo.isFreeTrial
      ) {
        usePaidPlan = true;
      }
    });
    return addNonFreeTrialEligibleFields(useFreeTrialPlan, usePaidPlan);
  } else if (!isAdditionalStaffEnabled && !isAdditionalStaffFreeTrialEligible) {
    return addMinimalPlanFields();
  }
  //unknown
  return addExceptionPlanFields();
}

const defaultPlanItem = {
  freeTrialStatus: FreeTrialStatus.noEligible,
  isUsedPaidPlan: false,
};
export function appendBillToAddonStatus(
  isAdditionalStaffEnabled: boolean | undefined,
  isAdditionalStaffFreeTrialEligible: boolean | undefined,
  isHubspotIntegrationEnabled: boolean | undefined,
  isHubspotIntegrationFreeTrialEligible: boolean | undefined,
  isSalesforceCrmEnabled: boolean | undefined,
  isSalesforceCrmFreeTrialEligible: boolean | undefined,
  billRecords: BillRecordsType[] | undefined,
  currentPlanString?: string
) {
  const planInfo: PlanInfoType = {
    additionalStaff: defaultPlanItem,
    salesforceCrm: defaultPlanItem,
    hubspotCrm: defaultPlanItem,
  };
  const now = moment();
  const billIdMap = {
    additionalStaff: `sleekflow_v9_agent_${currentPlanString}_monthly`,
    salesforceCrm: `sleekflow_v9_${FreeTrialHubDict.salesforce}_integration`,
    hubspotCrm: `sleekflow_v9_${FreeTrialHubDict.hubspot}_integration`,
  };
  let billStatus = {
    additionalStaff: [] as BillInfoType[],
    salesforceCrm: {} as BillInfoType,
    hubspotCrm: {} as BillInfoType,
  };

  if (billRecords) {
    billRecords.forEach((bill) => {
      const isPeriodMatch =
        now >= moment(bill.periodStart) && now <= moment(bill.periodEnd);
      const isFreeTrial = bill.isFreeTrial;
      Object.entries(billIdMap).forEach(([key, value], _) => {
        if (bill.subscriptionPlan.id.includes(value)) {
          const state = {
            isApplied: bill.subscriptionPlan.id.includes(value),
            isPeriodMatch,
            isFreeTrial,
            periodEnd: bill.periodEnd,
          };
          if (key === "additionalStaff") {
            billStatus.additionalStaff.push(state);
          } else {
            billStatus[key] = state;
          }
        }
      });
    });
  }
  //additional staff
  planInfo.additionalStaff = getAdditionalStaffState(
    isAdditionalStaffEnabled,
    isAdditionalStaffFreeTrialEligible,
    billStatus.additionalStaff
  );

  //salesforce
  planInfo.salesforceCrm = getCRMPlanState(
    isSalesforceCrmEnabled,
    isSalesforceCrmFreeTrialEligible,
    billStatus.salesforceCrm
  );
  planInfo.hubspotCrm = getCRMPlanState(
    isHubspotIntegrationEnabled,
    isHubspotIntegrationFreeTrialEligible,
    billStatus.hubspotCrm
  );
  return planInfo;
}
