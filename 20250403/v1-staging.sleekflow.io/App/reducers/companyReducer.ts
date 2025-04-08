import { Action, LoginType } from "../../types/LoginType";
import produce from "immer";
import { reduceReducers } from "../../utility/reduce-reducers";
import { initialUser } from "../../context/LoginContext";

export const emptyCompanyReducer = produce(
  (draft: LoginType = initialUser, action: Action) => {
    switch (action.type) {
      case "ADD_COMPANY":
        draft.user.signalRGroupName = action.company.signalRGroupName;
        if (draft.company?.isGlobalPricingFeatureEnabled) {
          action.company.isGlobalPricingFeatureEnabled =
            draft.company.isGlobalPricingFeatureEnabled;
        }
        draft.company = action.company;
        if (
          draft.selectedTimeZone === 0 &&
          action.company.timeZoneInfo &&
          !draft.loggedInUserDetail
        ) {
          draft.selectedTimeZone =
            action.company.timeZoneInfo.baseUtcOffsetInHour;
        }
        break;
      case "UPDATE_COMPANY_INFO":
        if (draft.company) {
          const { isSubscriptionActive, billRecords, ...restFields } =
            action.company;
          draft.company = {
            ...draft.company,
            ...restFields,
          };
        } else {
          draft.company = action.company;
        }
        break;
    }
  }
);

export const nonemptyCompanyReducer = produce(
  (draft: LoginType = initialUser, action: Action) => {
    if (!draft.company) {
      return;
    }
    switch (action.type) {
      case "APPEND_COMPANY_TAGS":
        const tagsBefore = draft.company?.companyHashtags ?? [];
        draft.company.companyHashtags = [...tagsBefore, ...action.tags];
        break;

      case "UPDATE_COMPANY_TAGS":
        if (draft.company) {
          draft.company.companyHashtags = action.tags;
        }
        break;
      case "UPDATE_COMPANY_GLOBAL_PRICING_FEATURE_INFO":
        if (draft.company) {
          draft.company.isGlobalPricingFeatureEnabled =
            action.isGlobalPricingFeatureEnabled;
        }
    }
  }
);
export const companyReducer = reduceReducers(
  emptyCompanyReducer,
  nonemptyCompanyReducer
);
